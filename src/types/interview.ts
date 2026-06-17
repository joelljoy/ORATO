import { InterviewType } from './user';
export type { InterviewType };

export type Difficulty = 'easy' | 'medium' | 'hard' | 'adaptive';
export type InterviewStatus = 'pending' | 'active' | 'completed' | 'abandoned';

export interface Interview {
  id: string;
  userId: string;
  resumeId: string | null;
  role: string;
  type: InterviewType;
  difficulty: Difficulty;
  status: InterviewStatus;
  startedAt: string | null;
  completedAt: string | null;
  questions: Question[];
  answers: Answer[];
  overallScore: number | null;
  totalQuestions: number;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  category: string;
  followUpOf?: string;
}

export type QuestionType = 'technical' | 'behavioral' | 'project' | 'scenario' | 'followup';

export interface Answer {
  questionId: string;
  text: string;
  submittedAt: string;
  score?: number;
  feedback?: AnswerFeedback;
  isEvaluated: boolean;
  videoUrl?: string;
  speakingDuration?: number;
}

export interface VideoResponse {
  id?: string;
  interviewId: string;
  userId: string;
  questionId: string;
  videoUrl: string;
  timestamp: string;
  duration?: number;
}

export interface AnswerFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  technicalAccuracy: number;
  communication: number;
  clarity: number;
  completeness: number;
  depth: number;
}

export interface InterviewSession {
  interview: Interview;
  currentQuestionIndex: number;
  timeElapsed: number;
  isPaused: boolean;
  isCompleted: boolean;
}
