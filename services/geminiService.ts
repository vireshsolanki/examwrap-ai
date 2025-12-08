
import { GoogleGenAI, Type } from "@google/genai";
import { Topic, Question, Difficulty, ExamResult, RevisionPlan, UserAnswer, QuestionType, SubjectAnalysis, ExamConfig, ExamProbability, SubjectContext } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

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

  return JSON.parse(response.text || "{}");
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

  return JSON.parse(response.text || "[]");
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

  const rawQuestions = JSON.parse(response.text || "[]");
  
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
  
  const performanceData = questions.map(q => {
    const ans = answers.find(a => a.questionId === q.id);
    return {
      question: q.text,
      type: q.type,
      userAnswer: ans ? (ans.textAnswer || `Option ${ans.selectedOptionIndex}`) : "Skipped",
      correctModel: q.modelAnswer || q.options?.[q.correctAnswerIndex || 0],
      probability: q.probability
    };
  });

  const prompt = `
    Grade this exam. 
    1. Score it. 
    2. Analyze if the student missed "High Probability" questions (Critical warning).
    3. Detect "Careless Mistakes" vs "Concept Gaps".
    4. Generate a 7-day revision plan.
    5. Calculate XP based on difficulty (Easy=10, Medium=20, Hard=30 per correct answer).
    
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
              xpEarned: { type: Type.NUMBER }
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

  return JSON.parse(response.text || "{}");
};

// 5. Generate Smart Summary
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
