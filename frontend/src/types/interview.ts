export type InterviewMode = 'job' | 'knowledge' | 'cv_only' | 'mixed';
export type InterviewDifficulty = 'easy' | 'medium' | 'hard';
export type InterviewStatus = 'setup' | 'in_progress' | 'completed';

export interface InterviewBlueprint {
  title: string;
  focusAreas: string[];
  recommendedMaxQuestions: number;
  initialQuestion: string;
}

export interface InterviewMessage {
  id?: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

export interface InterviewSkill {
  skillName: string;
  score: number;
  feedback: string;
}

export interface InterviewReport {
  overallScore: number;
  overallFeedback: string;
  technicalSkills: InterviewSkill[];
  softSkills: InterviewSkill[];
  strengths: string[];
  weaknesses: string[];
}

export interface InterviewSession {
  id: string;
  mode: InterviewMode;
  status: InterviewStatus;
  createdAt: string;
  cvDocumentId?: string;
  jdDocumentId?: string;
  blueprint?: InterviewBlueprint;
  messages: InterviewMessage[];
  report?: InterviewReport;
}

export interface SetupInterviewParams {
  mode: 'job' | 'knowledge' | 'cv_only' | 'mixed';
  documentIds?: string[];
  topicName?: string;
  customText?: string;
  level?: string;
}

export interface ChatInterviewParams {
  sessionId: string;
  message: string;
}

export interface InterviewSessionData {
  _id: string;
  userId: string;
  mode: string;
  status: 'setup' | 'in_progress' | 'completed' | 'abandoned';
  topicId?: { _id: string; name: string };
  blueprint?: Record<string, any>;
  messages: Array<{ role: string; content: string; timestamp: string }>;
  report?: InterviewReport;
  maxQuestions: number;
  questionsAsked: number;
  createdAt: string;
  updatedAt: string;
}
