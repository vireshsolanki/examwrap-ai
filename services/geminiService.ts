import { Topic, Question, ExamResult, RevisionPlan, UserAnswer, SubjectAnalysis, ExamConfig, SubjectContext } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Helper to handle API calls to the Rust backend
 */
async function callBackend<T>(endpoint: string, payload: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Unknown API error');
  }

  return result.data;
}

// 1. Identify Subject (Initial Guess)
export const identifySubject = async (content: string): Promise<SubjectAnalysis> => {
  return callBackend<SubjectAnalysis>('/identify-subject', { content });
};

// 2. Generate Syllabus Map (Context Aware)
export const generateSyllabus = async (content: string, context: SubjectContext): Promise<Topic[]> => {
  return callBackend<Topic[]>('/generate-syllabus', { content, context });
};

// 3. Generate Questions (Dynamic Config)
export const generateExamQuestions = async (
  content: string,
  topics: Topic[],
  config: ExamConfig,
  context: SubjectContext
): Promise<Question[]> => {
  return callBackend<Question[]>('/generate-exam', { content, topics, config, context });
};

// 4. Analyze Performance & Grant XP
export const analyzePerformance = async (
  questions: Question[],
  answers: UserAnswer[],
  context: SubjectContext
): Promise<{ result: ExamResult, plan: RevisionPlan }> => {
  return callBackend<{ result: ExamResult, plan: RevisionPlan }>('/analyze-performance', {
    questions,
    answers,
    context
  });
};

// 5. Regenerate Revision Plan (Custom Days)
export const regenerateRevisionPlan = async (
  weakTopics: string[],
  conceptGaps: string[],
  durationDays: number,
  context: SubjectContext
): Promise<RevisionPlan> => {
  return callBackend<RevisionPlan>('/regenerate-plan', {
    weakTopics,
    conceptGaps,
    durationDays,
    context
  });
};

// 6. Generate Smart Summary
export const generateSmartSummary = async (content: string, context: SubjectContext): Promise<string> => {
  return callBackend<string>('/generate-summary', { content, context });
};

// 7. Format Rough Notes
export const formatStudyNotes = async (roughNotes: string): Promise<string> => {
  return callBackend<string>('/format-notes', { roughNotes });
};
