import { GENERATED_QUIZZES_METADATA } from '../data/generatedQuizzesMetadata';
import { BUILTIN_QUIZZES } from '../data/contentIndex';
import { formatMetadataToLightweightQuizzes } from './quizLoader';
import { Quiz } from '../types';

let cachedInitialQuizzes: Quiz[] | null = null;

export function getInitialQuizzes(): Quiz[] {
  if (cachedInitialQuizzes && cachedInitialQuizzes.length > 0) {
    return cachedInitialQuizzes;
  }

  const map = new Map<string, Quiz>();

  const formattedGenerated = formatMetadataToLightweightQuizzes(GENERATED_QUIZZES_METADATA || []);
  const formattedBuiltin = formatMetadataToLightweightQuizzes(BUILTIN_QUIZZES || []);

  formattedGenerated.forEach((q) => {
    if (q && q.testId) map.set(q.testId, q);
  });
  
  formattedBuiltin.forEach((q) => {
    if (q && q.testId) map.set(q.testId, q);
  });

  cachedInitialQuizzes = Array.from(map.values());
  return cachedInitialQuizzes;
}
