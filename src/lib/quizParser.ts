import { Quiz, Question } from '../types';
import { normalizeStringArtifacts, standardizeQuestionString, cleanOptionText } from './formatText';

export const mapSectionToMetadata = (sectionName: string): { category: 'part_a' | 'part_b' | 'full'; subject: string; topic: string } => {
  const name = sectionName.trim().toLowerCase();

  if (name.includes('arithmetic') || name.includes('numerical') || name.includes('quant') || name.includes('math')) {
    return { category: 'part_a', subject: 'Quantitative Aptitude', topic: 'Arithmetic & Numerical Ability' };
  }
  if (name.includes('reasoning') || name.includes('intelligence')) {
    return { category: 'part_a', subject: 'General Intelligence & Reasoning', topic: 'Reasoning Ability' };
  }
  if (name.includes('awareness') || name.includes('knowledge') || name.includes('current affairs')) {
    return { category: 'part_a', subject: 'General Awareness', topic: 'General Awareness & Current Affairs' };
  }
  if (name.includes('english') || (name.includes('comprehension') && name.includes('english'))) {
    return { category: 'part_a', subject: 'General English', topic: 'English Language & Comprehension' };
  }
  if (name.includes('hindi') || (name.includes('comprehension') && name.includes('hindi'))) {
    return { category: 'part_a', subject: 'General Hindi', topic: 'Hindi Language & Comprehension' };
  }
  if (name.includes('teaching') || name.includes('pedagogy') || name.includes('methodology')) {
    return { category: 'part_b', subject: 'Teaching Methodology', topic: 'Pedagogy & Teaching Methodology' };
  }
  if (name.includes('operating') || name.includes('os')) {
    return { category: 'part_b', subject: 'Computer Science', topic: 'Operating System' };
  }
  if (name.includes('dbms') || name.includes('database')) {
    return { category: 'part_b', subject: 'Computer Science', topic: 'DBMS' };
  }
  if (name.includes('network') || name.includes('security')) {
    return { category: 'part_b', subject: 'Computer Science', topic: 'Computer Networks' };
  }
  if (name.includes('software') && name.includes('engineer')) {
    return { category: 'part_b', subject: 'Computer Science', topic: 'Software Engineering' };
  }

  // Default fallback
  return { category: 'part_b', subject: 'Computer Science', topic: 'General Practice' };
};

export const processRawQuizData = (data: any, relativePath: string, fileName: string): Quiz => {
  const cleanPath = relativePath.toLowerCase();
  
  let questions: Question[] = [];
  if (Array.isArray(data)) {
    questions = data;
  } else if (data.questions && Array.isArray(data.questions)) {
    questions = data.questions;
  } else {
    throw new Error('Questions array missing or invalid format');
  }

  // 1. Scan unique sections from questions inside the JSON file
  const sectionsInQuestions = Array.from(new Set(
    questions.map((q: any) => String(q.section || q.topic || '').trim())
  )).filter(Boolean);

  const mappedSections = sectionsInQuestions.map(sec => mapSectionToMetadata(sec));
  const uniqueSubjects = Array.from(new Set(mappedSections.map(m => m.subject)));

  // 2. Determine Category, Subject, Topic based on scanned questions first!
  let category: 'part_a' | 'part_b' | 'full' = 'part_b';
  let subject = 'Computer Science';
  let topic = 'General Practice';
  let isPartA = false;

  // Pre-determine metadata based on folder path first (since folders are the source of truth requested by the user)
  const decodedPath = decodeURIComponent(relativePath);
  const pathParts = decodedPath.split('/').filter(Boolean);
  let foldersMatched = false;

  if (pathParts.length > 0) {
    const parentFolder = pathParts[0];
    if (parentFolder === 'Computer' && pathParts.length >= 2) {
      category = 'part_b';
      subject = 'Computer Science';
      topic = pathParts[1];
      isPartA = false;
      foldersMatched = true;
    } else if (parentFolder === 'General Awareness') {
      category = 'part_a';
      subject = 'General Awareness';
      topic = 'General Awareness & Current Affairs';
      isPartA = true;
      foldersMatched = true;
    } else if (parentFolder === 'Mathematics') {
      category = 'part_a';
      subject = 'Quantitative Aptitude';
      topic = 'Arithmetic & Numerical Ability';
      isPartA = true;
      foldersMatched = true;
    } else if (parentFolder === 'Reasoning') {
      category = 'part_a';
      subject = 'General Intelligence & Reasoning';
      topic = 'Reasoning Ability';
      isPartA = true;
      foldersMatched = true;
    } else if (parentFolder === 'Teaching') {
      category = 'part_b';
      subject = 'Teaching Methodology';
      topic = 'Pedagogy & Teaching Methodology';
      isPartA = false;
      foldersMatched = true;
    } else if (parentFolder === 'English') {
      category = 'part_a';
      subject = 'General English';
      topic = 'English Language & Comprehension';
      isPartA = true;
      foldersMatched = true;
    } else if (parentFolder === 'Hindi') {
      category = 'part_a';
      subject = 'General Hindi';
      topic = 'Hindi Language & Comprehension';
      isPartA = true;
      foldersMatched = true;
    } else if (parentFolder === 'Full Mocks') {
      category = 'full';
      subject = 'Full Mock';
      topic = 'Full Mock & PYP';
      isPartA = false;
      foldersMatched = true;
    } else if (parentFolder === 'Part A full Mocks') {
      category = 'full';
      subject = 'Part A Full Mock';
      topic = 'Part A Full Mock Series';
      isPartA = true;
      foldersMatched = true;
    }
  }

  if (!foldersMatched) {
    if (uniqueSubjects.length > 1) {
      // Spans multiple subjects -> This is a Full Mock / Part A Full Paper
      const onlyHasPartA = mappedSections.length > 0 && mappedSections.every(m => m.category === 'part_a');
      if (onlyHasPartA) {
        category = 'full';
        subject = 'Part A Full Paper';
        topic = 'Part A Full Paper';
        isPartA = true;
      } else {
        category = 'full';
        subject = 'Full Mock';
        topic = 'Full Mock & PYP';
        isPartA = false;
      }
    } else if (uniqueSubjects.length === 1) {
      // 100% of the questions map to a single subject
      const firstMap = mappedSections[0];
      category = firstMap.category;
      subject = firstMap.subject;
      topic = firstMap.topic;
      isPartA = (category === 'part_a');
    } else {
      // Fallback to path & file-name based detection if no sections are present
      category = 'part_b';
      if (cleanPath.includes('part a') || cleanPath.includes('part_a') || cleanPath.includes('part-a') || cleanPath.includes('arithmetical') || cleanPath.includes('quant') || cleanPath.includes('english') || cleanPath.includes('awareness') || cleanPath.includes('reasoning') || cleanPath.includes('hindi')) {
        category = 'part_a';
      } else if (cleanPath.includes('part b') || cleanPath.includes('part_b') || cleanPath.includes('part-b') || cleanPath.includes('teaching') || cleanPath.includes('pedagogy') || cleanPath.includes('computer')) {
        category = 'part_b';
      } else if (cleanPath.includes('full') || cleanPath.includes('full_mock') || cleanPath.includes('fullmock')) {
        category = 'full';
      } else if (data.category === 'part_a' || data.category === 'part_b' || data.category === 'full') {
        category = data.category;
      }

      subject = data.subject || 'General Knowledge';
      topic = data.topic || 'Practice Module';

      const fullSearchStr = (relativePath + ' ' + fileName).toLowerCase();

      if (fullSearchStr.includes('arithmetical') || fullSearchStr.includes('quant') || fullSearchStr.includes('math') || fullSearchStr.includes('numerical')) {
        subject = 'Quantitative Aptitude';
        topic = 'Arithmetic & Numerical Ability';
        category = 'part_a';
      } else if (fullSearchStr.includes('reason') || fullSearchStr.includes('intelligence')) {
        subject = 'General Intelligence & Reasoning';
        topic = 'Reasoning Ability';
        category = 'part_a';
      } else if (fullSearchStr.includes('awareness') || fullSearchStr.includes('general awareness') || fullSearchStr.includes('ga')) {
        subject = 'General Awareness';
        topic = 'General Awareness & Current Affairs';
        category = 'part_a';
      } else if (fullSearchStr.includes('english')) {
        subject = 'General English';
        topic = 'English Language & Comprehension';
        category = 'part_a';
      } else if (fullSearchStr.includes('hindi')) {
        subject = 'General Hindi';
        topic = 'Hindi Language & Comprehension';
        category = 'part_a';
      } else if (fullSearchStr.includes('teaching') || fullSearchStr.includes('pedagogy') || fullSearchStr.includes('methodology')) {
        subject = 'Teaching Methodology';
        topic = 'Pedagogy & Teaching Methodology';
        category = 'part_b';
      } else if (fullSearchStr.includes('operating') || fullSearchStr.includes('os')) {
        subject = 'Computer Science';
        topic = 'Operating System';
        category = 'part_b';
      } else if (fullSearchStr.includes('dbms') || fullSearchStr.includes('database')) {
        subject = 'Computer Science';
        topic = 'DBMS';
        category = 'part_b';
      }

      isPartA = (category === 'part_a' || cleanPath.includes('part_a') || cleanPath.includes('part-a'));
    }
  }

  // Allow explicit override if provided at data root
  if (data.category === 'part_a' || data.category === 'part_b' || data.category === 'full') {
    category = data.category;
  }
  if (data.subject) {
    subject = data.subject;
  }
  if (data.topic) {
    topic = data.topic;
  }
  if (typeof data.isPartA === 'boolean') {
    isPartA = data.isPartA;
  }

  const normalizedQuestions: Question[] = questions.map((q: any, idx: number) => {
    const qId = typeof q.id === 'number' ? q.id : (idx + 1);
    const rawQuestionText = q.question || q.text || q.q_text || '';
    const questionText = standardizeQuestionString(String(rawQuestionText));
    const rawOptions = q.options || q.choices || q.answers || [];
    const formattedOptions = rawOptions.map((o: any) => cleanOptionText(o));
    
    // Resolve raw answer from any property (answer, correct_answer, correctAnswer, ans, correct)
    let rawAns = q.answer;
    if (rawAns === undefined || rawAns === null) rawAns = q.correct_answer;
    if (rawAns === undefined || rawAns === null) rawAns = q.correctAnswer;
    if (rawAns === undefined || rawAns === null) rawAns = q.ans;
    if (rawAns === undefined || rawAns === null) rawAns = q.correct;

    let answerIdx = 0;
    if (typeof rawAns === 'number') {
      answerIdx = rawAns;
    } else if (typeof rawAns === 'string') {
      const trimmed = normalizeStringArtifacts(rawAns).trim();
      const upper = trimmed.toUpperCase();
      if (upper === 'A' || upper === '1' || upper.startsWith('A)') || upper.startsWith('OPTION A')) answerIdx = 0;
      else if (upper === 'B' || upper === '2' || upper.startsWith('B)') || upper.startsWith('OPTION B')) answerIdx = 1;
      else if (upper === 'C' || upper === '3' || upper.startsWith('C)') || upper.startsWith('OPTION C')) answerIdx = 2;
      else if (upper === 'D' || upper === '4' || upper.startsWith('D)') || upper.startsWith('OPTION D')) answerIdx = 3;
      else {
        const parsed = parseInt(trimmed, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < formattedOptions.length) {
          answerIdx = parsed;
        } else {
          // Try matching option text directly
          const matchIdx = formattedOptions.findIndex(opt => opt.toLowerCase() === trimmed.toLowerCase());
          if (matchIdx !== -1) {
            answerIdx = matchIdx;
          } else {
            answerIdx = 0;
          }
        }
      }
    }

    if (answerIdx < 0 || answerIdx >= formattedOptions.length) {
      answerIdx = 0;
    }

    const rawSection = q.section ? normalizeStringArtifacts(String(q.section)) : '';
    const sectionName = rawSection || (category === 'part_a' ? `Part A - ${subject}` : `Part B - ${topic}`);
    const rawExp = q.explanation || q.desc || q.explanation_text || 'No detailed explanation provided.';
    const explanationText = standardizeQuestionString(String(rawExp));

    return {
      id: qId,
      section: sectionName,
      question: questionText,
      options: formattedOptions,
      answer: answerIdx,
      explanation: explanationText
    };
  });

  const baseName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const formattedFileNameTitle = baseName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  let title = data.test_title || data.title || formattedFileNameTitle || `${subject} Mock Test`;

  if (topic === 'Operating System' || topic === 'Operating Systems' || relativePath.toLowerCase().includes('operating') || fileName.toLowerCase().includes('os mock') || fileName.toLowerCase().includes('question_part') || fileName.toLowerCase().includes('questions_part')) {
    const numMatch = (fileName + ' ' + title).match(/(\d+)/);
    if (numMatch) {
      title = `OS Mock ${numMatch[1]}`;
    } else if (!title.startsWith('OS Mock')) {
      title = `OS Mock 1`;
    }
    topic = 'Operating System';
  }

  const testId = data.testId || `custom_${category}_${baseName.toLowerCase().replace(/\s+/g, '_')}_${questions.length}`;

  const totalTimeMinutes = typeof data.totalTimeMinutes === 'number' 
    ? data.totalTimeMinutes 
    : Math.max(10, Math.ceil(normalizedQuestions.length * 1.2));

  const markingScheme = data.markingScheme && typeof data.markingScheme.correct === 'number' && typeof data.markingScheme.negative === 'number'
    ? data.markingScheme
    : { correct: 1, negative: 0.25 };

  return {
    testId,
    title,
    totalTimeMinutes,
    markingScheme,
    questions: normalizedQuestions,
    category,
    subject,
    topic,
    isPartA
  };
};
