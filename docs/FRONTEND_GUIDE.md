# ExamWrapAI - Frontend Documentation 🎨

## 1. Architecture Overview 🏗️
ExamWrapAI uses a **Single Page Application (SPA)** architecture built with **React 19**, **Vite**, and **TypeScript**. 

### Key Design Patterns:
*   **View-Based Navigation**: Instead of relying heavily on URL routing libraries for internal flows, the app uses a `view` state enum (`AppView`) in `App.tsx` to switch between major screens (Upload, Dashboard, Exam, Results). This enables smoother transitions and easier state retention without complex routing configurations.
*   **Lazy Loading**: Critical components like `ExamInterface` and `ResultsDashboard` are lazy-loaded via `React.lazy` and `Suspense` to improve initial load time.
*   **Glassmorphism UI**: The design system relies heavily on `backdrop-blur`, semi-transparent whites/darks, and subtle gradients to achieve a modern, premium "Glass" effect.

## 2. Key Components 🧩

### `App.tsx` (The Controller)
*   **Role**: Acts as the central brain. It holds the global state (User Profile, Current Exam Config, Active Questions).
*   **State Management**: 
    *   `userProfile`: User stats (XP, Level, History).
    *   `questions`: The current set of generated questions.
    *   `view`: Controls which screen is visible.

### `ExamInterface.tsx` (The Core Experience)
*   **Role**: Handles the actual test-taking process.
*   **Features**:
    *   **Timer**: A countdown timer with visual and audio alerts (ticking sound in last 2 mins).
    *   **Palette**: Quick navigation grid to jump between questions.
    *   **Review Mode**: Can be reused to show the correct answers after the exam.
    *   **Responsive**: Splits into a Document View (Left) and Question View (Right) on large screens.

### `Dashboard.tsx` (The Hub)
*   **Role**: Displays user progress, history, and starting points for new actions.
*   **Features**:
    *   **Gamification**: Shows Level progress bar and XP.
    *   **History**: Tabular view of past exams with "Retake" and "Review" options.

### `NotesFormatter.tsx` (Smart Tool)
*   **Role**: A utility to clean up messy notes.
*   **Tech**: Sends raw text to Backend -> Gemini AI -> Returns Markdown -> Renders in custom Markdown Viewer.
*   **Storage**: Saves processed notes to Local Storage (`localStorage`).

## 3. Data Flow 🔄

1.  **Input**: User performs an action (e.g., clicks "Start Exam").
2.  **Service Layer**: `geminiService.ts` wraps the HTTP call.
3.  **Backend Call**: Request sent to `http://localhost:8080/api/generate-exam`.
4.  **Response**: JSON data received (ARRAY of `Question` objects).
5.  **State Update**: `App.tsx` updates `questions` state and changes `view` to `AppView.EXAM`.

## 4. Styling Strategy 💅
*   **TailwindCSS**: Used for 99% of styling.
*   **Utility First**: We use specific classes for glass effects (e.g., `bg-white/5 border-white/10 backdrop-blur-md`).
*   **Animations**: Custom keyframes in `index.html` (e.g., `fade-in`, `slide-up`) are used for transitions.

## 5. Development Tips 💡
*   **Adding a new View**: 
    1. Add enum to `AppView` in `types.ts`.
    2. Import component in `App.tsx`.
    3. Add conditional render block in `App.tsx`.
*   **Modifying Exam Logic**: Check `components/ExamInterface.tsx`. It handles the auto-submission and timer logic locally.
