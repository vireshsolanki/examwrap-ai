# ExamWarp AI 🚀

**ExamWarp AI** is an advanced, enterprise-grade exam simulator powered by Google's Gemini 2.5 Flash. It transforms static PDF study materials into adaptive, interactive mock exams with real-time analytics, personalized revision plans, and gamified progress tracking.

## ✨ Key Features

- **📄 Universal PDF Parsing**: Drag & drop any textbook, notes, or syllabus (runs locally in-browser).
- **🧠 Context-Aware Syllabus**: AI automatically extracts topics, subtopics, and detects exam difficulty.
- **📝 Adaptive Question Bank**: Generates MCQs, Short Answers, and Long Form questions with detailed explanations.
- **⏱️ Professional Exam Interface**:
  - Split-screen layout (Text vs. Input).
  - Configurable Time Limits (Total & Per-Question).
  - Question Palette & Review Flags.
- **📊 Deep Analytics**:
  - Identifies "Concept Gaps" vs. "Careless Mistakes".
  - Generates a 7-Day Interactive Revision Plan.
  - Smart Summary Generator.
- **💾 Local Persistence**: Saves exam history, XP, and user profile to LocalStorage (Privacy first).

## 🛠️ Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- A **Google Gemini API Key** (Get it [here](https://aistudio.google.com/app/apikey))

## 🚀 Local Setup Guide

Follow these steps to run the application on your local machine:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/examwarp-ai.git
cd examwarp-ai
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

1.  Rename `.env.example` to `.env`.
2.  Open `.env` and paste your Google API Key.

```bash
cp .env.example .env
```

**Inside `.env`:**

```env
API_KEY=AIzaSy...YourKeyHere
```

> **Note:** The application uses `process.env.API_KEY`. Ensure your bundler (Vite/Webpack) is configured to expose this, or prefix it (e.g., `VITE_API_KEY`) and update `services/geminiService.ts` accordingly if using a specific framework starter.

### 4. Run the Application

```bash
npm start
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🏗️ Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI Engine**: Google GenAI SDK (`gemini-2.5-flash`)
- **PDF Engine**: PDF.js (Client-side extraction)
- **Icons**: Lucide React
- **Charts**: Recharts

## 🔒 Privacy Note

This application processes PDF files **entirely in the browser** using Web Workers. Your documents are **not** uploaded to any server. Only text snippets are sent to the Gemini API for question generation.

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

Built with ❤️ for students and lifelong learners.
