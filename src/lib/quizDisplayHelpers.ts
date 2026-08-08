import { Quiz } from '../types';

/**
 * Helper to get the exact mock test number label (e.g. "Mock #17", "Mock #1")
 */
export function getMockNumberLabel(quiz: Quiz, index?: number): string {
  if (!quiz) return 'Mock Test';
  const title = quiz.title || '';
  const file = (quiz as any).file || '';

  // Look for numbers after keywords like Mock, Test, Paper, CBT or standalone numbers
  const titleMatch = title.match(/(?:mock\s*test|mock|test|paper|cbt|part)\s*#?\s*(\d+)/i) || title.match(/(\d+)/);
  if (titleMatch && titleMatch[1]) {
    return `Mock #${titleMatch[1]}`;
  }

  const fileMatch = file.match(/(\d+)/);
  if (fileMatch && fileMatch[1]) {
    return `Mock #${fileMatch[1]}`;
  }

  if (index !== undefined) {
    return `Mock #${index + 1}`;
  }

  return 'Mock Test';
}

/**
 * Helper to safely get the question count regardless of lazy loading
 */
export function getQuestionCount(quiz: Quiz): number {
  if (!quiz) return 20;
  if (quiz.questions && quiz.questions.length > 0) {
    return quiz.questions.length;
  }
  if (quiz.qCount && quiz.qCount > 0) {
    return quiz.qCount;
  }
  if (quiz.category === 'full' || quiz.testType === 'full') return 200;
  if (quiz.category === 'full_part_a' || quiz.testType === 'part_a_full' || quiz.isPartAFullMock) return 100;
  return 20;
}

/**
 * Helper to format the primary topic badge
 */
export function getTopicBadge(quiz: Quiz): string {
  if (!quiz) return 'General Practice';
  if (quiz.topic && quiz.topic !== 'General' && quiz.topic !== 'Computer Science' && quiz.topic !== 'General Practice') {
    return quiz.topic;
  }
  if (quiz.subject && quiz.subject !== 'Computer Science') {
    return quiz.subject;
  }
  return quiz.category === 'part_b' ? 'Computer Science' : 'General Ability';
}

/**
 * Helper to format subject/category label
 */
export type DifficultyInfo = {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: string;
};

/**
 * Returns level difficulty tag based on quiz index in list:
 * First 10 (0..9) => Basic
 * Next 10 (10..19) => Moderate
 * Index 20+ => Expert
 */
export function getDifficultyTag(index: number): DifficultyInfo {
  if (index < 10) {
    return {
      label: 'Basic Level',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: '🟢'
    };
  } else if (index < 20) {
    return {
      label: 'Moderate Level',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: '🟡'
    };
  } else {
    return {
      label: 'Expert Level',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
      icon: '🔴'
    };
  }
}

export function getSubjectBadge(quiz: Quiz): string {
  if (!quiz) return 'General';
  if (quiz.category === 'part_b') {
    return `Part B • ${quiz.subject || 'CS & Pedagogy'}`;
  }
  if (quiz.category === 'part_a') {
    return `Part A • ${quiz.subject || 'General Ability'}`;
  }
  if (quiz.category === 'full') {
    return '200 Marks Full CBT';
  }
  return quiz.subject || 'General';
}

/**
 * Helper to filter and count quizzes matching a specific topic/subject
 */
export function countMocksByTopic(quizzes: Quiz[], topicName: string): number {
  if (!quizzes || quizzes.length === 0) return 0;
  if (topicName === 'All Topics' || topicName === 'All Subjects') return quizzes.length;

  const topicLower = topicName.toLowerCase();

  return quizzes.filter(q => {
    const qTopic = (q.topic || '').toLowerCase();
    const qSub = (q.subject || '').toLowerCase();
    const qTitle = (q.title || '').toLowerCase();
    const qFile = ((q as any).file || '').toLowerCase();

    if (qTopic.includes(topicLower) || qSub.includes(topicLower) || qTitle.includes(topicLower) || qFile.includes(topicLower)) {
      return true;
    }

    // Computer Networks alias
    if ((topicLower.includes('network') || topicLower === 'cn') && 
        (qTopic.includes('network') || qFile.includes('network') || qTitle.includes('network') || qTopic.includes('cn') || qFile.includes('/cn/'))) {
      return true;
    }

    // Operating System alias
    if ((topicLower.includes('operating') || topicLower === 'os') && 
        (qTopic.includes('operating') || qTopic.includes('os') || qFile.includes('operating') || qTitle.includes('operating') || qTitle.includes('os mock'))) {
      return true;
    }

    // DBMS alias
    if ((topicLower.includes('dbms') || topicLower.includes('database')) && 
        (qTopic.includes('dbms') || qTopic.includes('database') || qTitle.includes('dbms') || qFile.includes('dbms'))) {
      return true;
    }

    // Teaching Methodology alias
    if ((topicLower.includes('teaching') || topicLower.includes('pedagogy')) && 
        (qTopic.includes('teaching') || qTopic.includes('pedagogy') || qSub.includes('methodology') || qFile.includes('teaching'))) {
      return true;
    }

    // Reasoning alias
    if (topicLower.includes('reasoning') && 
        (qSub.includes('reasoning') || qTopic.includes('reasoning') || qTitle.includes('reasoning'))) {
      return true;
    }

    // Quants / Maths alias
    if ((topicLower.includes('arithmetic') || topicLower.includes('quant') || topicLower.includes('math')) && 
        (qSub.includes('arithmetic') || qSub.includes('quant') || qTopic.includes('math') || qTitle.includes('math'))) {
      return true;
    }

    return false;
  }).length;
}
