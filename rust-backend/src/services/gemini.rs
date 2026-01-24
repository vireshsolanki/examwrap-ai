//! Gemini API Service - handles all communication with Google Gemini API

use reqwest::Client;
use serde::{Deserialize, Serialize};
use crate::config::Config;
use crate::models::{SubjectAnalysis, Topic, Question, ExamConfig, SubjectContext, QuestionType, Difficulty, ExamProbability};

/// Gemini API client
#[derive(Clone)]
pub struct GeminiService {
    client: Client,
    api_key: String,
    model_name: String,
}

/// Gemini API request format
#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<Content>,
    generation_config: GenerationConfig,
}

#[derive(Serialize)]
struct Content {
    parts: Vec<Part>,
}

#[derive(Serialize)]
struct Part {
    text: String,
}

#[derive(Serialize)]
struct GenerationConfig {
    response_mime_type: String,
    response_schema: Option<serde_json::Value>,
}

/// Gemini API response format
#[derive(Deserialize, Debug)]
struct GeminiResponse {
    candidates: Option<Vec<Candidate>>,
    error: Option<GeminiError>,
}

#[derive(Deserialize, Debug)]
struct Candidate {
    content: CandidateContent,
}

#[derive(Deserialize, Debug)]
struct CandidateContent {
    parts: Vec<CandidatePart>,
}

#[derive(Deserialize, Debug)]
struct CandidatePart {
    text: String,
}

#[derive(Deserialize, Debug)]
struct GeminiError {
    message: String,
}

/// Helper struct for parsing Gemini response before ID assignment
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RawQuestion {
    #[serde(rename = "type")]
    pub question_type: QuestionType,
    pub text: String,
    pub options: Option<Vec<String>>,
    pub correct_answer_index: Option<u32>,
    pub model_answer: Option<String>,
    pub explanation: String,
    pub difficulty: Difficulty,
    pub probability: ExamProbability,
    pub topic_name: String,
}

impl GeminiService {
    /// Create a new Gemini service from config
    pub fn new(config: &Config) -> Self {
        GeminiService {
            client: Client::new(),
            api_key: config.google_api_key.clone(),
            model_name: config.google_model_name.clone(),
        }
    }

    /// Call Gemini API with a prompt and return JSON response
    async fn call_gemini<T: for<'de> Deserialize<'de>>(
        &self,
        prompt: &str,
        response_schema: serde_json::Value,
    ) -> Result<T, String> {
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
            self.model_name, self.api_key
        );

        let request_body = GeminiRequest {
            contents: vec![Content {
                parts: vec![Part {
                    text: prompt.to_string(),
                }],
            }],
            generation_config: GenerationConfig {
                response_mime_type: "application/json".to_string(),
                response_schema: Some(response_schema),
            },
        };

        let response = self
            .client
            .post(&url)
            .json(&request_body)
            .send()
            .await
            .map_err(|e| format!("HTTP request failed: {}", e))?;

        let status = response.status();
        let body = response
            .text()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))?;

        if !status.is_success() {
            tracing::error!("Gemini API error: {} - {}", status, body);
            return Err(format!("Gemini API error: {}", status));
        }

        let gemini_response: GeminiResponse = serde_json::from_str(&body)
            .map_err(|e| format!("Failed to parse Gemini response: {} - Body: {}", e, body))?;

        if let Some(error) = gemini_response.error {
            return Err(format!("Gemini error: {}", error.message));
        }

        let text = gemini_response
            .candidates
            .and_then(|c| c.into_iter().next())
            .and_then(|c| c.content.parts.into_iter().next())
            .map(|p| p.text)
            .ok_or_else(|| "No response from Gemini".to_string())?;

        // Clean and parse JSON response
        let cleaned = clean_json(&text);
        serde_json::from_str(&cleaned)
            .map_err(|e| format!("Failed to parse JSON: {} - Text: {}", e, cleaned))
    }

    /// Call Gemini API for plain text response (Markdown)
    async fn call_gemini_text(&self, prompt: &str) -> Result<String, String> {
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
            self.model_name, self.api_key
        );

        let request_body = GeminiRequest {
            contents: vec![Content {
                parts: vec![Part {
                    text: prompt.to_string(),
                }],
            }],
            generation_config: GenerationConfig {
                response_mime_type: "text/plain".to_string(),
                response_schema: None,
            },
        };

        let response = self
            .client
            .post(&url)
            .json(&request_body)
            .send()
            .await
            .map_err(|e| format!("HTTP request failed: {}", e))?;

        let status = response.status();
        let body = response
            .text()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))?;

        if !status.is_success() {
            tracing::error!("Gemini API error: {} - {}", status, body);
            return Err(format!("Gemini API error: {}", status));
        }

        let gemini_response: GeminiResponse = serde_json::from_str(&body)
            .map_err(|e| format!("Failed to parse Gemini response: {} - Body: {}", e, body))?;

        if let Some(error) = gemini_response.error {
            return Err(format!("Gemini error: {}", error.message));
        }

        gemini_response
            .candidates
            .and_then(|c| c.into_iter().next())
            .and_then(|c| c.content.parts.into_iter().next())
            .map(|p| p.text)
            .ok_or_else(|| "No response from Gemini".to_string())
    }

    /// Generate smart summary from content (matches generateSmartSummary in geminiService.ts)
    pub async fn generate_smart_summary(
        &self,
        content: &str,
        context: &crate::models::SubjectContext,
    ) -> Result<String, String> {
        let prompt = format!(
            r#"You are an expert tutor for {}.
Summarize the source material provided below. 
Do NOT summarize the exam session or questions.
Focus exclusively on the uploaded study content.

Create a detailed, structured summary/cheatsheet.
- Use Markdown formatting.
- Highlight key definitions.
- List critical formulas or dates if applicable.
- Organize by major themes.

Source Material (first 30k chars):
{}"#,
            context.subject_name,
            &content[..content.len().min(30000)]
        );

        self.call_gemini_text(&prompt).await
    }

    /// Format rough notes (matches formatStudyNotes in geminiService.ts)
    pub async fn format_study_notes(&self, rough_notes: &str) -> Result<String, String> {
        let prompt = format!(
            r#"You are an expert academic editor.
Convert the following rough study notes into a beautifully formatted, structured study guide.

Output Guidelines:
- Use standard Markdown formatting.
- Fix grammar and improve clarity.
- Use headers (#, ##), bullet points, and bold text for emphasis.
- Organize into logical sections based on the content.
- Add a brief "Key Takeaways" section at the end.

Rough Notes Input:
{}"#,
            &rough_notes[..rough_notes.len().min(30000)]
        );

        self.call_gemini_text(&prompt).await
    }

    /// Regenerate revision plan for custom duration (matches regenerateRevisionPlan in geminiService.ts)
    pub async fn regenerate_revision_plan(
        &self,
        weak_topics: &[String],
        concept_gaps: &[String],
        duration_days: u32,
        context: &crate::models::SubjectContext,
    ) -> Result<crate::models::RevisionPlan, String> {
        let prompt = format!(
            r#"You are an expert study planner for {}.
Create a detailed **{}-Day Revision Schedule**.

Focus Areas: {}
Specific Gaps: {}

Requirements:
1. Spread the workload evenly over {} days.
2. If the duration is short, prioritize high-impact weak topics.
3. If the duration is long, include review days and deep dives.
4. Provide specific, actionable tasks (e.g., "Review formula for X", "Practice 5 problems on Y")."#,
            context.subject_name,
            duration_days,
            weak_topics.join(", "),
            concept_gaps.join(", "),
            duration_days
        );

        let schema = serde_json::json!({
            "type": "object",
            "properties": {
                "generalAdvice": { "type": "string" },
                "schedule": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "day": { "type": "integer" },
                            "focus": { "type": "string" },
                            "tasks": { "type": "array", "items": { "type": "string" } }
                        },
                        "required": ["day", "focus", "tasks"]
                    }
                }
            },
            "required": ["generalAdvice", "schedule"]
        });

        self.call_gemini(&prompt, schema).await
    }

    /// Analyze performance and generate result + revision plan (matches analyzePerformance in geminiService.ts)
    pub async fn analyze_performance(
        &self,
        questions: &[crate::models::Question],
        answers: &[crate::models::UserAnswer],
        context: &crate::models::SubjectContext,
    ) -> Result<crate::models::AnalyzePerformanceResponse, String> {
        let performance_data: Vec<serde_json::Value> = questions.iter().map(|q| {
            let ans = answers.iter().find(|a| a.question_id == q.id);
            let mut status = "NEEDS_EVALUATION";
            let mut user_answer_text = "Skipped".to_string();

            if let Some(a) = ans {
                match q.question_type {
                    crate::models::QuestionType::MCQ => {
                        if let Some(idx) = a.selected_option_index {
                            user_answer_text = q.options.as_ref()
                                .and_then(|opts| opts.get(idx as usize))
                                .cloned()
                                .unwrap_or_else(|| "Unknown Option".to_string());
                            
                            if Some(idx) == q.correct_answer_index {
                                status = "CORRECT";
                            } else {
                                status = "INCORRECT";
                            }
                        }
                    }
                    _ => {
                        if let Some(text) = &a.text_answer {
                            user_answer_text = text.clone();
                        }
                    }
                }
            }

            let correct_model = q.model_answer.clone()
                .or_else(|| {
                    q.options.as_ref()
                        .and_then(|opts| q.correct_answer_index.map(|idx| opts[idx as usize].clone()))
                })
                .unwrap_or_else(|| "N/A".to_string());

            serde_json::json!({
                "question": q.text,
                "type": format!("{:?}", q.question_type),
                "userAnswer": user_answer_text,
                "correctModel": correct_model,
                "probability": format!("{:?}", q.probability),
                "topic": q.topic_name,
                "status": status
            })
        }).collect();

        let prompt = format!(
            r#"Grade this exam for {} ({}) based on the provided data.

CRITICAL GRADING RULES:
1. For questions marked "CORRECT" or "INCORRECT" in the status field, YOU MUST USE THAT RESULT. Do not re-evaluate them.
2. Only evaluate questions marked "NEEDS_EVALUATION" (Short/Long answers). Compare user answer to model answer.

OUTPUT TASKS:
1. Calculate Final Score (Sum of Correct MCQs + Points awarded for Text answers).
2. Analyze patterns for "Concept Gaps" vs "Careless Mistakes".
3. Recommend a specific number of days for revision (between 3 to 14) based on the score and density of concept gaps.
4. Generate a default revision plan matching that recommended duration.
5. Calculate XP (Easy=10, Medium=20, Hard=30 per correct answer).

Data: {}"#,
            context.subject_name,
            context.exam_type,
            serde_json::to_string(&performance_data).unwrap_or_default()
        );

        let schema = serde_json::json!({
            "type": "object",
            "properties": {
                "result": {
                    "type": "object",
                    "properties": {
                        "score": { "type": "number" },
                        "totalQuestions": { "type": "integer" },
                        "accuracy": { "type": "number" },
                        "weakTopics": { "type": "array", "items": { "type": "string" } },
                        "strongTopics": { "type": "array", "items": { "type": "string" } },
                        "feedback": { "type": "string" },
                        "timeManagementAnalysis": { "type": "string" },
                        "conceptGaps": { "type": "array", "items": { "type": "string" } },
                        "carelessMistakes": { "type": "array", "items": { "type": "string" } },
                        "xpEarned": { "type": "integer" },
                        "recommendedDuration": { "type": "integer" }
                    },
                    "required": ["score", "totalQuestions", "accuracy", "weakTopics", "strongTopics", "feedback", "timeManagementAnalysis", "conceptGaps", "carelessMistakes", "xpEarned", "recommendedDuration"]
                },
                "plan": {
                    "type": "object",
                    "properties": {
                        "generalAdvice": { "type": "string" },
                        "schedule": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "day": { "type": "integer" },
                                    "focus": { "type": "string" },
                                    "tasks": { "type": "array", "items": { "type": "string" } }
                                },
                                "required": ["day", "focus", "tasks"]
                            }
                        }
                    },
                    "required": ["generalAdvice", "schedule"]
                }
            },
            "required": ["result", "plan"]
        });

        self.call_gemini(&prompt, schema).await
    }

    /// Generate syllabus map from content (matches generateSyllabus in geminiService.ts)
    pub async fn generate_syllabus(
        &self,
        content: &str,
        context: &SubjectContext,
    ) -> Result<Vec<Topic>, String> {
        let prompt = format!(
            r#"You are an expert curriculum designer for {} targeting {}.
Analyze the provided study material and extract a structured syllabus suitable for this specific exam goal.
Return a list of Main Topics, each with subtopics.

Material (first 25k chars):
{}"#,
            context.subject_name,
            context.exam_type,
            &content[..content.len().min(25000)]
        );

        let schema = serde_json::json!({
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": { "type": "string" },
                    "name": { "type": "string" },
                    "subtopics": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": { "type": "string" }
                            },
                            "required": ["name"]
                        }
                    }
                },
                "required": ["id", "name", "subtopics"]
            }
        });

        let topics: Vec<Topic> = self.call_gemini(&prompt, schema).await?;
        
        // Filter out malformed topics
        Ok(topics.into_iter().filter(|t| !t.id.is_empty() && !t.name.is_empty()).collect())
    }

    /// Generate questions for exam (matches generateExamQuestions in geminiService.ts)
    pub async fn generate_exam_questions(
        &self,
        content: &str,
        topics: &[Topic],
        config: &ExamConfig,
        context: &SubjectContext,
    ) -> Result<Vec<Question>, String> {
        let type_requests: Vec<String> = config.question_types
            .iter()
            .map(|t| format!("{:?}", t))
            .collect();
        let type_requests_str = type_requests.join(", ");

        let prompt = format!(
            r#"Role: Expert Exam Creator for {} ({}).
Context: Creating a high-quality practice assessment.
Task: Generate exactly {} questions based on the content provided.

Requirements:
1. Question Types: Only generate [{}].
2. Probability: Assign 'High', 'Medium', or 'Low' probability (how likely this concept is to appear in {}).
3. Explanation: 
   - For MCQs: Provide a detailed explanation of the correct answer AND explain why each distractor is incorrect.
   - For Text: Provide the key marking points.
4. Difficulty: Adaptive mix.

Output Format: JSON Array of Questions.

Material Context (excerpt):
{}"#,
            context.subject_name,
            context.exam_type,
            config.question_count,
            type_requests_str,
            context.exam_type,
            &content[..content.len().min(20000)]
        );

        let schema = serde_json::json!({
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type": { "type": "string", "enum": ["MCQ", "ShortAnswer", "LongAnswer"] },
                    "text": { "type": "string" },
                    "options": { "type": "array", "items": { "type": "string" } },
                    "correctAnswerIndex": { "type": "integer" },
                    "modelAnswer": { "type": "string" },
                    "explanation": { "type": "string" },
                    "difficulty": { "type": "string", "enum": ["Easy", "Medium", "Hard"] },
                    "probability": { "type": "string", "enum": ["High", "Medium", "Low"] },
                    "topicName": { "type": "string" },
                },
                "required": ["type", "text", "explanation", "difficulty", "probability", "topicName"]
            }
        });

        // Use RawQuestion for parsing to avoid ID mismatch
        let raw_questions: Vec<RawQuestion> = self.call_gemini(&prompt, schema).await?;
        
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis();

        Ok(raw_questions.into_iter().enumerate().map(|(i, q)| {
            let topic_id = topics.iter()
                .find(|t| t.name == q.topic_name)
                .map(|t| t.id.clone())
                .unwrap_or_else(|| "general".to_string());
                
            Question {
                id: format!("q-{}-{}", i, now),
                question_type: q.question_type,
                text: q.text,
                options: q.options,
                correct_answer_index: q.correct_answer_index,
                model_answer: q.model_answer,
                explanation: q.explanation,
                difficulty: q.difficulty,
                probability: q.probability,
                topic_id,
                topic_name: q.topic_name,
            }
        }).collect())
    }

    /// Identify subject from content (matches identifySubject in geminiService.ts)
    pub async fn identify_subject(&self, content: &str) -> Result<SubjectAnalysis, String> {
        let prompt = format!(
            r#"Analyze the start of this document. 
1. Identify the likely Subject Name (e.g., "Calculus II", "Marketing 101").
2. Identify the likely Exam Context (e.g., "University Final", "AP Exam", "Certification", "Entrance Test").
3. Provide a brief 1-sentence summary of what this material covers.

Content Preview:
{}"#,
            &content[..content.len().min(5000)]
        );

        let schema = serde_json::json!({
            "type": "object",
            "properties": {
                "subjectName": { "type": "string" },
                "examType": { "type": "string" },
                "confidence": { "type": "number" },
                "summary": { "type": "string" }
            },
            "required": ["subjectName", "examType", "confidence", "summary"]
        });

        self.call_gemini(&prompt, schema).await
    }
}

/// Clean potential Markdown code blocks from JSON string
fn clean_json(text: &str) -> String {
    let trimmed = text.trim();
    
    // Try to find markdown block explicitly
    if let Some(start) = trimmed.find("```json") {
        if let Some(end) = trimmed.rfind("```") {
            let json_start = start + 7;
            if json_start < end {
                return trimmed[json_start..end].trim().to_string();
            }
        }
    }

    // Try to find generic code block
    if let Some(start) = trimmed.find("```") {
        if let Some(end) = trimmed.rfind("```") {
            let json_start = start + 3;
            if json_start < end {
                return trimmed[json_start..end].trim().to_string();
            }
        }
    }

    let first_brace = trimmed.find('{');
    let last_brace = trimmed.rfind('}');
    let first_bracket = trimmed.find('[');
    let last_bracket = trimmed.rfind(']');

    // If both exist, determine which is outer
    match (first_brace, first_bracket) {
        (Some(fb), Some(fk)) if fk < fb => {
            // Bracket is outer
            if let Some(lk) = last_bracket {
                return trimmed[fk..=lk].to_string();
            }
        }
        (Some(fb), _) => {
            // Brace is outer (or bracket doesn't exist)
            if let Some(lb) = last_brace {
                return trimmed[fb..=lb].to_string();
            }
        }
        (None, Some(fk)) => {
            // Only bracket exists
            if let Some(lk) = last_bracket {
                return trimmed[fk..=lk].to_string();
            }
        }
        _ => {}
    }

    trimmed.to_string()
}
