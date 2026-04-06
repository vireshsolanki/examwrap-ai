use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Difficulty {
    Easy,
    Medium,
    Hard,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QuestionType {
    MCQ,
    ShortAnswer,
    LongAnswer,
    #[serde(rename = "NUMERICAL")]
    Numerical,
    #[serde(rename = "ASSERTION_REASONING")]
    AssertionReasoning,
    #[serde(rename = "MULTI_CORRECT")]
    MultiCorrect,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ExamPersona {
    Unified,
    Upsc,
    JeeNeet,
    CaCfa,
    SatCat,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ExamType {
    JeeMains,
    JeeAdvanced,
    Neet,
    Cat,
    Gate,
    Upsc,
    University,
    SchoolCbse,
    SchoolIcse,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum StudyLevel {
    Beginner,
    Intermediate,
    Advanced,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExamProbability {
    High,
    Medium,
    Low,
}

/// Exam configuration matching TypeScript version
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExamConfig {
    pub question_count: u32,
    pub question_types: Vec<QuestionType>,
    pub focus_topics: Vec<String>,
    pub time_limit_minutes: u32,
    pub time_limit_per_question_seconds: Option<u32>,
}

/// Question definition
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Question {
    pub id: String,
    #[serde(rename = "type")]
    pub question_type: QuestionType,
    pub text: String,
    pub options: Option<Vec<String>>,
    pub correct_answer_index: Option<u32>,
    pub model_answer: Option<String>,
    pub explanation: String,
    pub difficulty: Difficulty,
    pub probability: ExamProbability,
    pub topic_id: String,
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

/// User answer for a question
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserAnswer {
    pub question_id: String,
    pub selected_option_index: Option<u32>,
    pub text_answer: Option<String>,
    pub time_spent_seconds: f64,
}

/// Exam result with analytics
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExamResult {
    pub score: f64,
    pub total_questions: u32,
    pub accuracy: f64,
    pub weak_topics: Vec<String>,
    pub strong_topics: Vec<String>,
    pub feedback: String,
    pub time_management_analysis: String,
    pub concept_gaps: Vec<String>,
    pub careless_mistakes: Vec<String>,
    pub reference_snippets: Vec<String>,
    pub xp_earned: u32,
    pub recommended_duration: u32,
}

/// Single day in revision plan
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RevisionDay {
    pub day: u32,
    pub focus: String,
    pub tasks: Vec<String>,
}

/// Full revision plan
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RevisionPlan {
    pub schedule: Vec<RevisionDay>,
    pub general_advice: String,
}

/// Combined response for performance analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyzePerformanceResponse {
    pub result: ExamResult,
    pub plan: RevisionPlan,
}

/// Request body for analyze-performance endpoint
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyzePerformanceRequest {
    pub questions: Vec<Question>,
    pub answers: Vec<UserAnswer>,
    pub context: SubjectContext,
}

/// Request body for generate-exam endpoint
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateExamRequest {
    pub content: String,
    pub topics: Vec<Topic>,
    pub config: ExamConfig,
    pub context: SubjectContext,
}

/// Subject analysis result from Gemini
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubjectAnalysis {
    pub subject_name: String,
    pub exam_type: String,
    pub confidence: f64,
    pub summary: String,
}

/// Subtopic definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Subtopic {
    pub name: String,
}

/// Main Topic definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Topic {
    pub id: String,
    pub name: String,
    pub subtopics: Vec<Subtopic>,
}

/// Request body for generate-syllabus endpoint
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateSyllabusRequest {
    pub content: String,
    pub context: SubjectContext,
}

/// Subject context for further operations
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubjectContext {
    pub subject_name: String,
    pub exam_type: String,
    pub persona: ExamPersona,
    // New fields for exam-specific optimization
    pub user_exam_type: Option<ExamType>,
    pub study_level: Option<StudyLevel>,
}

/// Request body for regenerate-plan endpoint
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegeneratePlanRequest {
    pub weak_topics: Vec<String>,
    pub concept_gaps: Vec<String>,
    pub duration_days: u32,
    pub context: SubjectContext,
}

/// Request body for generate-summary endpoint
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateSummaryRequest {
    pub content: String,
    pub context: SubjectContext,
}

/// Request body for format-notes endpoint
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FormatNotesRequest {
    pub rough_notes: String,
}

/// Request body for identify-subject endpoint
#[derive(Debug, Deserialize)]
pub struct IdentifySubjectRequest {
    pub content: String,
}

/// Request body for summarise-pdf endpoint
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SummarisePdfRequest {
    pub content: String,
    pub word_count: u32,
    pub page_count: u32,
    pub length_mode: String, // "words" or "pages"
    pub persona_id: String,
    pub tone_id: String,
    pub exam_label: String,
}

/// Request body for format-notes-configured endpoint
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FormatNotesConfiguredRequest {
    pub rough_notes: String,
    pub persona_id: String,
    pub tone_id: String,
    pub exam_label: String,
}

/// Generic API response wrapper
#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        ApiResponse {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(message: String) -> Self {
        ApiResponse {
            success: false,
            data: None,
            error: Some(message),
        }
    }
}
