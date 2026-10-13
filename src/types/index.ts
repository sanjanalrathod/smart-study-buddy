export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  color: string;
  date: string;
  isPinned?: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTag?: string;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: QuizQuestion[];
  dateCreated: string;
  highScore?: number;
}

export interface StudyPlanMilestone {
  dayOrWeek: string;
  focusTopic: string;
  tasks: string[];
  reviewTechnique?: string;
  estimatedMinutes?: number;
  completed?: boolean;
}

export interface StudyPlan {
  id: string;
  examName: string;
  examDate: string;
  availableHours: number;
  strategyOverview: string;
  recommendedPomodoroFormat: string;
  milestones: StudyPlanMilestone[];
  proStudyTips: string[];
}

export interface DocumentSummary {
  id: string;
  title: string;
  sourceType: 'pdf' | 'text';
  executiveSummary: string;
  estimatedReadingMinutes: number;
  keyTakeaways: string[];
  keyTerms: { term: string; definition: string }[];
  likelyExamQuestions: { question: string; briefAnswer: string }[];
  originalTextLength: number;
  date: string;
}

export interface TutorMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  mode?: 'eli5' | 'simple_student' | 'exam_master';
  topic?: string;
}
