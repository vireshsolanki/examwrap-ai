
import { UserProfile, ExamHistoryItem, FullExamRecord, NoteRecord, ExamPersona } from '../types';

const USER_STORAGE_KEY = 'examwarp_user_v1';
const EXAM_RECORD_PREFIX = 'examwarp_record_';
const NOTES_STORAGE_KEY = 'examwarp_notes_v1';

const INITIAL_PROFILE: UserProfile = {
  name: '',
  targetExam: '',
  xp: 0,
  level: 1,
  history: [],
  hasSeenTour: false,
  persona: ExamPersona.UNIFIED
};

// User Profile Management
export const loadUserProfile = (): UserProfile | null => {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load user profile", e);
    return null;
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save user profile", e);
  }
};

export const createUserProfile = (name: string, targetExam: string, persona: ExamPersona): UserProfile => {
  const newProfile = { ...INITIAL_PROFILE, name, targetExam, persona };
  saveUserProfile(newProfile);
  return newProfile;
};

export const setHasSeenTour = (hasSeen: boolean): UserProfile | null => {
  const profile = loadUserProfile();
  if (profile) {
    profile.hasSeenTour = hasSeen;
    saveUserProfile(profile);
    return profile;
  }
  return null;
};

// Exam History & Record Management
export const saveFullExamRecord = (record: FullExamRecord): void => {
  try {
    localStorage.setItem(`${EXAM_RECORD_PREFIX}${record.id}`, JSON.stringify(record));
  } catch (e) {
    console.error("Failed to save exam record", e);
  }
};

export const getFullExamRecord = (id: string): FullExamRecord | null => {
  try {
    const stored = localStorage.getItem(`${EXAM_RECORD_PREFIX}${id}`);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load exam record", e);
    return null;
  }
};

export const deleteExamRecord = (id: string): UserProfile | null => {
  const profile = loadUserProfile();
  if (!profile) return null;

  profile.history = profile.history.filter(h => h.id !== id);
  saveUserProfile(profile);

  try {
    localStorage.removeItem(`${EXAM_RECORD_PREFIX}${id}`);
  } catch (e) {
    console.error("Failed to delete exam record from storage", e);
  }

  return profile;
};

export const updateExamRevisionProgress = (examId: string, progress: string[]) => {
  const record = getFullExamRecord(examId);
  if (record) {
    record.revisionProgress = progress;
    saveFullExamRecord(record);
  }
};

export const addXpAndHistory = (xp: number, historyItem: ExamHistoryItem, fullRecord?: FullExamRecord): UserProfile => {
  const current = loadUserProfile() || INITIAL_PROFILE;

  if (fullRecord) {
    saveFullExamRecord(fullRecord);
  }

  const newXp = current.xp + xp;
  const newLevel = Math.floor(newXp / 1000) + 1;

  const updated: UserProfile = {
    ...current,
    xp: newXp,
    level: newLevel,
    history: [historyItem, ...current.history]
  };

  saveUserProfile(updated);
  return updated;
};

// Notes Management
export const saveNote = (note: NoteRecord): void => {
  const notes = loadNotes();
  const existingIndex = notes.findIndex(n => n.id === note.id);

  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.unshift(note);
  }

  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error("Failed to save notes", e);
  }
};

export const loadNotes = (): NoteRecord[] => {
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load notes", e);
    return [];
  }
};

export const deleteNote = (id: string): NoteRecord[] => {
  const notes = loadNotes().filter(n => n.id !== id);
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error("Failed to delete note", e);
  }
  return notes;
};
