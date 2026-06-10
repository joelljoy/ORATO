export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  preferredInterviewType: InterviewType;
  skillPreferences: string[];
  createdAt: string;
  updatedAt: string;
}

export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

export type InterviewType = 'hr' | 'technical' | 'ai-ml' | 'frontend' | 'backend' | 'fullstack' | 'custom';
