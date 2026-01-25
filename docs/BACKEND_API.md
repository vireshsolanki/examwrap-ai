# ExamWrapAI - Backend API Documentation 🦀

## 1. Overview 🌐
The backend is a high-performance, binary-compiled service written in **Rust**. It uses the **Axum** web framework, which is known for its ergonomics and speed. The backend is completely stateless; it processes requests using the Google Gemini API and returns the results immediately to the frontend.

**Tech Stack**:
*   **Language**: Rust (Edition 2021)
*   **Framework**: Axum 0.7
*   **HTTP Client**: Reqwest
*   **Serialization**: Serde & Serde_JSON

## 2. API Endpoints 🛣️

### 🧠 Intelligence Endpoints

#### `POST /api/identify-subject`
*   **Input**: Raw text content (start of a document).
*   **Output**: JSON object `{ subjectName, examType, confidence, summary }`.
*   **Use Case**: Used when a user first uploads a file to guess what they are studying.

#### `POST /api/generate-syllabus`
*   **Input**: Full text + Subject Context.
*   **Output**: JSON Array of `Topic` objects.
*   **Use Case**: Creates the "Map" or topology of concepts for the study material.

#### `POST /api/generate-exam`
*   **Input**: Content, Selected Topics, Configuration (Difficulty, Count).
*   **Logic**:
    1.  Constructs a massive prompt with specific constraints (JSON schema).
    2.  Asks Gemini to act as an "Expert Exam Creator".
    3.  Parses the AI's JSON output into strict Rust structs.
*   **Output**: JSON Array of `Question` objects.

#### `POST /api/analyze-performance`
*   **Input**: Original Questions + User Answers.
*   **Logic**:
    *   **Stateless Grading**: The server does NOT store the "correct" answers in a DB. It re-evaluates the user's answers against the original model/options context in real-time.
    *   **Insight Generation**: Detects "Careless Mistakes" (almost correct) vs "Concept Gaps" (fundamentally wrong).
*   **Output**: Detailed `ExamResult` report.

#### `POST /api/format-notes`
*   **Input**: Rough, messy text notes.
*   **Output**: Clean, Markdown-formatted study guide string.

## 3. Architecture Deep Dive 🔍

### Project Structure (`rust-backend/src`)
*   `main.rs`: Entry point. Sets up the server, CORS, and logging.
*   `routes/`: Contains the handler functions for each API endpoint. These functions parse the JSON body and call the Service layer.
*   `services/`: **The Core Logic**. `gemini.rs` contains the `GeminiService` struct.
    *   It handles all low-level HTTP communication with Google's API.
    *   It defines the **System Prompts** (the "magic" instructions given to the AI).
*   `models/`: Defines the Rust Structs that mirror the TypeScript interfaces. This ensures type safety across the stack.

### Security & Performance 🛡️
*   **Distroless Docker Image**: The production container uses `gcr.io/distroless/cc-debian12`. This contains *only* the application binary and essential runtime libraries (like glibc/openssl), reducing the attack surface to near zero.
*   **Async/Await**: The entire request pipeline is asynchronous, allowing the server to handle thousands of concurrent AI generations without blocking.

## 4. Environment Variables 🔑
The backend relies on `.env` for configuration:
```bash
GOOGLE_API_KEY=your_gemini_key  # Critical for AI functions
GOOGLE_MODEL_NAME=gemini-1.5-flash # Recommended model
SERVER_PORT=8080
```
