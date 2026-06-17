import { generateAIResponse } from '@/lib/ai/client';
import {
  buildQuestionGenerationPrompt,
  buildEvaluationPrompt,
  buildReportPrompt,
  buildResumeAnalysisPrompt,
} from './prompts';
import { Question, Difficulty, InterviewType, AnswerFeedback } from '@/types/interview';
import { Resume } from '@/types/resume';

// ── JSON Parser ────────────────────────────────────────────────

const parseJSON = <T>(text: string): T => {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
};

// ── Generate Interview Questions ───────────────────────────────

export const generateQuestions = async ({
  role,
  type,
  difficulty,
  resumeText,
  count = 8,
}: {
  role: string;
  type: InterviewType;
  difficulty: Difficulty;
  resumeText?: string;
  count?: number;
}): Promise<Question[]> => {
  const prompt = buildQuestionGenerationPrompt({ role, type, difficulty, resumeText, count });

  console.log('[OpenRouter] Generating questions for role:', role);
  const text = await generateAIResponse(prompt);

  return parseJSON<Question[]>(text);
};

// ── Evaluate Answer ────────────────────────────────────────────

export const evaluateAnswer = async ({
  question,
  answer,
  role,
  difficulty,
}: {
  question: string;
  answer: string;
  role: string;
  difficulty: Difficulty;
}): Promise<AnswerFeedback> => {
  const prompt = buildEvaluationPrompt({ question, answer, role, difficulty });

  console.log('[OpenRouter] Evaluating answer for role:', role);
  const text = await generateAIResponse(prompt);

  return parseJSON<AnswerFeedback>(text);
};

// ── Generate Full Report ───────────────────────────────────────

export const generateReport = async ({
  role,
  type,
  questions,
  answers,
  overallScore,
}: {
  role: string;
  type: string;
  questions: Array<{ text: string; type: string }>;
  answers: Array<{ text: string; score?: number }>;
  overallScore: number;
}) => {
  const prompt = buildReportPrompt({ role, type, questions, answers, overallScore });

  console.log('[OpenRouter] Generating report for role:', role);
  const text = await generateAIResponse(prompt);

  return parseJSON<{
    strengths: string[];
    weaknesses: string[];
    skillAnalysis: Record<string, number>;
    improvementRoadmap: Array<{
      area: string;
      priority: 'high' | 'medium' | 'low';
      suggestion: string;
      estimatedTime: string;
    }>;
    learningResources: Array<{
      title: string;
      url: string;
      type: string;
      topic: string;
    }>;
    summary: string;
  }>(text);
};

// ── Analyze Resume ─────────────────────────────────────────────

export const analyzeResume = async (resumeText: string): Promise<Partial<Resume>> => {
  const prompt = buildResumeAnalysisPrompt(resumeText);

  console.log('[OpenRouter] Analyzing resume...');
  const text = await generateAIResponse(prompt);

  return parseJSON<Partial<Resume>>(text);
};
