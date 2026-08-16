export interface Question {
  id: number;
  section: string;
  question: string;
  options: string[];
  answer: number; // 0-indexed position
  explanation: string;
}

export interface MarkingScheme {
  correct: number;
  negative: number;
}

export interface Quiz {
  testId: string;
  title: string;
  totalTimeMinutes: number;
  markingScheme: MarkingScheme;
  questions: Question[];
  category?: 'full' | 'part_a' | 'part_b' | 'full_part_a';
  subject?: string;
  topic?: string;
  testType?: 'mock' | 'pyp' | 'full' | 'part_a_full';
  isPartA?: boolean;
  isPartAFullMock?: boolean;
  qCount?: number;
  file?: string;
}

export interface Attempt {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  accuracy: number;
  timeSpentSeconds: number;
  timestamp: string;
  mode: 'exam' | 'practice';
  questionTimeSpent?: Record<number, number>;
}

export interface Bookmark {
  quizId: string;
  quizTitle: string;
  question: Question;
}

export interface ReportedQuestionRecord {
  id: string;
  questionId: string | number;
  quizId: string;
  quizTitle: string;
  question: Question;
  reason: string;
  details: string;
  reportedAt: string;
  reportedBy: string;
  trace: any;
}

export const OFFICIAL_CS_TOPICS_LIST = [
  'Mathematics - I, II, III, IV',
  'Business Communication, Organization & Management',
  'Computer Basics and P.C. Software',
  'Programming in C, C++ & Data Structures',
  'Fundamentals of Information Technology',
  'Basis of Physics',
  'Digital Electronics',
  'Database Management System (DBMS)',
  'Computer Architecture',
  'Front End Designed Tools',
  'Financial Accounting',
  'Object/Computer Oriented Programming / Numerical Techniques',
  'Software Engineering',
  'Java Programming and Website Design',
  'Operating Systems',
  'Business Economics',
  'Computer Networks',
  '.NET Programming',
  'Linux Environment',
  'E-Commerce',
  'Design and Analysis of Algorithms (DAA)',
  'Computer Network Security',
  'Management Information System (MIS)',
  'Mobile Computing',
  'Computer Graphics & Multimedia Applications',
  'Internet Programming',
  'Knowledge Management & New Economy',
  'Foundation Course in English',
  'Problem Solving & Programming',
  'Statistical Techniques',
  'TCP / Protocols',
  'Interpolation'
];

export interface UserStats {
  totalTestsTaken: number;
  averageScore: number;
  averageAccuracy: number;
  badges: string[];
}

export interface ActiveQuizSession {
  quiz: Quiz;
  mode: 'exam' | 'practice';
  durationMinutes: number;
  currentIdx: number;
  userAnswers: Record<number, number>;
  visitedQuestions: Record<number, boolean>;
  localBookmarks: Record<number, boolean>;
  secondsLeft: number;
  activeSectionIdx: number;
  submittedSections: Record<number, boolean>;
  lastUpdated: number;
  questionTimeSpent?: Record<number, number>;
}
