import { Attempt, Question, Bookmark } from '../types';
import { UserProfile } from './userProfile';

export interface SubjectDiagnostic {
  subjectName: string;
  category: 'Part A' | 'Part B' | 'Pedagogy';
  totalQuestionsAttempted: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  accuracy: number; // 0-100%
  netScore: number;
  negativePenalty: number;
  status: 'strong' | 'moderate' | 'weak';
  statusLabel: string;
  recommendedAction: string;
  highYieldTopics: string[];
}

export interface ComprehensiveReportData {
  candidateName: string;
  profileId: string;
  targetExam: string;
  generatedDate: string;
  totalMocksTaken: number;
  totalQuestionsSolved: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnattempted: number;
  overallAccuracy: number;
  totalNegativeMarks: number;
  totalNetScore: number;
  projectedCbtScore: number; // Out of 200
  scoreConfidenceRange: string;
  readinessPercentage: number;
  partAScoreEst: number; // Out of 100
  partBScoreEst: number; // Out of 100
  strongSubjects: SubjectDiagnostic[];
  moderateSubjects: SubjectDiagnostic[];
  weakSubjects: SubjectDiagnostic[];
  allSubjects: SubjectDiagnostic[];
  personalizedPlan: {
    phase1: { title: string; days: string; focus: string; tasks: string[] };
    phase2: { title: string; days: string; focus: string; tasks: string[] };
    phase3: { title: string; days: string; focus: string; tasks: string[] };
    dailySchedule: Array<{ time: string; slot: string; activity: string; subject: string }>;
  };
  highYieldCsChecklist: Array<{ module: string; weightage: string; keyFocus: string }>;
  partAFormulaHacks: Array<{ section: string; weightage: string; hack: string }>;
}

export function generateComprehensiveReport(
  profile: UserProfile,
  attempts: Attempt[],
  _bookmarks: Bookmark[] = [],
  missedQuestions: Question[] = []
): ComprehensiveReportData {
  const candidateName = profile.username && profile.username.trim() ? profile.username.trim() : 'Candidate';
  const profileId = profile.profileId || 'USR-2026-DSSSB';
  const targetExam = profile.targetExam || 'DSSSB TGT Computer Science (Post Code 41/26)';
  const generatedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const totalMocksTaken = attempts.length;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnattempted = 0;
  let totalQuestionsSolved = 0;

  attempts.forEach((att) => {
    totalCorrect += att.correctCount || 0;
    totalIncorrect += att.incorrectCount || 0;
    totalUnattempted += att.unattemptedCount || 0;
    totalQuestionsSolved += (att.correctCount || 0) + (att.incorrectCount || 0);
  });

  const totalNegativeMarks = parseFloat((totalIncorrect * 0.25).toFixed(2));
  const totalNetScore = parseFloat((totalCorrect * 1.0 - totalNegativeMarks).toFixed(2));
  const overallAccuracy = totalQuestionsSolved > 0 ? Math.round((totalCorrect / totalQuestionsSolved) * 100) : (totalMocksTaken > 0 ? 65 : 0);

  // Group attempts by subject keywords
  const subjectAttemptBuckets: Record<string, { category: 'Part A' | 'Part B' | 'Pedagogy'; correct: number; incorrect: number; total: number }> = {
    'Operating Systems': { category: 'Part B', correct: 0, incorrect: 0, total: 0 },
    'DBMS & SQL': { category: 'Part B', correct: 0, incorrect: 0, total: 0 },
    'Computer Networks': { category: 'Part B', correct: 0, incorrect: 0, total: 0 },
    'Data Structures & Algorithms': { category: 'Part B', correct: 0, incorrect: 0, total: 0 },
    'Digital Electronics & COA': { category: 'Part B', correct: 0, incorrect: 0, total: 0 },
    'Programming (C++ / Python / OOP)': { category: 'Part B', correct: 0, incorrect: 0, total: 0 },
    'Web Technologies (HTML / CSS / JS)': { category: 'Part B', correct: 0, incorrect: 0, total: 0 },
    'Teaching Methodology & Pedagogy': { category: 'Pedagogy', correct: 0, incorrect: 0, total: 0 },
    'General Intelligence & Reasoning': { category: 'Part A', correct: 0, incorrect: 0, total: 0 },
    'Quantitative Aptitude (Maths)': { category: 'Part A', correct: 0, incorrect: 0, total: 0 },
    'General Awareness & Current Affairs': { category: 'Part A', correct: 0, incorrect: 0, total: 0 },
    'General English & Comprehension': { category: 'Part A', correct: 0, incorrect: 0, total: 0 },
    'General Hindi & Vyakaran': { category: 'Part A', correct: 0, incorrect: 0, total: 0 },
  };

  // Map attempts to subject buckets
  attempts.forEach((att) => {
    const title = (att.testTitle || '').toLowerCase();
    let matchedKey: string | null = null;

    if (title.includes('operating') || title.includes('os_') || title.includes('process')) matchedKey = 'Operating Systems';
    else if (title.includes('dbms') || title.includes('sql') || title.includes('database')) matchedKey = 'DBMS & SQL';
    else if (title.includes('network') || title.includes('cn_') || title.includes('tcp')) matchedKey = 'Computer Networks';
    else if (title.includes('dsa') || title.includes('data structure') || title.includes('algorithm') || title.includes('tree')) matchedKey = 'Data Structures & Algorithms';
    else if (title.includes('digital') || title.includes('coa') || title.includes('architecture') || title.includes('logic')) matchedKey = 'Digital Electronics & COA';
    else if (title.includes('programming') || title.includes('python') || title.includes('c++') || title.includes('oop')) matchedKey = 'Programming (C++ / Python / OOP)';
    else if (title.includes('web') || title.includes('html') || title.includes('javascript') || title.includes('css')) matchedKey = 'Web Technologies (HTML / CSS / JS)';
    else if (title.includes('pedagogy') || title.includes('teaching') || title.includes('methodology') || title.includes('education')) matchedKey = 'Teaching Methodology & Pedagogy';
    else if (title.includes('reasoning') || title.includes('intelligence') || title.includes('analogy')) matchedKey = 'General Intelligence & Reasoning';
    else if (title.includes('quant') || title.includes('math') || title.includes('arithmetic') || title.includes('numerical')) matchedKey = 'Quantitative Aptitude (Maths)';
    else if (title.includes('awareness') || title.includes('gk') || title.includes('current') || title.includes('general_awareness')) matchedKey = 'General Awareness & Current Affairs';
    else if (title.includes('english') || title.includes('comprehension')) matchedKey = 'General English & Comprehension';
    else if (title.includes('hindi') || title.includes('vyakaran')) matchedKey = 'General Hindi & Vyakaran';
    else if (title.includes('part a') || title.includes('part_a')) {
      // Split evenly among Part A subjects if it's a full part A mock
      const partAKeys = ['General Intelligence & Reasoning', 'Quantitative Aptitude (Maths)', 'General Awareness & Current Affairs', 'General English & Comprehension', 'General Hindi & Vyakaran'];
      const portion = Math.max(1, Math.floor((att.correctCount + att.incorrectCount) / partAKeys.length));
      const portionCorrect = Math.max(0, Math.floor(att.correctCount / partAKeys.length));
      const portionIncorrect = Math.max(0, Math.floor(att.incorrectCount / partAKeys.length));
      partAKeys.forEach(k => {
        subjectAttemptBuckets[k].total += portion;
        subjectAttemptBuckets[k].correct += portionCorrect;
        subjectAttemptBuckets[k].incorrect += portionIncorrect;
      });
      return;
    }

    if (matchedKey && subjectAttemptBuckets[matchedKey]) {
      subjectAttemptBuckets[matchedKey].total += (att.correctCount + att.incorrectCount);
      subjectAttemptBuckets[matchedKey].correct += att.correctCount;
      subjectAttemptBuckets[matchedKey].incorrect += att.incorrectCount;
    }
  });

  // Fallback defaults if few attempts taken so candidate still gets actionable diagnostic
  const highYieldTopicMap: Record<string, string[]> = {
    'Operating Systems': ['Process Scheduling & PCB', 'Paging & Virtual Memory', 'Deadlock Banker\'s Algorithm', 'Synchronization Semaphores'],
    'DBMS & SQL': ['Normalization (1NF to BCNF)', 'SQL Joins & Nested Queries', 'ACID Transactions & Serializability', 'ER Modeling & Relational Algebra'],
    'Computer Networks': ['OSI & TCP/IP Model Layers', 'Subnetting & CIDR Addressing', 'Routing Protocols (OSPF, BGP)', 'Flow Control (Sliding Window, Go-Back-N)'],
    'Data Structures & Algorithms': ['Binary Search Trees & AVL Rotations', 'Time & Space Complexity Asymptotics', 'Stack & Queue Applications', 'Graph BFS & DFS Traversals'],
    'Digital Electronics & COA': ['K-Maps & Logic Minimization', 'Instruction Pipelining & Hazards', 'Cache Memory Mapping (Direct, Associative)', 'Addressing Modes'],
    'Programming (C++ / Python / OOP)': ['Polymorphism, Inheritance & Virtual Functions', 'Pointers & Dynamic Memory Allocation', 'Python List/Dict Comprehensions', 'Scope, Recursion & Call Stacks'],
    'Web Technologies (HTML / CSS / JS)': ['CSS Flexbox & Box Model', 'JS Closures & Event Loop', 'HTTP Methods & Status Codes', 'DOM Manipulation & LocalStorage'],
    'Teaching Methodology & Pedagogy': ['NEP 2020 & NCF Curricular Goals', 'Constructivist & Active Learning', 'Bloom\'s Taxonomy in CS Instruction', 'Formative Assessment & Diagnostic Rubrics'],
    'General Intelligence & Reasoning': ['Syllogisms & Logical Venn Diagrams', 'Blood Relations & Direction Sense', 'Number & Alphabet Series Matrix', 'Coding-Decoding & Non-Verbal Figures'],
    'Quantitative Aptitude (Maths)': ['Percentages, Profit & Loss Formulas', 'Time, Speed & Distance / Trains', 'Simple & Compound Interest Shortcuts', 'Ratio, Proportion & Work Equations'],
    'General Awareness & Current Affairs': ['Indian Constitution Key Articles & Amendments', 'Delhi History, Schemes & Governance', 'Science, Tech & National Awards', 'Last 6 Months Current Affairs Highlights'],
    'General English & Comprehension': ['Subject-Verb Agreement Rules', 'Error Spotting & Sentence Improvement', 'Active-Passive & Direct-Indirect Speech', 'Reading Comprehension Speed Drills'],
    'General Hindi & Vyakaran': ['संधि और समास के भेद व उदाहरण', 'पर्यायवाची व विलोम शब्द', 'अनेक शब्दों के लिए एक शब्द', 'शुद्ध वर्तनी व वाक्य शुद्धि'],
  };

  const allSubjects: SubjectDiagnostic[] = Object.entries(subjectAttemptBuckets).map(([subjName, stats]) => {
    let accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    
    // If user hasn't attempted specific subject mocks yet, compute baseline based on overall accuracy
    if (stats.total === 0) {
      if (overallAccuracy > 0) {
        // distribute around overall accuracy
        accuracy = Math.max(30, Math.min(85, overallAccuracy + (subjName.includes('Reasoning') || subjName.includes('Networks') ? 5 : -10)));
      } else {
        accuracy = 50; // unattempted neutral baseline
      }
    }

    const netScore = parseFloat((stats.correct * 1.0 - stats.incorrect * 0.25).toFixed(2));
    const negativePenalty = parseFloat((stats.incorrect * 0.25).toFixed(2));

    let status: 'strong' | 'moderate' | 'weak';
    let statusLabel: string;
    let recommendedAction: string;

    if (accuracy >= 70) {
      status = 'strong';
      statusLabel = 'Mastered (High Strength)';
      recommendedAction = 'Maintain speed with 15-min speed quizzes. Ensure 100% accuracy to maximize scoring delta.';
    } else if (accuracy >= 48) {
      status = 'moderate';
      statusLabel = 'Moderate / Buffer Zone';
      recommendedAction = 'Revise high-yield concept summaries and avoid guessing on ambiguous questions to stop -0.25 leaks.';
    } else {
      status = 'weak';
      statusLabel = 'Critical Weak Zone';
      recommendedAction = 'Top priority for Day 1-10 repair. Review foundational formulas, solve 30 untimed PYQs, and log mistakes.';
    }

    return {
      subjectName: subjName,
      category: stats.category,
      totalQuestionsAttempted: stats.total,
      correctCount: stats.correct,
      incorrectCount: stats.incorrect,
      unattemptedCount: 0,
      accuracy,
      netScore,
      negativePenalty,
      status,
      statusLabel,
      recommendedAction,
      highYieldTopics: highYieldTopicMap[subjName] || ['High-Yield PYQ Analysis', 'Core Formula Drills']
    };
  });

  const strongSubjects = allSubjects.filter(s => s.status === 'strong');
  const moderateSubjects = allSubjects.filter(s => s.status === 'moderate');
  const weakSubjects = allSubjects.filter(s => s.status === 'weak');

  // Score Predictor Calculation out of 200 (100 Part A + 100 Part B)
  const partASubjects = allSubjects.filter(s => s.category === 'Part A');
  const partBSubjects = allSubjects.filter(s => s.category === 'Part B' || s.category === 'Pedagogy');

  const avgPartAAcc = partASubjects.reduce((a, b) => a + b.accuracy, 0) / (partASubjects.length || 1);
  const avgPartBAcc = partBSubjects.reduce((a, b) => a + b.accuracy, 0) / (partBSubjects.length || 1);

  // Projected Scores with realistic negative marking damping
  const rawPartAEst = Math.round((avgPartAAcc / 100) * 85); // assumes attempting ~85/100
  const rawPartBEst = Math.round((avgPartBAcc / 100) * 85); // assumes attempting ~85/100

  const partAScoreEst = Math.max(20, Math.min(95, rawPartAEst));
  const partBScoreEst = Math.max(20, Math.min(95, rawPartBEst));
  const projectedCbtScore = partAScoreEst + partBScoreEst;

  const scoreConfidenceRange = `${Math.max(40, projectedCbtScore - 8)} - ${Math.min(195, projectedCbtScore + 10)}`;
  const readinessPercentage = Math.min(100, Math.round((projectedCbtScore / 200) * 100));

  // Formulate Personalized 30-Day Master Study Plan
  const weakSubjectNames = weakSubjects.slice(0, 3).map(w => w.subjectName);
  const weakFocusStr = weakSubjectNames.length > 0 ? weakSubjectNames.join(', ') : 'High-Negative Marking PYQs & Arithmetic Shortcuts';

  const moderateSubjectNames = moderateSubjects.slice(0, 3).map(m => m.subjectName);
  const modFocusStr = moderateSubjectNames.length > 0 ? moderateSubjectNames.join(', ') : 'Operating Systems & General English';

  const personalizedPlan = {
    phase1: {
      title: 'Phase 1: Foundation Repair & Weak Topic Cleansing',
      days: 'Days 1 to 10',
      focus: `Targeting identified weak zones: ${weakFocusStr}`,
      tasks: [
        `Dedicate 2.5 hours daily to core conceptual repair in ${weakFocusStr}.`,
        'Stop taking full-length timed tests until baseline accuracy in weak subjects crosses 60%.',
        'Solve 30 topic-specific PYQ sets daily with detailed step-by-step solution reviews.',
        `Review all ${missedQuestions.length} questions in Mistake Vault twice before moving to Phase 2.`
      ]
    },
    phase2: {
      title: 'Phase 2: Speed Optimization & Negative Marking Shield',
      days: 'Days 11 to 20',
      focus: `Transitioning moderate zones (${modFocusStr}) into high-scoring strongholds`,
      tasks: [
        'Practice 20-minute timed sprint tests for Quantitative Aptitude and Logical Reasoning.',
        'Implement strict "Skip Rule": If not 80% confident within 35 seconds, mark for review and skip to protect negative marks (-0.25 penalty).',
        'Daily 45-minute revision of 32 Computer Science cheat sheets and SQL queries.',
        'Solve 2 Part A sectional mocks (100 Qs) every alternate day.'
      ]
    },
    phase3: {
      title: 'Phase 3: 200-Question CBT Simulation & Peak Performance',
      days: 'Days 21 to 30',
      focus: 'Full 120-minute exam simulation, mental stamina, and cut-off cross target',
      tasks: [
        'Attempt 1 Full 200-Question DSSSB CBT Mock every 2 days strictly between 09:00 AM - 11:00 AM (actual exam time).',
        'Analyze Sectional Time Allocation: 45 Mins for Part A (5 sections) and 75 Mins for Part B (CS + Pedagogy).',
        'Complete final sweep of General Hindi grammar rules, NEP 2020 pedagogy points, and networking protocols.',
        'Final check on BytePrep Score Predictor aiming for 135+ marks out of 200.'
      ]
    },
    dailySchedule: [
      { time: '06:30 AM - 08:30 AM', slot: 'Morning Booster', activity: 'Quantitative Aptitude & Reasoning Speed Drills (Part A)', subject: 'Maths / Reasoning' },
      { time: '09:30 AM - 12:30 PM', slot: 'Core Technical Session', activity: 'Computer Science Deep Dive (OS, DBMS, Networks, DSA)', subject: 'Part B Core CS' },
      { time: '02:30 PM - 04:00 PM', slot: 'Language & Pedagogy', activity: 'General English & Hindi Vyakaran + NEP 2020 Teaching Methodology', subject: 'Part A & Pedagogy' },
      { time: '05:00 PM - 06:30 PM', slot: 'Mock & PYQ Practice', activity: 'Attempt 1 Sectional or Full Mock Test on BytePrep platform', subject: 'Practice Test' },
      { time: '08:30 PM - 09:45 PM', slot: 'Night Error Analysis', activity: 'Review Mistake Vault, Bookmarks & update personal formula notebook', subject: 'Mistake Review' },
    ]
  };

  const highYieldCsChecklist = [
    { module: 'Database Management Systems (DBMS)', weightage: '12-15 Qs', keyFocus: '1NF, 2NF, 3NF, BCNF Normalization, SQL Joins, ACID, Serializability' },
    { module: 'Operating Systems & Concurrency', weightage: '12-14 Qs', keyFocus: 'Round Robin/SJF Scheduling, Banker\'s Algorithm, Paging & TLB hit ratios, Semaphores' },
    { module: 'Computer Networks & Security', weightage: '12-15 Qs', keyFocus: 'TCP/IP vs OSI, CIDR Subnet calculations, RSA/DES Cryptography, Sliding window ARQ' },
    { module: 'Data Structures & Algorithms', weightage: '10-14 Qs', keyFocus: 'BST Inorder/Postorder traversals, Time complexities (Quick/Merge sort), AVL trees' },
    { module: 'Digital Logic & Computer Architecture', weightage: '10-12 Qs', keyFocus: 'K-Map minimization, Multiplexers, Addressing modes, Cache memory mapping' },
    { module: 'Programming & OOP Concepts', weightage: '10-12 Qs', keyFocus: 'C++/Python inheritance, Pointers, Polymorphism, Recursion stack frames' },
    { module: 'Teaching Methodology (Pedagogy)', weightage: '15-20 Qs', keyFocus: 'NEP 2020, NCF-SE, Constructivist CS teaching, Formative assessment rubrics' },
  ];

  const partAFormulaHacks = [
    { section: 'Reasoning Ability (20 Marks)', weightage: 'Target: 18/20', hack: 'Master Syllogism tick-cross method & Venn diagrams to solve 4 questions in under 90 seconds.' },
    { section: 'Quantitative Aptitude (20 Marks)', weightage: 'Target: 16/20', hack: 'Use percentage-to-fraction conversions (1/7=14.28%, 1/8=12.5%) for instant arithmetic shortcuts.' },
    { section: 'General Awareness (20 Marks)', weightage: 'Target: 12/20', hack: 'Focus heavily on Indian Constitution (Fundamental Rights/Articles) and Delhi GK schemes.' },
    { section: 'General English (20 Marks)', weightage: 'Target: 17/20', hack: 'Revise 120 rules of Subject-Verb agreement and preposition exceptions for error spotting.' },
    { section: 'General Hindi (20 Marks)', weightage: 'Target: 18/20', hack: 'Learn संधि विच्छेद rules and समास विग्रह पहचान formulas; this is the highest scoring 10-minute section.' },
  ];

  return {
    candidateName,
    profileId,
    targetExam,
    generatedDate,
    totalMocksTaken,
    totalQuestionsSolved,
    totalCorrect,
    totalIncorrect,
    totalUnattempted,
    overallAccuracy,
    totalNegativeMarks,
    totalNetScore,
    projectedCbtScore,
    scoreConfidenceRange,
    readinessPercentage,
    partAScoreEst,
    partBScoreEst,
    strongSubjects,
    moderateSubjects,
    weakSubjects,
    allSubjects,
    personalizedPlan,
    highYieldCsChecklist,
    partAFormulaHacks
  };
}
