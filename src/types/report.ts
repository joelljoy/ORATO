export interface Report {
  id: string;
  interviewId: string;
  userId: string;
  generatedAt: string;
  overallScore: number;
  breakdown: ReportBreakdown;
  skillAnalysis: SkillAnalysis;
  questionBreakdown: QuestionScore[];
  improvementRoadmap: RoadmapItem[];
  learningResources: LearningResource[];
  communicationScore: number;
  technicalScore: number;
  behavioralScore: number;
  strengths: string[];
  weaknesses: string[];
}

export interface ReportBreakdown {
  technicalAccuracy: number;
  communication: number;
  clarity: number;
  confidence: number;
  completeness: number;
  depth: number;
  problemSolving: number;
}

export interface SkillAnalysis {
  [skill: string]: number;
}

export interface QuestionScore {
  questionId: string;
  questionText: string;
  questionType: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface RoadmapItem {
  area: string;
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  estimatedTime: string;
}

export interface LearningResource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'course' | 'documentation';
  topic: string;
}
