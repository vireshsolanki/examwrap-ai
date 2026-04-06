//! Gemini API Service - handles all communication with Google Gemini API

use reqwest::Client;
use serde::{Deserialize, Serialize};
use crate::config::Config;
use crate::models::{SubjectAnalysis, Topic, Question, ExamConfig, SubjectContext, QuestionType, Difficulty, ExamProbability, ExamPersona};
use crate::config::exam_patterns::ExamPattern;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;

/// Gemini API client with automatic key failover
#[derive(Clone)]
pub struct GeminiService {
    client: Client,
    api_keys: Vec<String>,
    current_key_index: Arc<AtomicUsize>,
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
    pub source_citation: Option<String>,
    // Enhanced metadata
    pub page_number: Option<u32>,
    pub concept_tag: Option<String>,
    pub subtopic_name: Option<String>,
    // Exam-specific fields
    pub numerical_answer: Option<f64>,
    pub correct_answer_indices: Option<Vec<u32>>,
    pub assertion_statement: Option<String>,
    pub reasoning_statement: Option<String>,
}

impl GeminiService {
    /// Get persona-specific instructions
    fn get_persona_prompt(persona: &ExamPersona) -> &'static str {
        match persona {
            ExamPersona::Upsc => "Role: Master IAS Mentor. Focus on critical analysis, socio-economic impact, ethical dimensions, and administrative depth. UPSC standard.",
            ExamPersona::JeeNeet => "Role: Senior IIT Professor. Focus on rigorous application of formulas, logical derivations, and complex numerical problem-solving. JEE Advanced/NEET standard.",
            ExamPersona::CaCfa => "Role: Executive Auditor. Focus on regulatory compliance, precise tax logic, financial accounting standards, and data integrity. CA/CFA standard.",
            ExamPersona::SatCat => "Role: Academic Aptitude Coach. Focus on verbal reasoning, advanced logic, speed, and mental agility. SAT/CAT/GMAT standard.",
            ExamPersona::Unified => "Role: Expert University Tutor. Focus on comprehensive understanding, structured recall, and clear academic explanations.",
        }
    }

    /// Create a new Gemini service from config
    pub fn new(config: &Config) -> Self {
        let key_count = config.google_api_keys.len();
        tracing::info!("🔑 GeminiService initialized with {} API key(s)", key_count);
        
        GeminiService {
            client: Client::new(),
            api_keys: config.google_api_keys.clone(),
            current_key_index: Arc::new(AtomicUsize::new(0)),
            model_name: config.google_model_name.clone(),
        }
    }

    /// Get the currently active API key
    fn get_current_key(&self) -> &str {
        let idx = self.current_key_index.load(Ordering::Relaxed);
        &self.api_keys[idx % self.api_keys.len()]
    }

    /// Switch to the next available API key
    fn switch_to_next_key(&self) -> bool {
        if self.api_keys.len() <= 1 {
            return false; // No fallback key available
        }
        let old_idx = self.current_key_index.load(Ordering::Relaxed);
        let new_idx = (old_idx + 1) % self.api_keys.len();
        self.current_key_index.store(new_idx, Ordering::Relaxed);
        tracing::warn!(
            "🔄 API key rate limited. Switching from key #{} to key #{}",
            old_idx + 1,
            new_idx + 1
        );
        true
    }

    /// Call Gemini API with a prompt and return JSON response
    /// Automatically retries with fallback API key on rate limit (429) or forbidden (403) errors
    async fn call_gemini<T: for<'de> Deserialize<'de>>(
        &self,
        prompt: &str,
        response_schema: serde_json::Value,
    ) -> Result<T, String> {
        let max_attempts = self.api_keys.len();
        let mut last_error = String::new();

        for attempt in 0..max_attempts {
            let api_key = self.get_current_key();
            let url = format!(
                "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
                self.model_name, api_key
            );

            let request_body = GeminiRequest {
                contents: vec![Content {
                    parts: vec![Part {
                        text: prompt.to_string(),
                    }],
                }],
                generation_config: GenerationConfig {
                    response_mime_type: "application/json".to_string(),
                    response_schema: Some(response_schema.clone()),
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

            // Check for rate limit (429) or forbidden (403) errors — try failover
            if (status.as_u16() == 429 || status.as_u16() == 403) && attempt < max_attempts - 1 {
                tracing::warn!("⚠️ Key #{} hit rate limit/quota (HTTP {}). Attempting failover...", 
                    self.current_key_index.load(Ordering::Relaxed) + 1, status.as_u16());
                last_error = format!("API key rate limited (HTTP {})", status.as_u16());
                self.switch_to_next_key();
                continue;
            }

            if !status.is_success() {
                tracing::error!("Gemini API error: {} - {}", status, body);
                return Err(format!("Gemini API error: {}", status));
            }

            let gemini_response: GeminiResponse = serde_json::from_str(&body)
                .map_err(|e| format!("Failed to parse Gemini response: {} - Body: {}", e, body))?;

            if let Some(error) = gemini_response.error {
                // Check if error message indicates quota/rate limit
                if (error.message.contains("quota") || error.message.contains("rate") || error.message.contains("RESOURCE_EXHAUSTED"))
                    && attempt < max_attempts - 1 {
                    tracing::warn!("⚠️ Key #{} quota exhausted: {}. Attempting failover...",
                        self.current_key_index.load(Ordering::Relaxed) + 1, error.message);
                    last_error = error.message;
                    self.switch_to_next_key();
                    continue;
                }
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
            return serde_json::from_str(&cleaned)
                .map_err(|e| format!("Failed to parse JSON: {} - Text: {}", e, cleaned));
        }

        Err(format!("All API keys exhausted. Last error: {}", last_error))
    }

    /// Call Gemini API for plain text response (Markdown)
    /// Automatically retries with fallback API key on rate limit (429) or forbidden (403) errors
    async fn call_gemini_text(&self, prompt: &str) -> Result<String, String> {
        let max_attempts = self.api_keys.len();
        let mut last_error = String::new();

        for attempt in 0..max_attempts {
            let api_key = self.get_current_key();
            let url = format!(
                "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
                self.model_name, api_key
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

            // Check for rate limit (429) or forbidden (403) errors — try failover
            if (status.as_u16() == 429 || status.as_u16() == 403) && attempt < max_attempts - 1 {
                tracing::warn!("⚠️ Key #{} hit rate limit/quota (HTTP {}). Attempting failover...", 
                    self.current_key_index.load(Ordering::Relaxed) + 1, status.as_u16());
                last_error = format!("API key rate limited (HTTP {})", status.as_u16());
                self.switch_to_next_key();
                continue;
            }

            if !status.is_success() {
                tracing::error!("Gemini API error: {} - {}", status, body);
                return Err(format!("Gemini API error: {}", status));
            }

            let gemini_response: GeminiResponse = serde_json::from_str(&body)
                .map_err(|e| format!("Failed to parse Gemini response: {} - Body: {}", e, body))?;

            if let Some(error) = gemini_response.error {
                if (error.message.contains("quota") || error.message.contains("rate") || error.message.contains("RESOURCE_EXHAUSTED"))
                    && attempt < max_attempts - 1 {
                    tracing::warn!("⚠️ Key #{} quota exhausted: {}. Attempting failover...",
                        self.current_key_index.load(Ordering::Relaxed) + 1, error.message);
                    last_error = error.message;
                    self.switch_to_next_key();
                    continue;
                }
                return Err(format!("Gemini error: {}", error.message));
            }

            return gemini_response
                .candidates
                .and_then(|c| c.into_iter().next())
                .and_then(|c| c.content.parts.into_iter().next())
                .map(|p| p.text)
                .ok_or_else(|| "No response from Gemini".to_string());
        }

        Err(format!("All API keys exhausted. Last error: {}", last_error))
    }

    /// Generate smart summary from content (matches generateSmartSummary in geminiService.ts)
    pub async fn generate_smart_summary(
        &self,
        content: &str,
        context: &crate::models::SubjectContext,
    ) -> Result<String, String> {
        let persona_instr = Self::get_persona_prompt(&context.persona);
        let prompt = format!(
            r#"{}.
You are an expert tutor for {}.
Summarize the source material provided below. 
Note: Text prefixed with "[USER HIGHLIGHTS:" contains specifically curated information. Prioritize these sections in your summary.
Do NOT summarize the exam session or questions.
Focus exclusively on the uploaded study content.

Create a detailed, structured summary/cheatsheet.
- Use Markdown formatting.
- Highlight key definitions.
- List critical formulas or dates if applicable.
- Organize by major themes.

Source Material (first 30k chars):
{}"#,
            persona_instr,
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

    /// Summarise PDF content with persona/tone configuration
    pub async fn summarise_pdf(
        &self,
        content: &str,
        word_count: u32,
        page_count: u32,
        length_mode: &str,
        persona_id: &str,
        tone_id: &str,
        exam_label: &str,
    ) -> Result<String, String> {
        let persona_prompt = Self::get_persona_system_prompt(persona_id);
        let tone_instruction = Self::get_tone_instruction(tone_id);

        let length_instruction = if length_mode == "pages" {
            format!("TARGET LENGTH: Approximately {} page(s) when printed (roughly {} words per page).", page_count, 400)
        } else {
            format!("TARGET LENGTH: Approximately {} words.", word_count)
        };

        let prompt = format!(
            r#"{persona_prompt}

{tone_instruction}

TASK: Summarize the uploaded PDF document for a student preparing for {exam_label}.
{length_instruction}

OUTPUT STRUCTURE:
1. **Title** — Create a clear, descriptive title for the summary.
2. **Overview** — A 2-3 sentence executive summary of the entire document.
3. **Key Topics** — Break down into major topics/chapters with:
   - Topic heading
   - Core concepts explained concisely
   - Key formulas/definitions/facts (if applicable)
   - Important dates/figures/names (if applicable)
4. **Critical Points** — Bullet list of must-remember items.
5. **Quick Revision Notes** — Ultra-condensed key takeaways for last-minute revision.

RULES:
- Prioritize high-yield exam-relevant content for {exam_label}.
- Maintain academic accuracy — never fabricate facts.
- If content has "[USER HIGHLIGHTS:]" sections, prioritize those.
- Format with proper Markdown (headers, bold, lists).

Source Material (first 30k chars):
{content}"#,
            persona_prompt = persona_prompt,
            tone_instruction = tone_instruction,
            exam_label = exam_label,
            length_instruction = length_instruction,
            content = &content[..content.len().min(30000)]
        );

        self.call_gemini_text(&prompt).await
    }

    /// Format rough notes with persona/tone configuration
    pub async fn format_notes_configured(
        &self,
        rough_notes: &str,
        persona_id: &str,
        tone_id: &str,
        exam_label: &str,
    ) -> Result<String, String> {
        let persona_prompt = Self::get_persona_system_prompt(persona_id);
        let tone_instruction = Self::get_tone_instruction(tone_id);

        let prompt = format!(
            r#"{persona_prompt}

{tone_instruction}

TASK: Convert rough study notes into beautifully formatted, exam-ready study material for a student preparing for {exam_label}.

OUTPUT GUIDELINES:
- Use Markdown formatting (headers, bold, lists, tables where needed).
- Fix grammar and improve clarity while keeping the student's intent.
- Organize into logical sections.
- Add a "Key Takeaways" section at the end.
- Add "Exam Tips" where relevant to {exam_label}.
- Highlight formulas/definitions with bold markers.

Rough Notes Input:
{rough_notes}"#,
            persona_prompt = persona_prompt,
            tone_instruction = tone_instruction,
            exam_label = exam_label,
            rough_notes = &rough_notes[..rough_notes.len().min(30000)]
        );

        self.call_gemini_text(&prompt).await
    }

    /// Get persona system prompt by ID
    fn get_persona_system_prompt(persona_id: &str) -> &'static str {
        match persona_id {
            "school_teacher" => "You are a warm, experienced school teacher with 20+ years of classroom experience. Always explain step-by-step, use real-life examples, reference NCERT/ICSE textbook language, and encourage students with positive reinforcement. Use mnemonics and highlight common mistakes.",
            "iit_professor" => "You are a senior IIT professor known for producing toppers. Focus on DEEP conceptual understanding, derive every formula, include numerical problems with step-by-step solutions. Point out common traps and trick questions. Cross-link concepts across subjects.",
            "medical_mentor" => "You are an experienced NEET mentor and medical college professor. Anchor explanations in NCERT Biology language, use clinical case studies. Include assertion-reasoning patterns. Highlight high-yield topics that appear repeatedly in NEET.",
            "finance_expert" => "You are an executive-level chartered accountant and CFA charterholder. Reference specific accounting standards (Ind AS/IFRS/US GAAP) by number. Use real-world company examples. Tax explanations must cite specific sections. Focus on precision and regulatory compliance.",
            "ias_mentor" => "You are a retired IAS officer turned UPSC mentor. Analyze every topic from multiple dimensions: social, economic, political, ethical. Link current affairs to static syllabus. Train analytical thinking with 'Critically Analyze' prompts.",
            "aptitude_coach" => "You are a top CAT/GMAT coach. Focus on speed and efficiency — show shortcut methods first. For Verbal: passage deconstruction. For Quant: pattern recognition. Include timed practice suggestions and elimination strategies.",
            "university_professor" | _ => "You are a distinguished university professor with a PhD. Provide comprehensive, academically rigorous explanations. Balance theory with practical applications. Use Definition → Explanation → Example → Application structure.",
        }
    }

    /// Get tone instruction by ID
    fn get_tone_instruction(tone_id: &str) -> &'static str {
        match tone_id {
            "supportive" => "Tone: Be warm, encouraging, and patient. Never say 'this is easy'. Use phrases like 'Great question!', 'Let's break this down together'. Celebrate small wins. End responses with encouragement.",
            "rigorous" => "Tone: Be direct, precise, and exam-focused. No filler. Use precise academic language. Be methodical and numbered. Flag edge cases. Use 'CRITICAL:', 'NOTE:', 'TRAP:' markers for important distinctions.",
            "analytical" => "Tone: Be thoughtful and analytical. Present multiple viewpoints before concluding. Use 'On one hand... on the other hand...' structures. Ask reflective counter-questions. Include 'Think about it:' prompts.",
            "professional" => "Tone: Be professional, well-structured, and concise. Use industry-standard terminology. Structure with clear headers and sub-points. Be factual and precise — avoid ambiguity.",
            "friendly" => "Tone: Be friendly and conversational, like a smart study buddy. Use casual but accurate language. Include relatable analogies. Make complex things sound interesting. Say 'Think of it this way...'",
            _ => "Tone: Be clear, structured, and helpful. Focus on making concepts easy to understand.",
        }
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
Create a detailed **EXACTLY {}-Day Revision Schedule**.

CRITICAL REQUIREMENT: The schedule MUST have EXACTLY {} days. No more, no less.

Focus Areas: {}
Specific Gaps: {}

Requirements:
1. Generate EXACTLY {} days in the schedule array (day 1 through day {}).
2. Spread the workload evenly over these {} days.
3. If the duration is short (1-3 days), prioritize only the most critical weak topics.
4. If the duration is medium (4-7 days), include all weak topics with practice.
5. If the duration is long (8+ days), include review days and deep dives.
6. Provide specific, actionable tasks (e.g., "Review formula for X", "Practice 5 problems on Y").

VERIFY: Your schedule array length MUST equal {}."#,
            context.subject_name,
            duration_days,
            duration_days,
            weak_topics.join(", "),
            concept_gaps.join(", "),
            duration_days,
            duration_days,
            duration_days,
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
3. For every identified "Concept Gap", provide a specific 1-2 sentence "Review Reference" snippet from the source material that explains the concept correctly.
4. Recommend a specific number of days for revision (between 3 to 14) based on the score and density of concept gaps.
5. Generate a default revision plan matching that recommended duration.
6. Calculate XP (Easy=10, Medium=20, Hard=30 per correct answer).

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
                        "referenceSnippets": { "type": "array", "items": { "type": "string" } },
                        "xpEarned": { "type": "integer" },
                        "recommendedDuration": { "type": "integer" }
                    },
                    "required": ["score", "totalQuestions", "accuracy", "weakTopics", "strongTopics", "feedback", "timeManagementAnalysis", "conceptGaps", "carelessMistakes", "referenceSnippets", "xpEarned", "recommendedDuration"]
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
        let persona_instr = Self::get_persona_prompt(&context.persona);
        let prompt = format!(
            r#"{}.
You are an expert curriculum designer for {} targeting {}.
Analyze the provided study material and extract a structured syllabus suitable for this specific exam goal.
Return a list of Main Topics, each with subtopics.

Material (first 25k chars):
{}"#,
            persona_instr,
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
        let persona_instr = Self::get_persona_prompt(&context.persona);

        // Get exam-specific instructions if available
        let exam_specific_instr = if let (Some(exam_type), Some(study_level)) = (&context.user_exam_type, &context.study_level) {
            let pattern = ExamPattern::get_pattern(exam_type);
            let level_instr = ExamPattern::get_study_level_instruction(study_level);
            format!(
                "\n\nEXAM-SPECIFIC CONTEXT:\n\
                Exam: {}\n\
                Marking Scheme: +{} for correct, {} for incorrect\n\
                Difficulty Distribution: {}% Easy, {}% Medium, {}% Hard\n\
                Study Level: {}\n\
                Special Instructions: {}",
                pattern.name,
                pattern.marking_scheme.correct,
                pattern.marking_scheme.incorrect,
                pattern.difficulty_distribution.easy_percent,
                pattern.difficulty_distribution.medium_percent,
                pattern.difficulty_distribution.hard_percent,
                level_instr,
                pattern.special_instructions
            )
        } else {
            String::new()
        };

        let prompt = format!(
            r#"{}.
Role: Expert Exam Creator for {} ({}).
Context: Creating a high-quality practice assessment.
Task: Generate exactly {} questions based on the content provided.{}

PRIORITY RULE: 
- The source text may contain regions tagged with "[USER HIGHLIGHTS: ...]". 
- THESE ARE HIGH-YIELD CONCEPTS curated by the student. 
- You MUST prioritize generating questions from these highlighted sections to ensure assessment accuracy and user relevance.
- Minimize speculation on background text; focus on the curated high-yield data.

ENHANCED METADATA REQUIREMENTS:
1. Page Number: If you can identify which page the concept appears on (look for "Page X" markers), include it as "pageNumber"
2. Concept Tag: Identify the specific concept being tested (e.g., "Newton's Second Law", "Photosynthesis", "Quadratic Equations")
3. Subtopic: If applicable, provide a more granular subtopic name

Requirements:
1. Question Types: Only generate [{}].
2. Probability: Assign 'High', 'Medium', or 'Low' probability (how likely this concept is to appear in {}).
3. Explanation: 
   - For MCQs: Provide a detailed explanation of the correct answer AND explain why each distractor is incorrect.
   - For Text: Provide the key marking points.
4. Difficulty: Follow the exam-specific distribution if provided above.
5. Grounding: Provide a specific "Source Citation" (exact quote) from the source material that validates the correct answer.

Output Format: JSON Array of Questions.

Material Context (excerpt):
{}"#,
            persona_instr,
            context.subject_name,
            context.exam_type,
            config.question_count,
            exam_specific_instr,
            type_requests_str,
            context.exam_type,
            &content[..content.len().min(20000)]
        );

        let schema = serde_json::json!({
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type": { "type": "string", "enum": ["MCQ", "ShortAnswer", "LongAnswer", "NUMERICAL", "ASSERTION_REASONING", "MULTI_CORRECT"] },
                    "text": { "type": "string" },
                    "options": { "type": "array", "items": { "type": "string" } },
                    "correctAnswerIndex": { "type": "integer" },
                    "modelAnswer": { "type": "string" },
                    "explanation": { "type": "string" },
                    "difficulty": { "type": "string", "enum": ["Easy", "Medium", "Hard"] },
                    "probability": { "type": "string", "enum": ["High", "Medium", "Low"] },
                    "topicName": { "type": "string" },
                    "sourceCitation": { "type": "string" },
                    "pageNumber": { "type": "integer" },
                    "conceptTag": { "type": "string" },
                    "subtopicName": { "type": "string" },
                    "numericalAnswer": { "type": "number" },
                    "correctAnswerIndices": { "type": "array", "items": { "type": "integer" } },
                    "assertionStatement": { "type": "string" },
                    "reasoningStatement": { "type": "string" },
                },
                "required": ["type", "text", "explanation", "difficulty", "probability", "topicName", "sourceCitation"]
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
                source_citation: q.source_citation,
                // Enhanced metadata
                page_number: q.page_number,
                concept_tag: q.concept_tag,
                subtopic_name: q.subtopic_name,
                // Exam-specific fields
                numerical_answer: q.numerical_answer,
                correct_answer_indices: q.correct_answer_indices,
                assertion_statement: q.assertion_statement,
                reasoning_statement: q.reasoning_statement,
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
