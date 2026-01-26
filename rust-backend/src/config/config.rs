//! Configuration module - loads environment variables

use std::env;

/// Application configuration loaded from environment
#[derive(Clone, Debug)]
pub struct Config {
    pub google_api_key: String,
    pub google_model_name: String,
    pub bind_address: String,
    pub allowed_origins: String,
}

impl Config {
    /// Load configuration from environment variables
    pub fn from_env() -> Result<Self, String> {
        let google_api_key = env::var("GOOGLE_API_KEY")
            .map_err(|_| "GOOGLE_API_KEY must be set")?;
        
        let google_model_name = env::var("GOOGLE_MODEL_NAME")
            .unwrap_or_else(|_| "gemini-1.5-flash".to_string());
        
        let bind_address = env::var("BIND_ADDRESS")
            .unwrap_or_else(|_| "0.0.0.0:8080".to_string());

        let allowed_origins = env::var("ALLOWED_ORIGINS")
            .unwrap_or_else(|_| "*".to_string());

        Ok(Config {
            google_api_key,
            google_model_name,
            bind_address,
            allowed_origins,
        })
    }
}
