export interface Skill {
  id: string;
  name: string;
  category: string;
  level: SkillLevel;
  lastAssessed: Date;
  targetLevel: SkillLevel;
  priority: Priority;
  description?: string;
  evidence?: string[];
  developmentPlan?: string;
  assessmentCriteria?: AssessmentCriteria[];
  certifications?: Certification[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  skills: Skill[];
  qualifications: Qualification[];
  certifications: Certification[];
  joinDate: Date;
  lastAssessment?: Date;
}

export interface AssessmentCriteria {
  id: string;
  skillId: string;
  level: SkillLevel;
  description: string;
  requirements: string[];
  examples: string[];
}

export interface Qualification {
  id: string;
  name: string;
  institution: string;
  dateObtained: Date;
  expiryDate?: Date;
  verified: boolean;
  type: QualificationType;
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
  dateObtained: Date;
  expiryDate?: Date;
  credentialId?: string;
  verified: boolean;
  skillsRelated: string[];
}

export interface JobProfile {
  id: string;
  title: string;
  department: string;
  level: JobLevel;
  requiredSkills: RequiredSkill[];
  preferredSkills: RequiredSkill[];
  description: string;
  responsibilities: string[];
}

export interface RequiredSkill {
  skillId: string;
  minimumLevel: SkillLevel;
  weight: number; // 1-10 importance scale
  mandatory: boolean;
}

export interface SkillGap {
  employeeId: string;
  skillId: string;
  currentLevel: SkillLevel;
  requiredLevel: SkillLevel;
  gap: number;
  priority: Priority;
}

export interface Assessment {
  id: string;
  employeeId: string;
  assessorId: string;
  skillId: string;
  previousLevel: SkillLevel;
  newLevel: SkillLevel;
  assessmentDate: Date;
  notes: string;
  evidence: string[];
  nextReviewDate: Date;
}

export enum SkillLevel {
  BEGINNER = 1,
  INTERMEDIATE = 2,
  ADVANCED = 3,
  EXPERT = 4,
  MASTER = 5
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum QualificationType {
  DEGREE = 'degree',
  DIPLOMA = 'diploma',
  CERTIFICATE = 'certificate',
  LICENSE = 'license'
}

export enum JobLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  PRINCIPAL = 'principal'
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface AuditReport {
  id: string;
  title: string;
  createdAt: Date;
  skills: Skill[];
  overallScore: number;
  recommendations: string[];
}

export interface OrganizationMetrics {
  totalEmployees: number;
  skillsTracked: number;
  averageSkillLevel: number;
  skillGaps: number;
  certificationsExpiring: number;
  assessmentsDue: number;
}