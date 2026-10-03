/**
 * Source File Trace Resolver
 * Maps Quiz IDs and Question IDs to their exact file location in the repository codebase.
 */

export interface QuestionTrace {
  quizId: string;
  quizTitle: string;
  questionId: string | number;
  filePath: string;
  category: string;
  module: string;
}

export function getQuestionSourceTrace(quizId: string, quizTitle: string, questionId: string | number): QuestionTrace {
  const qIdStr = String(quizId).toLowerCase();

  let filePath = 'src/data/contentIndex.ts';
  let category = 'Static Data Bank';
  let module = 'General Question Bank';

  if (qIdStr.startsWith('mock_') || qIdStr.startsWith('full_mock_')) {
    const num = qIdStr.replace(/[^0-9]/g, '').padStart(2, '0');
    filePath = `src/data/full/mock_${num || '01'}.ts`;
    category = 'Full Mock Paper (200 Marks)';
    module = 'Full Length Exam Simulation';
  } else if (qIdStr.startsWith('pyp_')) {
    const num = qIdStr.replace(/[^0-9]/g, '').padStart(2, '0');
    filePath = `src/data/full/pyp_${num || '05'}.ts`;
    category = 'Previous Year Question Paper (PYP)';
    module = 'Official DSSSB Past Exam';
  } else if (qIdStr.startsWith('tgt_cs_') || qIdStr.includes('computer_science')) {
    filePath = 'src/data/part_b/part_b_quizzes.ts';
    category = 'Part B Computer Science';
    module = 'TGT Computer Science Core Subject';
  } else if (qIdStr.startsWith('tm_') || qIdStr.includes('teaching')) {
    filePath = 'src/data/part_b/teaching_methodology/tm_quizzes.ts';
    category = 'Teaching Methodology & Pedagogy';
    module = 'Pedagogy & Child Development';
  } else if (qIdStr.startsWith('hindi_') || qIdStr.includes('hindi')) {
    filePath = 'src/data/hindi/hindi_quizzes.ts';
    category = 'General Hindi (Part A)';
    module = 'Language Aptitude - Hindi';
  } else if (qIdStr.startsWith('english_') || qIdStr.includes('english')) {
    filePath = 'src/data/english/english_quizzes.ts';
    category = 'General English (Part A)';
    module = 'Language Aptitude - English';
  } else if (qIdStr.startsWith('quants_') || qIdStr.includes('math') || qIdStr.includes('quant')) {
    filePath = 'src/data/quants/quants_quizzes.ts';
    category = 'Quantitative Aptitude (Part A)';
    module = 'Numerical & Mathematical Ability';
  } else if (qIdStr.startsWith('reasoning_') || qIdStr.includes('reasoning')) {
    filePath = 'src/data/reasoning/reasoning_quizzes.ts';
    category = 'General Intelligence & Reasoning (Part A)';
    module = 'Mental Ability & Logical Reasoning';
  } else if (qIdStr.startsWith('ga_') || qIdStr.includes('awareness')) {
    filePath = 'src/data/ga/ga_quizzes.ts';
    category = 'General Awareness (Part A)';
    module = 'GK & Current Affairs';
  } else if (qIdStr.startsWith('custom_') || qIdStr.startsWith('user_')) {
    filePath = 'Browser LocalStorage / User Custom Generated';
    category = 'Custom Quiz Engine';
    module = 'User Generated Test';
  }

  return {
    quizId,
    quizTitle: quizTitle || `Quiz ${quizId}`,
    questionId,
    filePath,
    category,
    module
  };
}
