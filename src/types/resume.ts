export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  storageUrl: string;
  uploadedAt: string;
  version: number;
  resumeScore: number;
  skills: string[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  experience: ResumeExperience[];
  suggestedRoles: string[];
  summary: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface ResumeExperience {
  company: string;
  role: string;
  duration: string;
  highlights: string[];
}

export interface ResumeUploadState {
  file: File | null;
  uploading: boolean;
  parsing: boolean;
  progress: number;
  error: string | null;
}
