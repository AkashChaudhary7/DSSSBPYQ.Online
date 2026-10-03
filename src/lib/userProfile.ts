import { Attempt, Bookmark, Question, Quiz } from '../types';

export interface UserProfile {
  profileId: string;
  username: string;
  targetExam: string;
  avatar: string;
  bio?: string;
  createdAt: string;
  lastActiveAt: string;
  badges: string[];
}

export interface UserProgressBackupPackage {
  version: string;
  appIdentifier: string;
  exportedAt: string;
  profile: UserProfile;
  pastAttempts: Attempt[];
  savedBookmarks: Bookmark[];
  missedQuestions: Question[];
  questionPerformance: Record<string, 'correct' | 'incorrect' | 'unattempted'>;
  unlockedQuizIds: Record<string, boolean>;
  customQuizzes: Quiz[];
  syllabusProgress?: Record<string, boolean>;
}

export const AVATAR_OPTIONS = [
  { id: 'avatar_1', name: 'CS Scholar', icon: '💻', bg: 'bg-blue-500' },
  { id: 'avatar_2', name: 'Code Ninja', icon: '⚡', bg: 'bg-indigo-500' },
  { id: 'avatar_3', name: 'Logic Master', icon: '🎯', bg: 'bg-emerald-500' },
  { id: 'avatar_4', name: 'Algorithm Wizard', icon: '🔮', bg: 'bg-purple-500' },
  { id: 'avatar_5', name: 'Exam Topper', icon: '🏆', bg: 'bg-amber-500' },
  { id: 'avatar_6', name: 'Data Architect', icon: '🗄️', bg: 'bg-rose-500' },
];

export const TARGET_EXAM_OPTIONS = [
  'DSSSB TGT Computer Science (41/26)',
  'DSSSB PGT Computer Science',
  'DSSSB Special Education Teacher',
  'DSSSB Primary & Nursery Teacher (PRT)',
  'DSSSB Non-Teaching (LDC / Junior Assistant / Steno)',
];

export const PROFILE_KEY = 'dsssb_user_profile';

// Generate unique profile identifier
export function generateProfileId(): string {
  const rand = Math.random().toString(36).substring(2, 8);
  const ts = Date.now().toString(36).substring(4);
  return `usr_${rand}${ts}`;
}

// Get or initialize User Profile from Local Storage
export function getOrCreateUserProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return {
      profileId: generateProfileId(),
      username: 'Candidate',
      targetExam: TARGET_EXAM_OPTIONS[0],
      avatar: 'avatar_1',
      bio: 'Preparing for Delhi DSSSB Computer Science CBT Examination.',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      badges: ['First Step']
    };
  }

  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.profileId) {
        // Ensure lastActiveAt updated
        parsed.lastActiveAt = new Date().toISOString();
        localStorage.setItem(PROFILE_KEY, JSON.stringify(parsed));
        return parsed;
      }
    }

    // Fallback: migrate legacy username if set
    const legacyUsername = localStorage.getItem('dsssb_username') || 'Candidate';
    const newProfile: UserProfile = {
      profileId: generateProfileId(),
      username: legacyUsername,
      targetExam: TARGET_EXAM_OPTIONS[0],
      avatar: 'avatar_1',
      bio: 'Preparing for Delhi DSSSB Computer Science CBT Examination.',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      badges: ['First Step']
    };

    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    localStorage.setItem('dsssb_username', legacyUsername);
    return newProfile;
  } catch (err) {
    console.warn("Failed to load user profile from local storage:", err);
    return {
      profileId: generateProfileId(),
      username: 'Candidate',
      targetExam: TARGET_EXAM_OPTIONS[0],
      avatar: 'avatar_1',
      bio: 'Preparing for Delhi DSSSB Computer Science CBT Examination.',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      badges: ['First Step']
    };
  }
}

// Save updated profile
export function saveUserProfile(profile: UserProfile): UserProfile {
  const updated: UserProfile = {
    ...profile,
    lastActiveAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    localStorage.setItem('dsssb_username', updated.username);
  } catch (err) {
    console.error("Error saving user profile:", err);
  }
  return updated;
}

// Safe stringifier for JSON export
export function safeJsonStringify(val: any): string {
  const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_key: string, value: any) => {
      if (typeof value === "object" && value !== null) {
        if (
          value.nodeType !== undefined ||
          value.tagName !== undefined ||
          (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) ||
          value.$$typeof
        ) {
          return undefined;
        }
        if (seen.has(value)) {
          return undefined;
        }
        seen.add(value);
      }
      return value;
    };
  };
  return JSON.stringify(val, getCircularReplacer(), 2);
}

// Build Export Package
export function buildExportDataPackage(profileOverride?: UserProfile): UserProgressBackupPackage {
  const profile = profileOverride || getOrCreateUserProfile();

  const attempts: Attempt[] = (() => {
    try {
      const saved = localStorage.getItem('dsssb_attempts');
      return saved ? JSON.parse(saved) : [];
    } catch (_) { return []; }
  })();

  const bookmarks: Bookmark[] = (() => {
    try {
      const saved = localStorage.getItem('dsssb_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch (_) { return []; }
  })();

  const missedQuestions: Question[] = (() => {
    try {
      const saved = localStorage.getItem('dsssb_missed_questions');
      return saved ? JSON.parse(saved) : [];
    } catch (_) { return []; }
  })();

  const questionPerformance: Record<string, 'correct' | 'incorrect' | 'unattempted'> = (() => {
    try {
      const saved = localStorage.getItem('dsssb_question_performance');
      return saved ? JSON.parse(saved) : {};
    } catch (_) { return {}; }
  })();

  const unlockedQuizIds: Record<string, boolean> = (() => {
    try {
      const saved = localStorage.getItem('dsssb_unlocked_quizzes');
      return saved ? JSON.parse(saved) : {};
    } catch (_) { return {}; }
  })();

  const customQuizzes: Quiz[] = (() => {
    try {
      const saved = localStorage.getItem('dsssb_custom_quizzes');
      return saved ? JSON.parse(saved) : [];
    } catch (_) { return []; }
  })();

  const syllabusProgress: Record<string, boolean> = (() => {
    try {
      const saved = localStorage.getItem('dsssb_syllabus_tracker_progress');
      return saved ? JSON.parse(saved) : {};
    } catch (_) { return {}; }
  })();

  return {
    version: '1.0',
    appIdentifier: 'dsssb_pyq_online',
    exportedAt: new Date().toISOString(),
    profile,
    pastAttempts: Array.isArray(attempts) ? attempts : [],
    savedBookmarks: Array.isArray(bookmarks) ? bookmarks : [],
    missedQuestions: Array.isArray(missedQuestions) ? missedQuestions : [],
    questionPerformance: typeof questionPerformance === 'object' && questionPerformance !== null ? questionPerformance : {},
    unlockedQuizIds: typeof unlockedQuizIds === 'object' && unlockedQuizIds !== null ? unlockedQuizIds : {},
    customQuizzes: Array.isArray(customQuizzes) ? customQuizzes : [],
    syllabusProgress: typeof syllabusProgress === 'object' && syllabusProgress !== null ? syllabusProgress : {}
  };
}

// Download JSON Backup
export function downloadProfileBackup(profile?: UserProfile) {
  const backupPkg = buildExportDataPackage(profile);
  const jsonStr = safeJsonStringify(backupPkg);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  const fileName = `dsssb_profile_backup_${backupPkg.profile.profileId}_${new Date().toISOString().slice(0, 10)}.json`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Encode to Base64 Sync Code
export function generateSyncCode(profile?: UserProfile): string {
  try {
    const pkg = buildExportDataPackage(profile);
    const jsonStr = JSON.stringify(pkg);
    // Base64 encode using encodeURIComponent + btoa to support Unicode symbols safely
    const utf8Bytes = encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_match, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    );
    return `DSSSB_SYNC_V1:${btoa(utf8Bytes)}`;
  } catch (err) {
    console.error("Failed to generate sync code:", err);
    throw new Error("Failed to encode profile sync data.");
  }
}

// Decode Base64 Sync Code
export function decodeSyncCode(syncCodeStr: string): UserProgressBackupPackage {
  const trimmed = syncCodeStr.trim();
  let base64Data = trimmed;
  if (trimmed.startsWith('DSSSB_SYNC_V1:')) {
    base64Data = trimmed.replace('DSSSB_SYNC_V1:', '');
  }

  try {
    const decodedUtf8 = atob(base64Data);
    const jsonStr = decodeURIComponent(
      decodedUtf8.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    const parsed = JSON.parse(jsonStr);
    if (!parsed || !parsed.profile || !parsed.profile.profileId) {
      throw new Error("Invalid sync code package format.");
    }
    return parsed;
  } catch (err: any) {
    console.error("Error decoding sync code:", err);
    throw new Error("Invalid or corrupted sync code. Please check the text and try again.");
  }
}

// Import and save user package into Local Storage
export function importUserDataPackage(pkg: UserProgressBackupPackage, mergeMode: 'overwrite' | 'merge' = 'merge'): {
  profile: UserProfile;
  pastAttempts: Attempt[];
  savedBookmarks: Bookmark[];
  missedQuestions: Question[];
  questionPerformance: Record<string, 'correct' | 'incorrect' | 'unattempted'>;
  unlockedQuizIds: Record<string, boolean>;
  customQuizzes: Quiz[];
} {
  if (!pkg || !pkg.profile || !pkg.profile.profileId) {
    throw new Error("Invalid backup structure. Missing profile identifier.");
  }

  try {
    // 1. Profile
    let finalProfile = pkg.profile;
    finalProfile.lastActiveAt = new Date().toISOString();

    // 2. Attempts
    let finalAttempts = pkg.pastAttempts || [];
    if (mergeMode === 'merge') {
      const existingAttemptsStr = localStorage.getItem('dsssb_attempts');
      const existingAttempts: Attempt[] = existingAttemptsStr ? JSON.parse(existingAttemptsStr) : [];
      const attemptMap = new Map<string, Attempt>();
      [...existingAttempts, ...finalAttempts].forEach(a => {
        if (a && a.id) attemptMap.set(a.id, a);
      });
      finalAttempts = Array.from(attemptMap.values()).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }

    // 3. Bookmarks
    let finalBookmarks = pkg.savedBookmarks || [];
    if (mergeMode === 'merge') {
      const existingStr = localStorage.getItem('dsssb_bookmarks');
      const existing: Bookmark[] = existingStr ? JSON.parse(existingStr) : [];
      const bmSet = new Set<string>();
      const combined: Bookmark[] = [];
      [...existing, ...finalBookmarks].forEach(bm => {
        if (!bm || !bm.question) return;
        const key = `${bm.quizId}_${bm.question?.id || bm.question?.question}`;
        if (!bmSet.has(key)) {
          bmSet.add(key);
          combined.push(bm);
        }
      });
      finalBookmarks = combined;
    }

    // 4. Missed Questions (Mistake Vault)
    let finalMissed = pkg.missedQuestions || [];
    if (mergeMode === 'merge') {
      const existingStr = localStorage.getItem('dsssb_missed_questions');
      const existing: Question[] = existingStr ? JSON.parse(existingStr) : [];
      const qSet = new Set<string>();
      const combined: Question[] = [];
      [...existing, ...finalMissed].forEach(q => {
        if (!q) return;
        const key = `${q.id || ''}_${q.question || ''}`;
        if (!qSet.has(key)) {
          qSet.add(key);
          combined.push(q);
        }
      });
      finalMissed = combined;
    }

    // 5. Question Performance
    let finalPerf = pkg.questionPerformance || {};
    if (mergeMode === 'merge') {
      const existingStr = localStorage.getItem('dsssb_question_performance');
      const existing = existingStr ? JSON.parse(existingStr) : {};
      finalPerf = { ...existing, ...finalPerf };
    }

    // 6. Unlocked Quiz IDs
    let finalUnlocked = pkg.unlockedQuizIds || {};
    if (mergeMode === 'merge') {
      const existingStr = localStorage.getItem('dsssb_unlocked_quizzes');
      const existing = existingStr ? JSON.parse(existingStr) : {};
      finalUnlocked = { ...existing, ...finalUnlocked };
    }

    // 7. Custom Quizzes
    let finalCustom = pkg.customQuizzes || [];
    if (mergeMode === 'merge') {
      const existingStr = localStorage.getItem('dsssb_custom_quizzes');
      const existing: Quiz[] = existingStr ? JSON.parse(existingStr) : [];
      const map = new Map<string, Quiz>();
      [...existing, ...finalCustom].forEach(q => {
        if (q && q.testId) map.set(q.testId, q);
      });
      finalCustom = Array.from(map.values());
    }

    // 8. Syllabus Progress
    let finalSyllabus = pkg.syllabusProgress || {};
    if (mergeMode === 'merge') {
      const existingStr = localStorage.getItem('dsssb_syllabus_tracker_progress');
      const existing = existingStr ? JSON.parse(existingStr) : {};
      finalSyllabus = { ...existing, ...finalSyllabus };
    }

    // Ensure reset key is marked active
    localStorage.setItem('dsssb_metric_reset_v5', 'true');

    // Save to localStorage
    localStorage.setItem(PROFILE_KEY, JSON.stringify(finalProfile));
    localStorage.setItem('dsssb_username', finalProfile.username);
    localStorage.setItem('dsssb_attempts', JSON.stringify(finalAttempts));
    localStorage.setItem('dsssb_bookmarks', JSON.stringify(finalBookmarks));
    localStorage.setItem('dsssb_missed_questions', JSON.stringify(finalMissed));
    localStorage.setItem('dsssb_question_performance', JSON.stringify(finalPerf));
    localStorage.setItem('dsssb_unlocked_quizzes', JSON.stringify(finalUnlocked));
    localStorage.setItem('dsssb_custom_quizzes', JSON.stringify(finalCustom));
    localStorage.setItem('dsssb_syllabus_tracker_progress', JSON.stringify(finalSyllabus));

    // Update completed test IDs
    const completedIds = Array.from(new Set(finalAttempts.map(a => a.testId)));
    localStorage.setItem('dsssb_completed_test_ids', JSON.stringify(completedIds));

    return {
      profile: finalProfile,
      pastAttempts: finalAttempts,
      savedBookmarks: finalBookmarks,
      missedQuestions: finalMissed,
      questionPerformance: finalPerf,
      unlockedQuizIds: finalUnlocked,
      customQuizzes: finalCustom
    };
  } catch (err: any) {
    console.error("Error committing imported data package to localStorage:", err);
    throw new Error("Failed to write imported data package to local storage.");
  }
}

// Compute Badges & Statistics
export function computeProfileStats(
  attempts: Attempt[],
  bookmarks: Bookmark[],
  missedQuestions: Question[],
  _questionPerf: Record<string, any>
) {
  const totalTestsTaken = attempts.length;
  const totalScore = attempts.reduce((acc, a) => acc + Math.max(0, a.score), 0);
  const avgScore = totalTestsTaken > 0 ? parseFloat((totalScore / totalTestsTaken).toFixed(2)) : 0;
  
  const totalAccuracySum = attempts.reduce((acc, a) => acc + (a.accuracy || 0), 0);
  const avgAccuracy = totalTestsTaken > 0 ? Math.round(totalAccuracySum / totalTestsTaken) : 0;

  const totalQuestionsAnswered = attempts.reduce((acc, a) => acc + (a.correctCount + a.incorrectCount), 0);

  // Compute earned badges
  const earnedBadges: Array<{ name: string; desc: string; icon: string; unlocked: boolean }> = [
    { name: 'First Step', desc: 'Created local student profile', icon: '🚀', unlocked: true },
    { name: 'Mock Debut', desc: 'Completed first practice test', icon: '🎯', unlocked: totalTestsTaken >= 1 },
    { name: 'High Accuracy', desc: 'Achieved 80%+ accuracy in a test', icon: '⭐', unlocked: attempts.some(a => a.accuracy >= 80) },
    { name: 'Streak 5', desc: 'Completed 5 mock tests', icon: '🔥', unlocked: totalTestsTaken >= 5 },
    { name: 'Vault Collector', desc: 'Saved 5+ questions in Bookmarks', icon: '📌', unlocked: bookmarks.length >= 5 },
    { name: 'Mistake Eraser', desc: 'Reviewed and corrected mistake questions', icon: '🛡️', unlocked: missedQuestions.length < 5 && totalTestsTaken >= 2 },
    { name: 'Century Club', desc: 'Answered 100+ questions', icon: '💯', unlocked: totalQuestionsAnswered >= 100 },
    { name: 'CS Master', desc: 'Completed 15+ mock tests', icon: '🏆', unlocked: totalTestsTaken >= 15 },
  ];

  return {
    totalTestsTaken,
    avgScore,
    avgAccuracy,
    totalQuestionsAnswered,
    bookmarksCount: bookmarks.length,
    mistakeVaultCount: missedQuestions.length,
    earnedBadges
  };
}

// Get current study streak count from Local Storage
export function getStreakCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const todayDone = localStorage.getItem(`dsssb_daily_quiz_attempted_${todayStr}`) === 'true';

    let currentStreak = 0;
    let checkDate = new Date(today);

    if (!todayDone) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    let maxDays = 365;
    while (maxDays > 0) {
      maxDays--;
      const yyyy = checkDate.getFullYear();
      const mm = String(checkDate.getMonth() + 1).padStart(2, '0');
      const dd = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const isDone = localStorage.getItem(`dsssb_daily_quiz_attempted_${dateStr}`) === 'true';

      if (isDone) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return currentStreak;
  } catch (err) {
    return 0;
  }
}

// Get syllabus completion stats from Local Storage
export function getSyllabusCompletionStats(): { completed: number; total: number; percent: number } {
  if (typeof window === 'undefined') return { completed: 0, total: 101, percent: 0 };
  try {
    const saved = localStorage.getItem('dsssb_syllabus_tracker_v2');
    const checkedIds: Record<string, boolean> = saved ? JSON.parse(saved) : {};
    
    const total = 101; // DSSSB TGT CS total topics count
    const completed = Object.values(checkedIds).filter(Boolean).length;
    const percent = Math.min(100, Math.round((completed / total) * 100));
    return { completed, total, percent };
  } catch (err) {
    return { completed: 0, total: 101, percent: 0 };
  }
}
