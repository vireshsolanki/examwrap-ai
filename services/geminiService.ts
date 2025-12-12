import { GoogleGenAI, Type } from "@google/genai";
import { Topic, Question, Difficulty, ExamResult, RevisionPlan, UserAnswer, QuestionType, SubjectAnalysis, ExamConfig, ExamProbability, SubjectContext } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

// Helper to clean potential Markdown code blocks from JSON string
const cleanJSON = (text: string | undefined): string => {
  if (!text) return "{}";
  let cleaned = text.trim();
  
  // 1. Try to find markdown block explicitly
  const jsonBlockMatch = cleaned.match(/```json\s*([\s\S]*?)\s*```/i);
  if (jsonBlockMatch) {
      return jsonBlockMatch[1];
  }

  // 2. Try to find generic code block if json tag is missing
  const codeBlockMatch = cleaned.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
      return codeBlockMatch[1];
  }

  // 3. Fallback: if it starts with ``` remove it (legacy check)
  if (cleaned.startsWith('```')) {
     cleaned = cleaned.replace(/^```(json)?/, '').replace(/```$/, '');
  }
  
  // 4. Final safety: If no blocks found, look for first { and last } to handle "Here is JSON: {...}"
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  // Check for array brackets too
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');

  // Determine which wrapper is outer
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace) && lastBracket > firstBracket) {
      return cleaned.substring(firstBracket, lastBracket + 1);
  }
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned.trim();
};

const safeParseJSON = (text: string | undefined, fallback: any) => {
    try {
        return JSON.parse(cleanJSON(text));
    } catch (e) {
        console.warn("Failed to parse JSON:", e, "\nInput text:", text);
        return fallback;
    }
};

// 1. Identify Subject (Initial Guess)
export const identifySubject = async (content: string): Promise<SubjectAnalysis> => {
  const prompt = `
    Analyze the start of this document. 
    1. Identify the likely Subject Name (e.g., "Calculus II", "Marketing 101").
    2. Identify the likely Exam Context (e.g., "University Final", "AP Exam", "Certification", "Entrance Test").
    3. Provide a brief 1-sentence summary of what this material covers.
    
    Content Preview:
    ${content.substring(0, 5000)}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subjectName: { type: Type.STRING },
          examType: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          summary: { type: Type.STRING }
        }
      }
    }
  });

  return safeParseJSON(response.text, {});
};

// 2. Generate Syllabus Map (Context Aware)
export const generateSyllabus = async (content: string, context: SubjectContext): Promise<Topic[]> => {
  const prompt = `
    You are an expert curriculum designer for ${context.subjectName} targeting ${context.examType}.
    Analyze the provided study material and extract a structured syllabus suitable for this specific exam goal.
    Return a list of Main Topics, each with subtopics.
    
    Material (first 25k chars):
    ${content.substring(0, 25000)} 
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            subtopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    }
  });

  const parsed = safeParseJSON(response.text, []);
  // Ensure we filter out nulls or malformed objects from AI hallucination
  return Array.isArray(parsed) ? parsed.filter(t => t && t.id && t.name) : [];
};

// 3. Generate Questions (Dynamic Config)
export const generateExamQuestions = async (
    content: string, 
    topics: Topic[], 
    config: ExamConfig,
    context: SubjectContext
): Promise<Question[]> => {
  
  const selectedTopicNames = config.focusTopics.length > 0 
    ? config.focusTopics.join(", ") 
    : "All Topics";
    
  const typeRequests = config.questionTypes.join(", ");

  const prompt = `
    Role: Expert Exam Creator for ${context.subjectName} (${context.examType}).
    Context: Creating a high-quality practice assessment.
    Task: Generate exactly ${config.questionCount} questions based on the content provided.
    
    Requirements:
    1. Question Types: Only generate [${typeRequests}].
    2. Probability: Assign 'High', 'Medium', or 'Low' probability (how likely this concept is to appear in ${context.examType}).
    3. Explanation: 
       - For MCQs: Provide a detailed explanation of the correct answer AND explain why each distractor is incorrect.
       - For Text: Provide the key marking points.
    4. Difficulty: Adaptive mix.
    
    Output Format: JSON Array of Questions.
    
    Material Context (excerpt):
    ${content.substring(0, 20000)}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["MCQ", "ShortAnswer", "LongAnswer"] },
            text: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndex: { type: Type.INTEGER },
            modelAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
            probability: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            topicName: { type: Type.STRING },
          }
        }
      }
    }
  });

  const rawQuestions = safeParseJSON(response.text, []);
  
  if (!Array.isArray(rawQuestions)) return [];

  return rawQuestions.map((q: any, index: number) => ({
    ...q,
    id: `q-${index}-${Date.now()}`,
    topicId: topics.find(t => t.name === q.topicName)?.id || 'general'
  }));
};

// 4. Analyze Performance & Grant XP
export const analyzePerformance = async (
  questions: Question[], 
  answers: UserAnswer[]
): Promise<{ result: ExamResult, plan: RevisionPlan }> => {
  
  // Deterministic Grading for MCQs
  const performanceData = questions.map(q => {
    const ans = answers.find(a => a.questionId === q.id);
    let isCorrectStatus = "NEEDS_EVALUATION";
    let userAnswerText = "Skipped";

    // Format User Answer Text
    if (ans) {
        if (q.type === QuestionType.MCQ && ans.selectedOptionIndex !== undefined) {
            userAnswerText = q.options?.[ans.selectedOptionIndex] || "Unknown Option";
            // Strict Local Check
            if (ans.selectedOptionIndex === q.correctAnswerIndex) {
                isCorrectStatus = "CORRECT";
            } else {
                isCorrectStatus = "INCORRECT";
            }
        } else if (ans.textAnswer) {
            userAnswerText = ans.textAnswer;
        }
    }

    return {
      question: q.text,
      type: q.type,
      userAnswer: userAnswerText,
      correctModel: q.modelAnswer || q.options?.[q.correctAnswerIndex || 0],
      probability: q.probability,
      topic: q.topicName,
      status: isCorrectStatus // Pass explicit status to AI
    };
  });

  const prompt = `
    Grade this exam based on the provided data.
    
    CRITICAL GRADING RULES:
    1. For questions marked "CORRECT" or "INCORRECT" in the status field, YOU MUST USE THAT RESULT. Do not re-evaluate them.
    2. Only evaluate questions marked "NEEDS_EVALUATION" (Short/Long answers). Compare user answer to model answer.
    
    OUTPUT TASKS:
    1. Calculate Final Score (Sum of Correct MCQs + Points awarded for Text answers).
    2. Analyze patterns for "Concept Gaps" vs "Careless Mistakes".
    3. Recommend a specific number of days for revision (between 3 to 14) based on the score and density of concept gaps.
    4. Generate a default revision plan matching that recommended duration.
    5. Calculate XP (Easy=10, Medium=20, Hard=30 per correct answer).
    
    Data: ${JSON.stringify(performanceData)}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          result: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              totalQuestions: { type: Type.NUMBER },
              accuracy: { type: Type.NUMBER },
              weakTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
              strongTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
              feedback: { type: Type.STRING },
              timeManagementAnalysis: { type: Type.STRING },
              conceptGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
              carelessMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
              xpEarned: { type: Type.NUMBER },
              recommendedDuration: { type: Type.INTEGER }
            }
          },
          plan: {
            type: Type.OBJECT,
            properties: {
              generalAdvice: { type: Type.STRING },
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
                    focus: { type: Type.STRING },
                    tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  return safeParseJSON(response.text, { result: {}, plan: {} });
};

// 5. Regenerate Revision Plan (Custom Days)
export const regenerateRevisionPlan = async (
    weakTopics: string[],
    conceptGaps: string[],
    durationDays: number,
    context: SubjectContext
): Promise<RevisionPlan> => {
    
    const prompt = `
        You are an expert study planner for ${context.subjectName}.
        Create a detailed **${durationDays}-Day Revision Schedule**.
        
        Focus Areas: ${weakTopics.join(", ")}
        Specific Gaps: ${conceptGaps.join(", ")}
        
        Requirements:
        1. Spread the workload evenly over ${durationDays} days.
        2. If the duration is short, prioritize high-impact weak topics.
        3. If the duration is long, include review days and deep dives.
        4. Provide specific, actionable tasks (e.g., "Review formula for X", "Practice 5 problems on Y").
    `;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    generalAdvice: { type: Type.STRING },
                    schedule: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: { type: Type.INTEGER },
                                focus: { type: Type.STRING },
                                tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }
                        }
                    }
                }
            }
        }
    });

    return safeParseJSON(response.text, { generalAdvice: "Plan generation failed.", schedule: [] });
};

// 6. Generate Smart Summary
export const generateSmartSummary = async (content: string, context: SubjectContext): Promise<string> => {
  const prompt = `
    You are an expert tutor for ${context.subjectName}.
    Summarize the source material provided below. 
    Do NOT summarize the exam session or questions.
    Focus exclusively on the uploaded study content.
    
    Create a detailed, structured summary/cheatsheet.
    - Use Markdown formatting.
    - Highlight key definitions.
    - List critical formulas or dates if applicable.
    - Organize by major themes.
    
    Source Material (first 30k chars):
    ${content.substring(0, 30000)}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "text/plain", // Markdown output
    }
  });

  return response.text || "Unable to generate summary.";
};

// 7. Format Rough Notes
export const formatStudyNotes = async (roughNotes: string): Promise<string> => {
    const prompt = `
      You are an expert academic editor.
      Convert the following rough study notes into a beautifully formatted, structured study guide.
      
      Output Guidelines:
      - Use standard Markdown formatting.
      - Fix grammar and improve clarity.
      - Use headers (#, ##), bullet points, and bold text for emphasis.
      - Organize into logical sections based on the content.
      - Add a brief "Key Takeaways" section at the end.
      
      Rough Notes Input:
      ${roughNotes.substring(0, 30000)}
    `;
  
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "text/plain", 
      }
    });
  
    return response.text || "Could not format notes.";
  };
