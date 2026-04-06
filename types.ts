
export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export enum QuestionType {
  MCQ = 'MCQ',
  ShortAnswer = 'ShortAnswer',
  LongAnswer = 'LongAnswer',
  NUMERICAL = 'NUMERICAL',
  ASSERTION_REASONING = 'ASSERTION_REASONING',
  MULTI_CORRECT = 'MULTI_CORRECT',
}

export enum ExamProbability {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export enum ExamMode {
  PRACTICE = 'PRACTICE',
  REVIEW = 'REVIEW'
}

export enum ExamPersona {
  UNIFIED = 'UNIFIED',
  UPSC = 'UPSC',
  JEE_NEET = 'JEE_NEET',
  CA_CFA = 'CA_CFA',
  SAT_CAT = 'SAT_CAT'
}

export enum ExamType {
  JEE_MAINS = 'JEE_MAINS',
  JEE_ADVANCED = 'JEE_ADVANCED',
  NEET = 'NEET',
  CAT = 'CAT',
  GATE = 'GATE',
  UPSC = 'UPSC',
  UNIVERSITY = 'UNIVERSITY',
  SCHOOL_CBSE = 'SCHOOL_CBSE',
  SCHOOL_ICSE = 'SCHOOL_ICSE',
  OTHER = 'OTHER'
}

export enum StudyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export interface Subtopic {
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subtopics: Subtopic[];
}

export interface ExamConfig {
  questionCount: number;
  questionTypes: QuestionType[];
  focusTopics: string[]; // If empty, cover all
  timeLimitMinutes: number;
  timeLimitPerQuestionSeconds?: number; // Optional per-question timer
  isRetest?: boolean; // If true, might skip generation
  filterIncorrect?: boolean; // For re-attempting wrong answers
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswerIndex?: number;
  modelAnswer?: string;
  explanation: string;
  difficulty: Difficulty;
  probability: ExamProbability;
  topicId: string;
  topicName: string;
  sourceCitation?: string;
  // Enhanced metadata for better learning
  pageNumber?: number;
  conceptTag?: string;
  subtopicName?: string;
  // Exam-specific fields
  numericalAnswer?: number;
  correctAnswerIndices?: number[];
  assertionStatement?: string;
  reasoningStatement?: string;
}

export interface UserAnswer {
  questionId: string;
  selectedOptionIndex?: number;
  textAnswer?: string;
  timeSpentSeconds: number;
  isCorrect?: boolean; // Tracked locally for retest logic
}

export interface ExamResult {
  score: number;
  totalQuestions: number;
  accuracy: number;
  weakTopics: string[];
  strongTopics: string[];
  feedback: string;
  timeManagementAnalysis: string;
  conceptGaps: string[];
  carelessMistakes: string[];
  referenceSnippets: string[];
  xpEarned: number; // Gamification
  recommendedDuration: number; // AI suggested days for revision
  // Enhanced analytics
  conceptWisePerformance?: {
    [conceptName: string]: {
      attempted: number;
      correct: number;
      accuracy: number;
    };
  };
  weakConcepts?: string[];
}

export interface RevisionDay {
  day: number;
  focus: string;
  tasks: string[];
}

export interface RevisionPlan {
  schedule: RevisionDay[];
  generalAdvice: string;
}

export enum AppView {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  UPLOAD = 'UPLOAD',
  VERIFY_SUBJECT = 'VERIFY_SUBJECT',
  CONFIG = 'CONFIG',
  SYLLABUS = 'SYLLABUS',
  EXAM = 'EXAM',
  RESULTS = 'RESULTS',
  REVISION = 'REVISION',
  SUMMARY = 'SUMMARY',
  NOTES_FORMATTER = 'NOTES_FORMATTER',
  EXAM_EXPORT = 'EXAM_EXPORT',
  PDF_SUMMARISER = 'PDF_SUMMARISER'
}

export interface SubjectAnalysis {
  subjectName: string;
  examType: string; // e.g., "AP Biology", "University Final", "Certification"
  confidence: number;
  summary: string;
}

export interface SubjectContext {
  subjectName: string;
  examType: string;
  persona: ExamPersona;
  // Enhanced exam context
  userExamType?: ExamType;
  studyLevel?: StudyLevel;
}

// User & History Types
export interface ExamHistoryItem {
  id: string;
  date: string; // ISO String
  subjectName: string;
  score: number;
  totalQuestions: number;
}

export interface FullExamRecord {
  id: string;
  date: string;
  subjectName: string;
  examType: string;
  questions: Question[];
  userAnswers: UserAnswer[];
  result: ExamResult;
  config: ExamConfig;
  plan?: RevisionPlan;
  revisionProgress?: string[]; // Array of completed task IDs (e.g. "1-0")
}

export interface UserProfile {
  name: string;
  targetExam: string; // e.g., "College", "Certification"
  xp: number;
  level: number;
  history: ExamHistoryItem[];
  hasSeenTour?: boolean;
  persona?: ExamPersona;
  // New fields for exam-specific optimization
  examType?: ExamType;
  studyLevel?: StudyLevel;
  examDate?: string; // ISO date string
  daysRemaining?: number; // Calculated from examDate
  // Config-based fields
  examCategoryId?: string; // e.g., 'iit_jee', 'ca', 'class_10'
  personaId?: string;      // e.g., 'iit_professor', 'school_teacher'
  toneId?: string;         // e.g., 'rigorous', 'supportive'
}

export interface NoteRecord {
  id: string;
  date: string;
  title: string;
  content: string;
}

// ─── PDF Summariser Types ────────────────────────────────────────────────────

export type SummaryLengthMode = 'words' | 'pages';

export interface PdfSummaryConfig {
  lengthMode: SummaryLengthMode;
  wordCount?: number;
  pageCount?: number;
  personaId: string;
  toneId: string;
}

export interface PdfSummaryRecord {
  id: string;
  date: string;
  fileName: string;
  title: string;
  summary: string;
  config: PdfSummaryConfig;
}
