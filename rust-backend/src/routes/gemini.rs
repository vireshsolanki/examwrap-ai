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

use axum::{
    body::Body,
    http::{header, StatusCode},
    response::Response,
};
use serde::Deserialize;
use crate::services::PdfGenerator;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportPdfRequest {
    pub questions: Vec<Question>,
    pub title: String,
    pub time_limit: Option<u32>,
    pub max_marks: Option<u32>,
}

/// POST /api/export-question-paper
/// Exports questions as a PDF question paper
pub async fn export_question_paper(
    Json(payload): Json<ExportPdfRequest>,
) -> Result<Response<Body>, StatusCode> {
    tracing::info!("Export question paper request received: {}", payload.title);
    
    match PdfGenerator::generate_question_paper(
        &payload.questions,
        &payload.title,
        payload.time_limit,
        payload.max_marks,
    ) {
        Ok(pdf_bytes) => {
            tracing::info!("Question paper PDF generated successfully");
            let response = Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, "application/pdf")
                .header(header::CONTENT_DISPOSITION, "attachment; filename=\"question-paper.pdf\"")
                .body(Body::from(pdf_bytes))
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            Ok(response)
        }
        Err(e) => {
            tracing::error!("Failed to generate question paper PDF: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// POST /api/export-answer-key
/// Exports answer key as a PDF
pub async fn export_answer_key(
    Json(payload): Json<ExportPdfRequest>,
) -> Result<Response<Body>, StatusCode> {
    tracing::info!("Export answer key request received: {}", payload.title);
    
    match PdfGenerator::generate_answer_key(&payload.questions, &payload.title) {
        Ok(pdf_bytes) => {
            tracing::info!("Answer key PDF generated successfully");
            let response = Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, "application/pdf")
                .header(header::CONTENT_DISPOSITION, "attachment; filename=\"answer-key.pdf\"")
                .body(Body::from(pdf_bytes))
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            Ok(response)
        }
        Err(e) => {
            tracing::error!("Failed to generate answer key PDF: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
