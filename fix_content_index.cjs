const fs = require('fs');

let content = fs.readFileSync('src/data/contentIndex.ts', 'utf8');

// Remove import of GENERATED_QUIZZES_METADATA
content = content.replace("import { GENERATED_QUIZZES_METADATA } from './generatedQuizzesMetadata';\n", "");

// Replace the end part where combinedMap is created
const oldCombined = `// Deduplicate builtin and generated metadata quizzes by testId
const combinedMap = new Map<string, Quiz>();
GENERATED_QUIZZES_METADATA.forEach(q => {
  if (q && q.testId) combinedMap.set(q.testId, q);
});
BUILTIN_QUIZZES.forEach(q => {
  if (q && q.testId) combinedMap.set(q.testId, q);
});

export const ALL_STATIC_QUIZZES: Quiz[] = Array.from(combinedMap.values());
export const mockQuizzes: Quiz[] = ALL_STATIC_QUIZZES;

export function getAllStaticQuizzes(): Quiz[] {
  return ALL_STATIC_QUIZZES;
}

export function getFullMockQuizzes(type: 'mock' | 'pyp' | 'all' = 'all'): Quiz[] {
  if (type === 'mock') return ALL_STATIC_QUIZZES.filter(q => q.category === 'full' && q.testType !== 'pyp');
  if (type === 'pyp') return ALL_STATIC_QUIZZES.filter(q => q.category === 'full' && q.testType === 'pyp');
  return ALL_STATIC_QUIZZES.filter(q => q.category === 'full');
}

export function getQuizzesByPart(category: 'part_a' | 'part_b' | 'full'): Quiz[] {
  return ALL_STATIC_QUIZZES.filter(q => q.category === category);
}

export function getQuizzesBySubject(subjectName: string): Quiz[] {
  if (subjectName === 'All Subjects') return ALL_STATIC_QUIZZES;
  return ALL_STATIC_QUIZZES.filter(q => q.subject === subjectName);
}

export function getQuizzesByTopic(topicName: string): Quiz[] {
  if (topicName === 'All Topics') return ALL_STATIC_QUIZZES;
  return ALL_STATIC_QUIZZES.filter(q => q.topic === topicName || q.subject === topicName);
}
`;

const newCombined = `
export { BUILTIN_QUIZZES };
`;

content = content.replace(oldCombined, newCombined);

fs.writeFileSync('src/data/contentIndex.ts', content, 'utf8');

// Now fix quizLoader.ts to include BUILTIN_QUIZZES
let loaderContent = fs.readFileSync('src/lib/quizLoader.ts', 'utf8');

const oldLoaderBlock = `  // Load static bundle dynamically to avoid blocking initial render with large bundle
  let GENERATED_QUIZZES_METADATA: any[] = [];
  try {
    const staticBundle = await import('../data/generatedQuizzesMetadata');
    if (staticBundle && staticBundle.GENERATED_QUIZZES_METADATA) {
      GENERATED_QUIZZES_METADATA = staticBundle.GENERATED_QUIZZES_METADATA;
    }
  } catch (err) {
    console.warn("[QuizLoader] Failed to dynamically load static metadata bundle", err);
  }`;

const newLoaderBlock = `  // Load static bundle dynamically to avoid blocking initial render with large bundle
  let GENERATED_QUIZZES_METADATA: any[] = [];
  try {
    const staticBundle = await import('../data/generatedQuizzesMetadata');
    if (staticBundle && staticBundle.GENERATED_QUIZZES_METADATA) {
      GENERATED_QUIZZES_METADATA = staticBundle.GENERATED_QUIZZES_METADATA;
    }
  } catch (err) {
    console.warn("[QuizLoader] Failed to dynamically load static metadata bundle", err);
  }
  
  let BUILTIN_QUIZZES: any[] = [];
  try {
    const contentIndex = await import('../data/contentIndex');
    if (contentIndex && contentIndex.BUILTIN_QUIZZES) {
      BUILTIN_QUIZZES = contentIndex.BUILTIN_QUIZZES;
    }
  } catch (err) {}
  
  // Merge builtin and generated
  const combinedMap1 = new Map<string, any>();
  GENERATED_QUIZZES_METADATA.forEach(q => {
    if (q && q.testId) combinedMap1.set(q.testId, q);
  });
  BUILTIN_QUIZZES.forEach(q => {
    if (q && q.testId) combinedMap1.set(q.testId, q);
  });
  GENERATED_QUIZZES_METADATA = Array.from(combinedMap1.values());
`;

loaderContent = loaderContent.replace(oldLoaderBlock, newLoaderBlock);
fs.writeFileSync('src/lib/quizLoader.ts', loaderContent, 'utf8');

