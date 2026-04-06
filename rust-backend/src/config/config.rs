//! Configuration module - loads environment variables

use std::env;

/// Application configuration loaded from environment
#[derive(Clone, Debug)]
pub struct Config {
    pub google_api_keys: Vec<String>,
    pub google_model_name: String,
    pub bind_address: String,
    pub allowed_origins: String,
}

impl Config {
    /// Load configuration from environment variables
    /// Supports multiple API keys via GOOGLE_API_KEY and GOOGLE_API_KEY_2
    /// When one key hits rate limits, the service will automatically switch to the other
    pub fn from_env() -> Result<Self, String> {
        let primary_key = env::var("GOOGLE_API_KEY")
            .map_err(|_| "GOOGLE_API_KEY must be set")?;
        
        let mut api_keys = vec![primary_key];
        
        // Load fallback key(s) if available
        if let Ok(fallback_key) = env::var("GOOGLE_API_KEY_2") {
            if !fallback_key.is_empty() {
                api_keys.push(fallback_key);
                tracing::info!("✅ Fallback API key loaded (GOOGLE_API_KEY_2). Auto-failover enabled.");
            }
        }
        
        let google_model_name = env::var("GOOGLE_MODEL_NAME")
            .unwrap_or_else(|_| "gemini-1.5-flash".to_string());
        
        // Render and other PaaS environments provide the PORT environment variable.
        // It's critical we listen on PORT if it's set, overriding any BIND_ADDRESS mistakes.
        let bind_address = if let Ok(port) = env::var("PORT") {
            format!("0.0.0.0:{}", port)
        } else {
            env::var("BIND_ADDRESS").unwrap_or_else(|_| "0.0.0.0:8080".to_string())
        };

        let allowed_origins = env::var("ALLOWED_ORIGINS")
            .unwrap_or_else(|_| "*".to_string());

        Ok(Config {
            google_api_keys: api_keys,
            google_model_name,
            bind_address,
            allowed_origins,
        })
    }
}
