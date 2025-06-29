export interface PerformanceMetrics {
  id: string;
  employeeId: string;
  period: string; // e.g., "2024-Q1"
  systemUsageScore: number; // 0-100
  skillDevelopmentScore: number; // 0-100
  assessmentParticipationScore: number; // 0-100
  learningEngagementScore: number; // 0-100
  overallPerformanceScore: number; // 0-100
  goals: PerformanceGoal[];
  feedback: PerformanceFeedback[];
  lastReviewDate: Date;
  nextReviewDate: Date;
  status: 'on-track' | 'needs-improvement' | 'exceeds-expectations';
}

export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  category: 'skill-development' | 'system-usage' | 'assessment-completion' | 'learning-engagement';
  targetValue: number;
  currentValue: number;
  deadline: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceFeedback {
  id: string;
  fromUserId: string;
  fromUserName: string;
  type: 'system-usage' | 'skill-assessment' | 'learning-progress' | 'general';
  message: string;
  rating?: number; // 1-5
  isPublic: boolean;
  createdAt: Date;
}

export interface SystemUsageMetrics {
  loginFrequency: number;
  skillsUpdatedCount: number;
  assessmentsCompleted: number;
  learningPathsStarted: number;
  learningPathsCompleted: number;
  timeSpentInSystem: number; // minutes
  featuresUsed: string[];
  lastActiveDate: Date;
}