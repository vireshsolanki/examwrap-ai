mod config;
mod models;
mod routes;
mod services;

use axum::{
    routing::{get, post},
    Router,
    Json,
};
use serde::Serialize;
use std::net::SocketAddr;
use tower_http::cors::{CorsLayer, Any};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::config::Config;
use crate::services::GeminiService;

/// Health check response
#[derive(Serialize)]
struct HealthResponse {
    status: String,
    version: String,
}

/// Health check endpoint - GET /api/health
async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

#[tokio::main]
async fn main() {
    // Load environment variables from .env file
    dotenvy::dotenv().ok();

    // Initialize logging
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "examwrap_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load configuration
    let config = Config::from_env().expect("Failed to load configuration");
    tracing::info!("Configuration loaded, model: {}", config.google_model_name);

    // Create Gemini service
    let gemini_service = GeminiService::new(&config);

    // Configure CORS
    let cors = if config.allowed_origins == "*" {
        CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(Any)
            .allow_headers(Any)
    } else {
        CorsLayer::new()
            .allow_origin(config.allowed_origins.parse::<axum::http::HeaderValue>().unwrap())
            .allow_methods(Any)
            .allow_headers(Any)
    };

    // Build our application router
    let app = Router::new()
        // Health check
        .route("/api/health", get(health_check))
        // Gemini endpoints
        .route("/api/identify-subject", post(routes::identify_subject))
        .route("/api/generate-syllabus", post(routes::generate_syllabus))
        .route("/api/generate-exam", post(routes::generate_exam))
        .route("/api/analyze-performance", post(routes::analyze_performance))
        .route("/api/regenerate-plan", post(routes::regenerate_plan))
        .route("/api/generate-summary", post(routes::generate_summary))
        .route("/api/format-notes", post(routes::format_notes))
        // Add state and middleware
        .with_state(gemini_service)
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    // Bind to address
    let addr: SocketAddr = config.bind_address.parse().expect("Invalid bind address");
    tracing::info!("🚀 ExamWrap Backend starting on http://{}", addr);
    tracing::info!("📋 Health check: http://{}/api/health", addr);
    tracing::info!("🧠 Identify subject: POST http://{}/api/identify-subject", addr);

    // Start server
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
