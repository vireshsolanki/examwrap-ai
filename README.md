# ExamWrapAI 🚀

> Your Personal AI Study Architect for creating, taking, and analyzing exams.

## 🌟 Overview

ExamWrapAI is a full-stack application that transforms study materials (PDFs, Notes) into interactive exams. It uses **Google Gemini** for intelligence and provides detailed analytics on your performance.

### Tech Stack
- **Frontend**: React + Vite + TailwindCSS + Lucide Icons
- **Backend**: Rust + Axum (High performance, Memory efficient)
- **AI**: Google Gemini API via `reqwest`

---

## 🛠️ Quick Start (Docker - Recommended)

The easiest way to run the entire stack.

1. **Prerequisites**: Docker & Docker Compose installed.
2. **Setup Env**:
   Ensure you have a `.env` file in `rust-backend/` with your API Key:
   ```bash
   GOOGLE_API_KEY=your_key_here
   GOOGLE_MODEL_NAME=gemini-1.5-flash
   SERVER_PORT=8080
   ALLOWED_ORIGINS=http://localhost:3000
   ```
3. **Run**:
   ```bash
   docker-compose up --build
   ```
4. **Access**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend Health: [http://localhost:8080/api/health](http://localhost:8080/api/health)

---

## 🏃 Local Development (No Docker)

If you want to run services natively on your machine:

1. **Install Dependencies**:
   - Rust toolchain (`rustup`)
   - Node.js 18+

2. **Run Script**:
   We've provided a helper script that cleans ports and launches both services:
   ```bash
   ./run_local.sh
   ```

---

## 📂 Project Structure

```
ExamWrapAI/
├── src/                # React Frontend
├── rust-backend/       # Rust Backend API
│   ├── src/
│   │   ├── routes/     # API Endpoints
│   │   ├── services/   # Gemini Integration
│   │   └── models/     # Data Types
│   └── Cargo.toml
├── Dockerfile          # Frontend Container
├── docker-compose.yml  # Orchestration
└── run_local.sh        # Dev Script
```

## 🔒 Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_API_KEY` | Required for AI features |
| `GOOGLE_MODEL_NAME` | e.g. `gemini-1.5-flash` |
| `SERVER_PORT` | Backend port (default 8080) |
| `ALLOWED_ORIGINS` | CORS allowed origin |

## �️ Data & Privacy
**No Database Required!**
ExamWrapAI is designed to be stateless and privacy-focused.
- No external database is used to store your exams or notes.
- Your progress is saved locally in your browser's **Local Storage**.
- Clearing your browser cache will reset your progress.

## 🧠 Evaluation Engine
How do we grade your answers without a vector database?
1. **Context-Aware Prompting**: We send the original question, your answer, and the initial context back to the Gemini LLM.
2. **AI Grading**: The AI acts as the evaluator, comparing your response against the implicit ground truth in the source material.
3. **Real-time Feedback**: This "Stateless Evaluation" allows us to give instant feedback without managing complex vector embeddings.

## �📝 License
MIT
