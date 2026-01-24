//! Configuration module - loads environment variables

use std::env;

/// Application configuration loaded from environment
#[derive(Clone, Debug)]
pub struct Config {
    pub google_api_key: String,
    pub google_model_name: String,
    pub server_port: u16,
}

impl Config {
    /// Load configuration from environment variables
    pub fn from_env() -> Result<Self, String> {
        let google_api_key = env::var("GOOGLE_API_KEY")
            .map_err(|_| "GOOGLE_API_KEY must be set")?;
        
        let google_model_name = env::var("GOOGLE_MODEL_NAME")
            .unwrap_or_else(|_| "gemini-2.5-flash".to_string());
        
        let server_port = env::var("SERVER_PORT")
            .unwrap_or_else(|_| "8080".to_string())
            .parse()
            .map_err(|_| "SERVER_PORT must be a valid number")?;

        Ok(Config {
            google_api_key,
            google_model_name,
            server_port,
        })
    }
}
