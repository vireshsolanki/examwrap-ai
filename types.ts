
export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export enum QuestionType {
  MCQ = 'MCQ',
  ShortAnswer = 'ShortAnswer',
  LongAnswer = 'LongAnswer',
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
  xpEarned: number; // Gamification
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
  SUMMARY = 'SUMMARY'
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
}

export interface UserProfile {
  name: string;
  targetExam: string; // e.g., "College", "Certification"
  xp: number;
  level: number;
  history: ExamHistoryItem[];
}
