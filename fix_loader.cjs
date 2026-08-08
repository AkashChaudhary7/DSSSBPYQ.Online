const fs = require('fs');

let content = fs.readFileSync('src/lib/quizLoader.ts', 'utf8');

// Remove the import
content = content.replace("import { GENERATED_QUIZZES_METADATA } from '../data/generatedQuizzesMetadata';\n", "");

// Find the fallback block
const oldBlock = `  const staticCount = (GENERATED_QUIZZES_METADATA && Array.isArray(GENERATED_QUIZZES_METADATA)) ? GENERATED_QUIZZES_METADATA.length : 0;
  if (!metadataList || !Array.isArray(metadataList) || metadataList.length < staticCount) {
    console.warn(\`[QuizLoader] Fetched/cached metadata has \${metadataList ? (metadataList.length || 0) : 0} items, which is less than static bundle \${staticCount}. Merging with static bundle.\`);
    
    const mergedMap = new Map<string, any>();
    if (GENERATED_QUIZZES_METADATA && Array.isArray(GENERATED_QUIZZES_METADATA)) {
      GENERATED_QUIZZES_METADATA.forEach(q => {
        if (q && q.testId) {
          mergedMap.set(q.testId, q);
        }
      });
    }
    if (metadataList && Array.isArray(metadataList)) {
      metadataList.forEach(q => {
        if (q && q.testId) {
          mergedMap.set(q.testId, q);
        }
      });
    }
    metadataList = Array.from(mergedMap.values());
  }`;

const newBlock = `  // Load static bundle dynamically to avoid blocking initial render with large bundle
  let GENERATED_QUIZZES_METADATA: any[] = [];
  try {
    const staticBundle = await import('../data/generatedQuizzesMetadata');
    if (staticBundle && staticBundle.GENERATED_QUIZZES_METADATA) {
      GENERATED_QUIZZES_METADATA = staticBundle.GENERATED_QUIZZES_METADATA;
    }
  } catch (err) {
    console.warn("[QuizLoader] Failed to dynamically load static metadata bundle", err);
  }

  const staticCount = (GENERATED_QUIZZES_METADATA && Array.isArray(GENERATED_QUIZZES_METADATA)) ? GENERATED_QUIZZES_METADATA.length : 0;
  if (!metadataList || !Array.isArray(metadataList) || metadataList.length < staticCount) {
    console.warn(\`[QuizLoader] Fetched/cached metadata has \${metadataList ? (metadataList.length || 0) : 0} items, which is less than static bundle \${staticCount}. Merging with static bundle.\`);
    
    const mergedMap = new Map<string, any>();
    if (GENERATED_QUIZZES_METADATA && Array.isArray(GENERATED_QUIZZES_METADATA)) {
      GENERATED_QUIZZES_METADATA.forEach(q => {
        if (q && q.testId) {
          mergedMap.set(q.testId, q);
        }
      });
    }
    if (metadataList && Array.isArray(metadataList)) {
      metadataList.forEach(q => {
        if (q && q.testId) {
          mergedMap.set(q.testId, q);
        }
      });
    }
    metadataList = Array.from(mergedMap.values());
  }`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync('src/lib/quizLoader.ts', content, 'utf8');
