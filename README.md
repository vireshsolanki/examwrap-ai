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

## 📝 License
MIT
