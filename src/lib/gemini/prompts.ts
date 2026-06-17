import { Difficulty, InterviewType } from '@/types/interview';

// ── System Prompt ──────────────────────────────────────────────

const SYSTEM_CONTEXT = `You are ORATO, an elite AI interview coach and evaluator. 
You simulate realistic interview scenarios and provide expert-level, actionable feedback.
Be professional, direct, and constructive — like a senior hiring manager at a top tech company.`;

// ── Question Generation ────────────────────────────────────────

export const buildQuestionGenerationPrompt = ({
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
}) => {
  const difficultyMap = {
    easy: 'junior-level, straightforward',
    medium: 'mid-level, moderately complex',
    hard: 'senior-level, highly complex and nuanced',
    adaptive: 'progressively challenging',
  };

  const typeMap: Record<string, string> = {
    hr: 'behavioral, cultural fit, and situational',
    technical: 'data structures, algorithms, system design, and problem-solving',
    'ai-ml': 'machine learning concepts, deep learning, MLOps, and AI system design',
    frontend: 'JavaScript, React, CSS, performance optimization, and browser internals',
    backend: 'APIs, databases, scalability, distributed systems, and backend architecture',
    fullstack: 'end-to-end engineering, system design, and full product thinking',
    custom: 'mixed technical and behavioral',
  };

  const resumeSection = resumeText
    ? `\n\nCandidate's Resume:\n---\n${resumeText.slice(0, 1500)}\n---\n\nGenerate questions that are specifically relevant to their experience, projects, and skills.`
    : '';

  return `${SYSTEM_CONTEXT}

Generate exactly ${count} unique interview questions for a ${role} position.

Interview Type: ${typeMap[type] || typeMap.technical}
Difficulty: ${difficultyMap[difficulty]}${resumeSection}

Requirements:
- Mix question types: technical, behavioral, project-based, scenario-based
- No repetition, no generic questions
- Each question must be specific and thoughtful
- Questions should feel like they come from a real senior interviewer

Return ONLY a valid JSON array in this exact format:
[
  {
    "id": "q1",
    "text": "Question text here",
    "type": "technical|behavioral|project|scenario|followup",
    "difficulty": "${difficulty}",
    "category": "Category label (e.g. System Design, React Hooks, Leadership)"
  }
]

Return only the JSON array, no other text. Keep questions concise and focused.`;
};

// ── Answer Evaluation ──────────────────────────────────────────

export const buildEvaluationPrompt = ({
  question,
  answer,
  role,
  difficulty,
}: {
  question: string;
  answer: string;
  role: string;
  difficulty: Difficulty;
}) => {
  return `${SYSTEM_CONTEXT}

Evaluate this interview answer for a ${role} position (${difficulty} difficulty):

QUESTION: ${question}

CANDIDATE'S ANSWER: ${answer}

Provide a thorough, constructive evaluation. Be specific — reference what they said.

Return ONLY valid JSON in this exact format:
{
  "score": 85,
  "technicalAccuracy": 80,
  "communication": 90,
  "clarity": 85,
  "completeness": 75,
  "depth": 80,
  "strengths": [
    "Specific strength 1",
    "Specific strength 2"
  ],
  "weaknesses": [
    "Specific weakness or gap 1",
    "Specific weakness or gap 2"
  ],
  "suggestions": [
    "Actionable improvement suggestion 1",
    "Actionable improvement suggestion 2"
  ]
}

All scores are 0-100. Return only the JSON object, no other text. Keep strengths, weaknesses, and suggestions concise and actionable.`;
};

// ── Full Report Generation ─────────────────────────────────────

export const buildReportPrompt = ({
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
  const qa = questions
    .map((q, i) => `Q${i + 1} (${q.type}): ${q.text}\nA${i + 1}: ${answers[i]?.text || 'No answer'} [Score: ${answers[i]?.score ?? 'N/A'}/100]`)
    .join('\n\n');

  return `${SYSTEM_CONTEXT}

Generate a comprehensive interview performance report.

Role: ${role}
Type: ${type}
Overall Score: ${overallScore}/100

Interview Q&A:
${qa}

Return ONLY valid JSON in this exact format:
{
  "strengths": ["Top strength 1", "Top strength 2", "Top strength 3"],
  "weaknesses": ["Key weakness 1", "Key weakness 2"],
  "skillAnalysis": {
    "Technical Knowledge": 80,
    "Communication": 85,
    "Problem Solving": 75,
    "System Design": 70,
    "Code Quality": 80
  },
  "improvementRoadmap": [
    {
      "area": "Skill area",
      "priority": "high|medium|low",
      "suggestion": "Specific, actionable suggestion",
      "estimatedTime": "2-4 weeks"
    }
  ],
  "learningResources": [
    {
      "title": "Resource title",
      "url": "https://example.com",
      "type": "article|video|course|documentation",
      "topic": "Related topic"
    }
  ],
  "summary": "2-3 sentence overall performance summary"
}

Return only the JSON object, no other text. Keep strengths, weaknesses, roadmap items, and summary concise.`;
};

// ── Resume Analysis ────────────────────────────────────────────

export const buildResumeAnalysisPrompt = (resumeText: string) => {
  return `${SYSTEM_CONTEXT}

Analyze this resume and extract structured information.

RESUME:
---
${resumeText.slice(0, 2000)}
---

Return ONLY valid JSON in this exact format:
{
  "skills": ["skill1", "skill2", "skill3"],
  "projects": [
    {
      "name": "Project name",
      "description": "Brief description",
      "technologies": ["tech1", "tech2"]
    }
  ],
  "education": [
    {
      "institution": "University name",
      "degree": "Degree type",
      "field": "Field of study",
      "year": "Graduation year"
    }
  ],
  "experience": [
    {
      "company": "Company name",
      "role": "Job title",
      "duration": "Duration",
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "suggestedRoles": ["Role 1", "Role 2", "Role 3"],
  "resumeScore": 78,
  "summary": "Brief professional summary"
}

Return only the JSON object, no other text. Keep skills, highlights, and summary concise.`;
};
