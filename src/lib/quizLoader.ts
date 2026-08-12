import { Quiz, Question } from '../types';
import { processRawQuizData } from './quizParser';
import { Capacitor } from '@capacitor/core';

export const QUIZ_CACHE_NAME = 'dsssb-quiz-cache-v3';
export const REMOTE_CONTENT_BASE = (import.meta.env.VITE_REMOTE_CONTENT_URL as string) || 'https://dsssbpyq.online';
export const QUIZZES_METADATA_URL = '/content/quizzes-metadata.json';
export const REMOTE_METADATA_URL = `${REMOTE_CONTENT_BASE}/content/quizzes-metadata.json`;
export const METADATA_OVERRIDE_KEY = 'dsssb_quizzes_metadata_override';
export const LOCAL_REMOTE_METADATA_CACHE = 'dsssb_remote_quizzes_metadata_v5';
export const MOCK_DATA_PREFIX = 'dsssb_mock_data_';

/**
 * Dynamically resolves file paths based on naming patterns for automated discovery.
 */
export function resolveQuizPath(testId: string, customFile?: string): string[] {
  const paths: string[] = [];
  if (customFile) {
    paths.push(customFile.startsWith('/') ? customFile : `/${customFile}`);
  }
  
  const cleanId = testId.toLowerCase();
  
  // 1. Computer Networks matching
  if (cleanId.includes('computer_networks') || cleanId.includes('computer_network') || cleanId.includes('cn_mock')) {
    const numMatch = cleanId.match(/(\d+)/);
    const num = numMatch ? numMatch[1] : '1';
    paths.push(`/Computer/Computer Networks/Computer Networks Mock Test ${num}.json`);
    paths.push(`/Computer/Computer Networks/computer_networks_mock_test_${num}.json`);
  }
  
  // 2. Operating Systems matching
  if (cleanId.includes('operating_system') || cleanId.includes('operating_systems') || cleanId.includes('os_mock') || cleanId.includes('os ')) {
    const numMatch = cleanId.match(/(\d+)/);
    const num = numMatch ? numMatch[1] : '1';
    paths.push(`/Computer/Operating Systems/OS Mock ${num}.json`);
    paths.push(`/Computer/Operating Systems/os_mock_${num}.json`);
  }
  
  // 3. DBMS matching
  if (cleanId.includes('dbms') || cleanId.includes('database')) {
    const numMatch = cleanId.match(/(\d+)/);
    const num = numMatch ? numMatch[1] : '1';
    paths.push(`/Computer/Database Management System (DBMS)/DBMS Mock ${num}.json`);
    paths.push(`/Computer/Database Management System (DBMS)/dbms_mock_${num}.json`);
  }

  // 4. Programming / DS matching
  if (cleanId.includes('programming') || cleanId.includes('data_structures') || cleanId.includes('data_structure') || cleanId.includes('c++') || cleanId.includes('ds_')) {
    const numMatch = cleanId.match(/(\d+)/);
    const num = numMatch ? numMatch[1] : '1';
    paths.push(`/Computer/Programming in C, C++ & Data Structures/Programming Mock ${num}.json`);
  }

  // 5. Software Engineering matching
  if (cleanId.includes('software_engineering') || cleanId.includes('se_mock') || cleanId.includes('software_engineer')) {
    const numMatch = cleanId.match(/(\d+)/);
    const num = numMatch ? numMatch[1] : '1';
    paths.push(`/Computer/Software Engineering/Software Engineering Mock ${num}.json`);
  }

  // 6. General Awareness matching
  if (cleanId.includes('general_awareness') || cleanId.includes('ga_mock')) {
    const numMatch = cleanId.match(/(\d+)/);
    const num = numMatch ? numMatch[1] : '1';
    paths.push(`/General Awareness/General Awareness Mock ${num}.json`);
  }

  // 7. Quantitative Aptitude / Mathematics
  if (cleanId.includes('math') || cleanId.includes('quant')) {
    const numMatch = cleanId.match(/(\d+)/);
    const num = numMatch ? numMatch[1] : '1';
    paths.push(`/Mathematics/Arithmetic & Numerical Ability Mock ${num}.json`);
  }

  // 8. Reasoning
  if (cleanId.includes('reasoning')) {
    const numMatch = cleanId.match(/(\d+)/);
    const num = numMatch ? numMatch[1] : '1';
    paths.push(`/Reasoning/Reasoning Mock ${num}.json`);
  }

  // Default path fallback
  paths.push(`/content/mocks/${testId}.json`);
  
  // Deduplicate and return
  return Array.from(new Set(paths));
}

/**
 * Dynamically imports/fetches only the data for the active mock quiz on-demand.
 * Checks localStorage (for cached/remote downloads), Cache API, Remote Server, and local assets.
 */
export async function loadActiveQuizQuestions(quiz: Quiz): Promise<Quiz> {
  // If questions are already loaded in memory for this active quiz, return it directly
  if (quiz.questions && quiz.questions.length > 0) {
    return quiz;
  }

  const testId = quiz.testId;
  const rawFilePath = (quiz as any).file || `/content/mocks/${testId}.json`;

  let rawData: any = null;

  // 1. Check localStorage for admin bulk-uploaded or downloaded/cached test question data
  try {
    const localStoredData = localStorage.getItem(`${MOCK_DATA_PREFIX}${testId}`);
    if (localStoredData) {
      rawData = JSON.parse(localStoredData);
    }
  } catch (err) {
    console.warn(`[QuizLoader] LocalStorage lookup failed for ${testId}:`, err);
  }

  // Candidate relative paths to try
  const resolvedPaths = resolveQuizPath(testId, (quiz as any).file);
  const candidatePaths: string[] = [];
  
  for (const path of resolvedPaths) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    try {
      const encodedPath = encodeURI(decodeURI(normalizedPath));
      if (!candidatePaths.includes(encodedPath)) {
        candidatePaths.push(encodedPath);
      }
    } catch (_) {
      if (!candidatePaths.includes(normalizedPath)) {
        candidatePaths.push(normalizedPath);
      }
    }
    if (!candidatePaths.includes(normalizedPath)) {
      candidatePaths.push(normalizedPath);
    }
  }

  // 2. Try Cache API lookup for instant offline access
  let cache: Cache | null = null;
  if (!rawData && typeof window !== 'undefined' && 'caches' in window) {
    try {
      cache = await caches.open(QUIZ_CACHE_NAME);
      for (const p of candidatePaths) {
        const cachedResponse = await cache.match(p);
        if (cachedResponse && cachedResponse.ok) {
          rawData = await cachedResponse.json();
          if (rawData) break;
        }
      }
    } catch (cacheErr) {
      console.warn(`[QuizLoader] Cache API lookup failed:`, cacheErr);
    }
  }

  // 3. Dynamic Network fetch: try Remote Production Server first, then local relative assets
  if (!rawData) {
    const cacheBuster = `?t=${Date.now()}`;
    
    // Construct prioritized URL attempts (Remote server first, then local relative path)
    const urlAttempts: string[] = [];
    for (const p of candidatePaths) {
      // Remote absolute URL (e.g. https://dsssbpyq.online/Computer/...)
      urlAttempts.push(`${REMOTE_CONTENT_BASE}${p}${p.includes('?') ? '&' : '?'}${cacheBuster}`);
      // Local relative path (e.g. /Computer/...)
      urlAttempts.push(`${p}${p.includes('?') ? '&' : '?'}${cacheBuster}`);
    }

    for (const fetchUrl of urlAttempts) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(fetchUrl, { signal: controller.signal }).catch(() => null);
        clearTimeout(timeoutId);

        if (response && response.ok) {
          rawData = await response.json().catch(() => null);

          if (rawData && (Array.isArray(rawData) || rawData.questions)) {
            // Cache locally in localStorage for instant offline reuse
            try {
              localStorage.setItem(`${MOCK_DATA_PREFIX}${testId}`, JSON.stringify(rawData));
            } catch (lsErr) {
              console.warn(`[QuizLoader] LocalStorage save failed for ${testId}:`, lsErr);
            }

            // Save in Cache API for offline access
            if (cache) {
              try {
                const responseToCache = new Response(JSON.stringify(rawData), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json; charset=utf-8' }
                });
                await cache.put(fetchUrl, responseToCache);
              } catch (putErr) {
                console.warn(`[QuizLoader] Cache API put failed for ${fetchUrl}:`, putErr);
              }
            }

            break;
          }
        }
      } catch (fetchErr) {
        console.warn(`[QuizLoader] Fetch failed for ${fetchUrl}:`, fetchErr);
      }
    }
  }

  // Fallback: If network fetch failed, re-check Cache API
  if (!rawData && cache) {
    try {
      for (const p of candidatePaths) {
        const secondaryResponse = await cache.match(p);
        if (secondaryResponse && secondaryResponse.ok) {
          rawData = await secondaryResponse.json();
          if (rawData) break;
        }
      }
    } catch (_) {}
  }

  if (!rawData) {
    throw new Error(`Unable to load question data for test "${quiz.title || testId}". Please check internet connection.`);
  }

  // Parse & process raw quiz data using standard parser
  const primaryPath = candidatePaths[0] || rawFilePath;
  const processedQuiz = processRawQuizData(rawData, primaryPath, primaryPath.split('/').pop() || `${testId}.json`);

  // Preserve metadata properties while attaching loaded questions
  return {
    ...quiz,
    ...processedQuiz,
    testId: quiz.testId,
    title: quiz.title || processedQuiz.title,
    questions: processedQuiz.questions,
    qCount: processedQuiz.questions.length
  };
}

/**
 * Synchronizes and loads the quizzes metadata catalog from Remote Server, Cache API, or local bundle
 */
export async function fetchQuizzesMetadata(): Promise<Quiz[]> {
  let metadataList: any[] | null = null;
  let cache: Cache | null = null;

  // 1. Check localStorage override first (set by Admin Bulk Upload tool)
  try {
    const localOverride = localStorage.getItem(METADATA_OVERRIDE_KEY);
    if (localOverride) {
      const parsedOverride = JSON.parse(localOverride);
      if (Array.isArray(parsedOverride) && parsedOverride.length > 0) {
        return formatMetadataToLightweightQuizzes(parsedOverride);
      }
    }
  } catch (_) {}

  // 2. Check local remote metadata cache (stored from previous successful remote sync)
  let localRemoteCache: any[] | null = null;
  try {
    const cachedStr = localStorage.getItem(LOCAL_REMOTE_METADATA_CACHE);
    if (cachedStr) {
      localRemoteCache = JSON.parse(cachedStr);
    }
  } catch (_) {}

  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      cache = await caches.open(QUIZ_CACHE_NAME);
    } catch (_) {}
  }

  // 3. Network Fetch: Try remote website catalog (dsssbpyq.online) then relative catalog
  const catalogUrlsToTry = [
    `${REMOTE_METADATA_URL}?t=${Date.now()}`,
    `${QUIZZES_METADATA_URL}?t=${Date.now()}`
  ];

  for (const catalogUrl of catalogUrlsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const res = await fetch(catalogUrl, { signal: controller.signal }).catch(() => null);
      clearTimeout(timeoutId);

      if (res && res.ok) {
        const fetchedList = await res.json().catch(() => null);
        if (fetchedList && Array.isArray(fetchedList) && fetchedList.length > 0) {
          metadataList = fetchedList;

          // Save remotely fetched metadata in localStorage for offline persistence
          try {
            localStorage.setItem(LOCAL_REMOTE_METADATA_CACHE, JSON.stringify(metadataList));
          } catch (_) {}

          // Save in Cache API
          if (cache) {
            try {
              const responseToCache = new Response(JSON.stringify(metadataList), {
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
              });
              await cache.put(QUIZZES_METADATA_URL, responseToCache);
            } catch (_) {}
          }

          break; // Successfully fetched latest remote catalog!
        }
      }
    } catch (netErr) {
      console.warn(`[QuizLoader] Network fetch of metadata failed for ${catalogUrl}:`, netErr);
    }
  }

  // 4. Offline Fallback: If network fetch failed, use local remote cache or Cache API
  if (!metadataList || metadataList.length === 0) {
    if (localRemoteCache && Array.isArray(localRemoteCache) && localRemoteCache.length > 0) {
      metadataList = localRemoteCache;
      console.log(`[QuizLoader] Network unavailable. Using local remote metadata cache (${metadataList.length} quizzes).`);
    } else if (cache) {
      try {
        const cachedRes = await cache.match(QUIZZES_METADATA_URL);
        if (cachedRes && cachedRes.ok) {
          metadataList = await cachedRes.json();
        }
      } catch (_) {}
    }
  }

  // 5. Static Bundle Fallback & Merge: Safeguard to guarantee no missing quizzes
  let GENERATED_QUIZZES_METADATA: any[] = [];
  try {
    const staticBundle = await import('../data/generatedQuizzesMetadata');
    if (staticBundle && staticBundle.GENERATED_QUIZZES_METADATA) {
      GENERATED_QUIZZES_METADATA = staticBundle.GENERATED_QUIZZES_METADATA;
    }
  } catch (err) {
    console.warn("[QuizLoader] Failed to load static metadata bundle", err);
  }
  
  let BUILTIN_QUIZZES: any[] = [];
  try {
    const contentIndex = await import('../data/contentIndex');
    if (contentIndex && contentIndex.BUILTIN_QUIZZES) {
      BUILTIN_QUIZZES = contentIndex.BUILTIN_QUIZZES;
    }
  } catch (err) {}

  // Merge metadata list with static bundle by testId map
  const mergedMap = new Map<string, any>();
  
  // Static bundle first
  GENERATED_QUIZZES_METADATA.forEach(q => {
    if (q && q.testId) mergedMap.set(q.testId, q);
  });
  BUILTIN_QUIZZES.forEach(q => {
    if (q && q.testId) mergedMap.set(q.testId, q);
  });

  // Remote catalog second (overrides/augments static bundle with newly published remote mocks!)
  if (metadataList && Array.isArray(metadataList)) {
    metadataList.forEach(q => {
      if (q && q.testId) mergedMap.set(q.testId, q);
    });
  }

  const finalCatalog = Array.from(mergedMap.values());
  return formatMetadataToLightweightQuizzes(finalCatalog);
}

/**
 * Formats metadata array into lightweight Quiz objects (without loading heavy question arrays into list memory)
 */
export function formatMetadataToLightweightQuizzes(metadataList: any[]): Quiz[] {
  return metadataList.map(meta => ({
    testId: meta.testId,
    title: meta.title,
    totalTimeMinutes: meta.totalTimeMinutes || 60,
    markingScheme: meta.markingScheme || { correct: 1, negative: 0.25 },
    category: meta.category || 'part_b',
    subject: meta.subject || 'Computer Science',
    topic: meta.topic || 'General Practice',
    isPartA: meta.isPartA ?? (meta.category === 'part_a'),
    qCount: meta.qCount || (Array.isArray(meta.questions) ? meta.questions.length : 0),
    file: meta.file,
    questions: [] // Intentionally empty - questions loaded dynamically on demand for active mock!
  }));
}
