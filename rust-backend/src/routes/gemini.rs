//! Gemini API routes

use axum::{
    extract::State,
    Json,
};
use crate::models::{ApiResponse, IdentifySubjectRequest, SubjectAnalysis, GenerateSyllabusRequest, Topic, GenerateExamRequest, Question, AnalyzePerformanceRequest, AnalyzePerformanceResponse, RegeneratePlanRequest, RevisionPlan, GenerateSummaryRequest, FormatNotesRequest};
use crate::services::GeminiService;

/// POST /api/generate-summary
/// Generates a smart summary from provided content
pub async fn generate_summary(
    State(gemini): State<GeminiService>,
    Json(payload): Json<GenerateSummaryRequest>,
) -> Json<ApiResponse<String>> {
    tracing::info!("Generate summary request received for: {}", payload.context.subject_name);
    
    match gemini.generate_smart_summary(&payload.content, &payload.context).await {
        Ok(summary) => {
            tracing::info!("Summary generated successfully");
            Json(ApiResponse::success(summary))
        }
        Err(e) => {
            tracing::error!("Failed to generate summary: {}", e);
            Json(ApiResponse::error(e))
        }
    }
}

/// POST /api/format-notes
/// Formats rough study notes into a structured guide
pub async fn format_notes(
    State(gemini): State<GeminiService>,
    Json(payload): Json<FormatNotesRequest>,
) -> Json<ApiResponse<String>> {
    tracing::info!("Format notes request received");
    
    match gemini.format_study_notes(&payload.rough_notes).await {
        Ok(notes) => {
            tracing::info!("Notes formatted successfully");
            Json(ApiResponse::success(notes))
        }
        Err(e) => {
            tracing::error!("Failed to format notes: {}", e);
            Json(ApiResponse::error(e))
        }
    }
}

/// POST /api/regenerate-plan
/// Regenerates a revision plan for a custom duration
pub async fn regenerate_plan(
    State(gemini): State<GeminiService>,
    Json(payload): Json<RegeneratePlanRequest>,
) -> Json<ApiResponse<RevisionPlan>> {
    tracing::info!("Regenerate plan request received for: {} ({} days)", payload.context.subject_name, payload.duration_days);
    
    match gemini.regenerate_revision_plan(&payload.weak_topics, &payload.concept_gaps, payload.duration_days, &payload.context).await {
        Ok(plan) => {
            tracing::info!("Revision plan regenerated for {} days", payload.duration_days);
            Json(ApiResponse::success(plan))
        }
        Err(e) => {
            tracing::error!("Failed to regenerate plan: {}", e);
            Json(ApiResponse::error(e))
        }
    }
}

/// POST /api/analyze-performance
/// Grades the exam and generates a revision plan
pub async fn analyze_performance(
    State(gemini): State<GeminiService>,
    Json(payload): Json<AnalyzePerformanceRequest>,
) -> Json<ApiResponse<AnalyzePerformanceResponse>> {
    tracing::info!("Analyze performance request received for: {}", payload.context.subject_name);
    
    match gemini.analyze_performance(&payload.questions, &payload.answers, &payload.context).await {
        Ok(res) => {
            tracing::info!("Performance analyzed, score: {}", res.result.score);
            Json(ApiResponse::success(res))
        }
        Err(e) => {
            tracing::error!("Failed to analyze performance: {}", e);
            Json(ApiResponse::error(e))
        }
    }
}

/// POST /api/generate-exam
/// Generates exam questions based on content and configuration
pub async fn generate_exam(
    State(gemini): State<GeminiService>,
    Json(payload): Json<GenerateExamRequest>,
) -> Json<ApiResponse<Vec<Question>>> {
    tracing::info!("Generate exam request received for: {} ({} questions)", payload.context.subject_name, payload.config.question_count);
    
    match gemini.generate_exam_questions(&payload.content, &payload.topics, &payload.config, &payload.context).await {
        Ok(questions) => {
            tracing::info!("Exam generated with {} questions", questions.len());
            Json(ApiResponse::success(questions))
        }
        Err(e) => {
            tracing::error!("Failed to generate exam: {}", e);
            Json(ApiResponse::error(e))
        }
    }
}

/// POST /api/generate-syllabus
/// Extracts a structured syllabus from provided content
pub async fn generate_syllabus(
    State(gemini): State<GeminiService>,
    Json(payload): Json<GenerateSyllabusRequest>,
) -> Json<ApiResponse<Vec<Topic>>> {
    tracing::info!("Generate syllabus request received for: {}", payload.context.subject_name);
    
    match gemini.generate_syllabus(&payload.content, &payload.context).await {
        Ok(topics) => {
            tracing::info!("Syllabus generated with {} topics", topics.len());
            Json(ApiResponse::success(topics))
        }
        Err(e) => {
            tracing::error!("Failed to generate syllabus: {}", e);
            Json(ApiResponse::error(e))
        }
    }
}

/// POST /api/identify-subject
/// Identifies subject and exam type from uploaded content
pub async fn identify_subject(
    State(gemini): State<GeminiService>,
    Json(payload): Json<IdentifySubjectRequest>,
) -> Json<ApiResponse<SubjectAnalysis>> {
    tracing::info!("Identify subject request received, content length: {}", payload.content.len());
    
    match gemini.identify_subject(&payload.content).await {
        Ok(analysis) => {
            tracing::info!("Subject identified: {} ({})", analysis.subject_name, analysis.exam_type);
            Json(ApiResponse::success(analysis))
        }
        Err(e) => {
            tracing::error!("Failed to identify subject: {}", e);
            Json(ApiResponse::error(e))
        }
    }
}
