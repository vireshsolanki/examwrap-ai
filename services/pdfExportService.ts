import { Question } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface PdfExportOptions {
  questions: Question[];
  title: string;
  timeLimit?: number; // in minutes
  maxMarks?: number;
}

export const exportQuestionPaper = async (options: PdfExportOptions): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/api/export-question-paper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questions: options.questions,
        title: options.title,
        timeLimit: options.timeLimit,
        maxMarks: options.maxMarks,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate question paper');
    }

    // Download the PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${options.title.replace(/[^a-zA-Z0-9]/g, '-')}-questions.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting question paper:', error);
    throw error;
  }
};

export const exportAnswerKey = async (options: PdfExportOptions): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/api/export-answer-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questions: options.questions,
        title: options.title,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate answer key');
    }

    // Download the PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${options.title.replace(/[^a-zA-Z0-9]/g, '-')}-answers.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting answer key:', error);
    throw error;
  }
};
