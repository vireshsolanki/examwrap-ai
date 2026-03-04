# ExamWarp AI 🚀

> Your Personal AI Study Architect — Upload PDFs, Generate Exams, Analyze Performance.

[![Beta](https://img.shields.io/badge/Status-Beta-orange?style=for-the-badge)](#-beta-notice--important)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-blue?style=for-the-badge)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#-license)

---

## 🌟 What is ExamWarp?

ExamWarp AI transforms your study materials (PDFs, Notes, Textbooks) into **interactive practice exams** powered by **Google Gemini AI**. Upload your content, get intelligent questions, take timed exams, and receive detailed performance analytics — all in seconds.

### ✨ Key Features

- 📄 **Smart PDF Upload** — Upload highlighted PDFs; AI prioritizes your highlights for question generation
- 🧠 **AI-Powered Exam Generation** — MCQs, Short Answer, Long Answer, Numerical, and Assertion-Reasoning questions
- 📊 **Performance Analytics** — Detailed score breakdown, concept gap analysis, and careless mistake detection
- 📅 **Custom Revision Plans** — AI-generated study schedules tailored to your weak areas
- 🎯 **Exam Persona Modes** — Specialized modes for UPSC, JEE/NEET, CA/CFA, SAT/CAT, and General exams
- 📝 **Notes Formatter** — Convert rough notes into structured study guides
- 📤 **PDF Export** — Download question papers and answer keys as PDFs
- 🏆 **XP & Level System** — Gamified progress tracking to keep you motivated
- 🔄 **API Key Failover** — Automatic key switching when rate limits are hit (zero downtime)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite + TailwindCSS + Lucide Icons |
| **Backend** | Rust + Axum (high performance, memory efficient) |
| **AI Engine** | Google Gemini API (gemini-2.5-flash) |
| **Storage** | Browser LocalStorage (no database required) |

---

## 🚀 Quick Start

### Docker (Recommended)

1. **Prerequisites**: Docker & Docker Compose installed.

2. **Setup Environment**:
   ```bash
   cp rust-backend/.env.example rust-backend/.env
   # Edit rust-backend/.env and add your Google API key(s)
   ```

3. **Run**:
   ```bash
   docker-compose up --build
   ```

4. **Access**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend Health: [http://localhost:8080/api/health](http://localhost:8080/api/health)

### Local Development (No Docker)

1. **Install Dependencies**:
   - Rust toolchain (`rustup`)
   - Node.js 18+

2. **Run**:
   ```bash
   ./run_local.sh
   ```

---

## 📂 Project Structure

```
ExamWarpAI/
├── App.tsx                    # Main React application
├── components/                # React components
│   ├── BetaWarningModal.tsx   # First-visit beta warning popup
│   ├── PdfUploadGuide.tsx     # Step-by-step PDF upload guide
│   ├── FileUpload.tsx         # File upload with drag & drop
│   ├── Dashboard.tsx          # User dashboard
│   ├── ExamInterface.tsx      # Exam taking interface
│   ├── ResultsDashboard.tsx   # Performance analytics
│   └── ...more components
├── services/                  # Frontend services
│   ├── geminiService.ts       # API client for backend
│   ├── storageService.ts      # LocalStorage management
│   └── pdfService.ts          # PDF text extraction
├── rust-backend/              # Rust Backend API
│   ├── src/
│   │   ├── config/            # Configuration & exam patterns
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Gemini integration (with key failover)
│   │   └── models/            # Data types
│   └── Cargo.toml
├── index.html                 # Entry point
├── docker-compose.yml         # Docker orchestration
└── run_local.sh               # Local dev script
```

---

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | ✅ | Primary Google Gemini API key |
| `GOOGLE_API_KEY_2` | ❌ | Fallback API key (auto-switches on rate limit) |
| `GOOGLE_MODEL_NAME` | ❌ | AI model (default: `gemini-2.5-flash`) |
| `SERVER_PORT` | ❌ | Backend port (default: `8080`) |
| `BIND_ADDRESS` | ❌ | Bind address (default: `0.0.0.0:8080`) |
| `ALLOWED_ORIGINS` | ❌ | CORS allowed origins (default: `*`) |

### 🔄 API Key Failover

ExamWarp supports **automatic API key failover**. If the primary key (`GOOGLE_API_KEY`) hits a rate limit or quota, the backend automatically switches to the fallback key (`GOOGLE_API_KEY_2`) — no request is dropped.

```env
# rust-backend/.env
GOOGLE_API_KEY=your_primary_key_here
GOOGLE_API_KEY_2=your_fallback_key_here   # Auto-failover when primary is exhausted
```

The system detects HTTP 429 (rate limit), 403 (forbidden), and `RESOURCE_EXHAUSTED` errors to trigger failover. Keys rotate automatically — no manual intervention needed.

---

## ⚠️ Beta Notice — Important!

> **ExamWarp is currently in beta.**

- 🗄️ **No Database** — All data is stored in your browser's **LocalStorage**
- 🧹 **Cache = Data** — Clearing your browser cache/cookies **will erase all progress**
- 💾 We recommend exporting important question papers as PDFs before clearing your browser

---

## 📄 How to Upload a Highlighted PDF

For the best exam generation results:

1. **Open your PDF** in any reader (Adobe Acrobat, Chrome, Preview)
2. **Highlight** key definitions, formulas, and concepts
3. **Save** the PDF with highlights embedded
4. **Upload** to ExamWarp — our AI prioritizes highlighted text as "High-Yield" content
5. **Generate** — questions will focus on your highlighted areas for maximum relevance

> 💡 The app includes a built-in step-by-step guide accessible via the **"How to Upload a Highlighted PDF"** button on the upload page.

---

## 🧠 How the AI Evaluation Engine Works

ExamWarp uses a **stateless evaluation** approach — no vector database needed:

1. **Context-Aware Prompting** — The original question, your answer, and source material are sent to Gemini
2. **AI Grading** — Gemini acts as the evaluator, comparing responses against the source material
3. **Real-time Feedback** — Instant results with concept gap analysis and revision recommendations

---

## 📬 Contact

For feedback, bugs, feature requests, or involvement:

- 📧 **Email**: [vireshsolanki58@gmail.com](mailto:vireshsolanki58@gmail.com)
- 💼 **LinkedIn**: [linkedin.com/in/viresh-solanki](https://linkedin.com/in/viresh-solanki)

---

## 📝 License

MIT

---

<p align="center">
  <strong>Built with ❤️ by Viresh Solanki</strong><br/>
  <sub>Powered by Google Gemini AI</sub>
</p>
