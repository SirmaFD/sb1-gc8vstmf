import { 
  Skill, 
  SkillLevel, 
  Priority, 
  SkillCategory, 
  Employee, 
  JobProfile, 
  JobLevel, 
  Qualification, 
  Certification, 
  QualificationType,
  AssessmentCriteria,
  Assessment
} from '../types';

export const skillCategories: SkillCategory[] = [
  {
    id: 'technical',
    name: 'Technical Skills',
    description: 'Programming, tools, and technical expertise',
    color: 'bg-blue-500'
  },
  {
    id: 'soft',
    name: 'Soft Skills',
    description: 'Communication, leadership, and interpersonal skills',
    color: 'bg-green-500'
  },
  {
    id: 'business',
    name: 'Business Skills',
    description: 'Strategy, analysis, and business acumen',
    color: 'bg-purple-500'
  },
  {
    id: 'design',
    name: 'Design Skills',
    description: 'UI/UX, visual design, and creative skills',
    color: 'bg-pink-500'
  }
];

export const assessmentCriteria: AssessmentCriteria[] = [
  {
    id: 'react-beginner',
    skillId: '1',
    level: SkillLevel.BEGINNER,
    description: 'Basic understanding of React concepts',
    requirements: [
      'Understands JSX syntax',
      'Can create functional components',
      'Basic understanding of props'
    ],
    examples: [
      'Built simple todo app',
      'Completed React tutorial'
    ]
  },
  {
    id: 'react-intermediate',
    skillId: '1',
    level: SkillLevel.INTERMEDIATE,
    description: 'Solid React development skills',
    requirements: [
      'Proficient with hooks (useState, useEffect)',
      'Understands component lifecycle',
      'Can manage state effectively',
      'Familiar with React Router'
    ],
    examples: [
      'Built multi-page application',
      'Implemented custom hooks'
    ]
  }
];

export const mockQualifications: Qualification[] = [
  {
    id: 'q1',
    name: 'Bachelor of Computer Science',
    institution: 'University of Technology',
    dateObtained: new Date('2020-05-15'),
    verified: true,
    type: QualificationType.DEGREE
  },
  {
    id: 'q2',
    name: 'AWS Solutions Architect',
    institution: 'Amazon Web Services',
    dateObtained: new Date('2023-03-10'),
    expiryDate: new Date('2026-03-10'),
    verified: true,
    type: QualificationType.CERTIFICATE
  }
];

export const mockCertifications: Certification[] = [
  {
    id: 'c1',
    name: 'React Developer Certification',
    provider: 'Meta',
    dateObtained: new Date('2023-06-15'),
    expiryDate: new Date('2025-06-15'),
    credentialId: 'META-REACT-2023-001',
    verified: true,
    skillsRelated: ['1', '2']
  },
  {
    id: 'c2',
    name: 'Scrum Master Certified',
    provider: 'Scrum Alliance',
    dateObtained: new Date('2023-01-20'),
    expiryDate: new Date('2025-01-20'),
    credentialId: 'CSM-2023-789',
    verified: true,
    skillsRelated: ['5']
  }
];

export const mockSkills: Skill[] = [
  {
    id: '1',
    name: 'React Development',
    category: 'technical',
    level: SkillLevel.ADVANCED,
    lastAssessed: new Date('2024-01-15'),
    targetLevel: SkillLevel.EXPERT,
    priority: Priority.HIGH,
    description: 'Building modern web applications with React',
    evidence: ['Built 5+ production React apps', 'Led React training sessions'],
    developmentPlan: 'Learn React 18 features, explore Next.js',
    assessmentCriteria: assessmentCriteria.filter(c => c.skillId === '1'),
    certifications: mockCertifications.filter(c => c.skillsRelated.includes('1'))
  },
  {
    id: '2',
    name: 'TypeScript',
    category: 'technical',
    level: SkillLevel.INTERMEDIATE,
    lastAssessed: new Date('2024-01-10'),
    targetLevel: SkillLevel.ADVANCED,
    priority: Priority.MEDIUM,
    description: 'Type-safe JavaScript development',
    evidence: ['Used in 3 projects', 'Completed TypeScript course'],
    developmentPlan: 'Practice advanced types, generics'
  },
  {
    id: '3',
    name: 'Team Leadership',
    category: 'soft',
    level: SkillLevel.INTERMEDIATE,
    lastAssessed: new Date('2024-01-05'),
    targetLevel: SkillLevel.ADVANCED,
    priority: Priority.HIGH,
    description: 'Leading and mentoring development teams',
    evidence: ['Led team of 4 developers', 'Mentored 2 junior developers'],
    developmentPlan: 'Take leadership course, practice delegation'
  },
  {
    id: '4',
    name: 'UI/UX Design',
    category: 'design',
    level: SkillLevel.BEGINNER,
    lastAssessed: new Date('2024-01-01'),
    targetLevel: SkillLevel.INTERMEDIATE,
    priority: Priority.MEDIUM,
    description: 'User interface and experience design',
    evidence: ['Designed 2 app interfaces'],
    developmentPlan: 'Learn Figma, study design principles'
  },
  {
    id: '5',
    name: 'Project Management',
    category: 'business',
    level: SkillLevel.ADVANCED,
    lastAssessed: new Date('2024-01-12'),
    targetLevel: SkillLevel.EXPERT,
    priority: Priority.HIGH,
    description: 'Planning and executing software projects',
    evidence: ['Managed 10+ projects', 'PMP certified'],
    developmentPlan: 'Learn Agile methodologies, Scrum certification'
  }
];

export const mockEmployees: Employee[] = [
  {
    id: 'emp1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    department: 'Engineering',
    role: 'Senior Developer',
    skills: mockSkills,
    qualifications: mockQualifications,
    certifications: mockCertifications,
    joinDate: new Date('2022-03-15'),
    lastAssessment: new Date('2024-01-15')
  },
  {
    id: 'emp2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Design',
    role: 'UX Designer',
    skills: mockSkills.filter(s => s.category === 'design' || s.category === 'soft'),
    qualifications: [mockQualifications[0]],
    certifications: [],
    joinDate: new Date('2023-01-10'),
    lastAssessment: new Date('2024-01-10')
  }
];

export const mockJobProfiles: JobProfile[] = [
  {
    id: 'job1',
    title: 'Senior React Developer',
    department: 'Engineering',
    level: JobLevel.SENIOR,
    description: 'Lead React development initiatives and mentor junior developers',
    responsibilities: [
      'Develop complex React applications',
      'Code review and mentoring',
      'Architecture decisions',
      'Performance optimization'
    ],
    requiredSkills: [
      { skillId: '1', minimumLevel: SkillLevel.ADVANCED, weight: 10, mandatory: true },
      { skillId: '2', minimumLevel: SkillLevel.INTERMEDIATE, weight: 8, mandatory: true },
      { skillId: '3', minimumLevel: SkillLevel.INTERMEDIATE, weight: 7, mandatory: false }
    ],
    preferredSkills: [
      { skillId: '5', minimumLevel: SkillLevel.INTERMEDIATE, weight: 6, mandatory: false }
    ]
  },
  {
    id: 'job2',
    title: 'UX Designer',
    department: 'Design',
    level: JobLevel.MID,
    description: 'Create user-centered designs for web and mobile applications',
    responsibilities: [
      'User research and analysis',
      'Wireframing and prototyping',
      'Design system maintenance',
      'Usability testing'
    ],
    requiredSkills: [
      { skillId: '4', minimumLevel: SkillLevel.ADVANCED, weight: 10, mandatory: true }
    ],
    preferredSkills: [
      { skillId: '3', minimumLevel: SkillLevel.INTERMEDIATE, weight: 5, mandatory: false }
    ]
  }
];

export const mockAssessments: Assessment[] = [
  {
    id: 'assess1',
    employeeId: 'emp1',
    assessorId: 'manager1',
    skillId: '1',
    previousLevel: SkillLevel.INTERMEDIATE,
    newLevel: SkillLevel.ADVANCED,
    assessmentDate: new Date('2024-01-15'),
    notes: 'Demonstrated excellent React skills in recent project. Ready for expert level training.',
    evidence: ['Led React migration project', 'Mentored 2 junior developers'],
    nextReviewDate: new Date('2024-07-15')
  }
];