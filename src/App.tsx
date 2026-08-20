import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, BookOpen, Star, AlertCircle, RefreshCw, Zap, Heart, Search, Github, 
  Settings, ChevronRight, Download, Eye, Play, Sparkles, BookMarked, Layers, HelpCircle, ArrowLeft, Volume2, Share2, ClipboardList, XCircle, Send,
  Trash2, AlertTriangle, ListTodo, CheckSquare, Lock, Clock, Laptop, Building2, Sun, Moon, Database, User, Youtube
} from 'lucide-react';

import { Quiz, Question, Attempt, Bookmark, ActiveQuizSession, ReportedQuestionRecord, OFFICIAL_CS_TOPICS_LIST } from './types';
import { UserProfile, getOrCreateUserProfile, saveUserProfile, getStreakCount, getSyllabusCompletionStats } from './lib/userProfile';
import UserProfileModal from './components/UserProfileModal';
import AchievementCardModal from './components/AchievementCardModal';
import { ReportedQuestionsTrackerModal } from './components/ReportedQuestionsTrackerModal';
import { SubscribeBannerModal } from './components/SubscribeBannerModal';
import { PromoBanners } from './components/PromoBanners';
import { DSSSB_EXAMS } from './data/dsssbExams';
import { cleanOptionText, hasOptionPrefix, getDisplayOptionText } from './lib/formatText';
import { trackPageView, trackQuizStart, trackSearch, initGA } from './lib/analytics';
import { processRawQuizData } from './lib/quizParser';
import { fetchQuizzesMetadata, loadActiveQuizQuestions } from './lib/quizLoader';
import { getInitialQuizzes } from './lib/initialQuizzes';
import { getMockUnlockStatus, MockUnlockStatus } from './lib/unlockSystem';
import { TgtCsCategoryIcon, CommonDsssbCategoryIcon, FullMockCategoryIcon, CategoryIcon } from './components/CategoryIcons';
import { getMockNumberLabel, getQuestionCount, getTopicBadge, getDifficultyTag } from './lib/quizDisplayHelpers';

import AdBanner from './components/AdBanner';
import QuizInterface from './components/QuizInterface';
import FooterWithCompliance from './components/FooterWithCompliance';
import ResultScreen from './components/ResultScreen';
import SolutionReview from './components/SolutionReview';
import Leaderboard from './components/Leaderboard';
import SyllabusTracker from './components/SyllabusTracker';
import TgtCsHub from './components/TgtCsHub';
import CommonDsssbHub from './components/CommonDsssbHub';
import TeachingMethodologyHub from './components/TeachingMethodologyHub';
import DataManager from './components/DataManager';
import ContentHub from './components/ContentHub';
import SeoPreviewHub from './components/SeoPreviewHub';
import DailyStreakTracker from './components/DailyStreakTracker';
import { PartAMockSpecialBanner } from './components/PartAMockSpecialBanner';
import { Glass3dIcon } from './components/Glass3dIcons';
import MobileAppInstallModal from './components/MobileAppInstallModal';

const LazyViewFallback = () => (
  <div className="py-20 flex flex-col items-center justify-center space-y-3">
    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-xs font-bold text-slate-500 animate-pulse">Loading view...</p>
  </div>
);

export default function App() {
  // Helper to extract exam slug from URL (e.g., /syllabus/tgt-computer-science)
  const getExamSlugFromUrl = (): string | null => {
    if (typeof window === 'undefined') return null;
    const searchParams = new URLSearchParams(window.location.search);
    const slugParam = searchParams.get('slug');
    if (slugParam) return slugParam;

    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    if (path.startsWith('/syllabus/')) {
      const slug = path.replace('/syllabus/', '').trim();
      if (slug) return slug;
    }
    return null;
  };

  // Helper to determine initial view based on URL pathname, hash, or tab search query
  const getViewFromUrl = (): 'dashboard' | 'quiz' | 'analyzing' | 'result' | 'bookmarks' | 'mistakes' | 'adaptive-path' | 'solution-review' | 'part-a-view' | 'part-b-view' | 'full-mock-view' | 'syllabus' | 'tgt-cs-view' | 'common-dsssb-view' | 'teaching-methodology-view' | 'data-manager' | 'content' | 'seo-preview' => {
    if (typeof window === 'undefined') return 'dashboard';
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    const hash = window.location.hash.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');

    if (hash.startsWith('#/content') || hash.startsWith('#content') || path === '/content' || tab === 'content') return 'content';
    if (hash.startsWith('#/seo') || hash.startsWith('#seo') || path === '/seo' || path === '/seo-preview' || tab === 'seo') return 'seo-preview';

    if (hash.startsWith('#/syllabus') || path === '/syllabus' || path.startsWith('/syllabus/') || tab === 'syllabus') return 'syllabus';
    if (hash.startsWith('#/tgt-cs') || path === '/computer-science' || path === '/cs' || path === '/tgt-cs' || path === '/tgt-computer-science' || tab === 'cs' || tab === 'tgt-cs' || tab === 'tgt_cs') return 'tgt-cs-view';
    if (hash.startsWith('#/common-dsssb') || path === '/general-ability' || path === '/common-dsssb' || path === '/common-exam' || tab === 'general-ability' || tab === 'common-dsssb' || tab === 'common_dsssb') return 'common-dsssb-view';
    if (hash.startsWith('#/teaching-methodology') || path === '/teaching-methodology' || path === '/pedagogy' || tab === 'teaching-methodology' || tab === 'pedagogy') return 'teaching-methodology-view';
    if (path === '/part-a' || tab === 'part-a' || tab === 'part_a') return 'part-a-view';
    if (path === '/part-b' || tab === 'part-b' || tab === 'part_b') return 'part-b-view';
    if (path === '/full-mocks' || tab === 'full-mocks' || tab === 'full_mocks') return 'full-mock-view';
    if (path === '/booster' || tab === 'booster' || tab === 'adaptive-path') return 'adaptive-path';
    if (path === '/mistakes' || tab === 'mistakes') return 'mistakes';
    if (path === '/bookmarks' || tab === 'bookmarks') return 'bookmarks';
    if (path === '/solution-review' || tab === 'solution-review') return 'solution-review';

    return 'dashboard';
  };

  // Helper to extract content sub tab (telegram vs youtube) from Hash
  const getContentSubTabFromUrl = (): 'telegram' | 'youtube' => {
    if (typeof window === 'undefined') return 'telegram';
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('youtube')) return 'youtube';
    return 'telegram';
  };

  // Navigation & Core States
  const [activeView, setActiveView] = useState<'dashboard' | 'quiz' | 'analyzing' | 'result' | 'bookmarks' | 'mistakes' | 'adaptive-path' | 'solution-review' | 'part-a-view' | 'part-b-view' | 'full-mock-view' | 'syllabus' | 'tgt-cs-view' | 'common-dsssb-view' | 'teaching-methodology-view' | 'data-manager' | 'content' | 'seo-preview'>(getViewFromUrl);
  const [contentSubTab, setContentSubTab] = useState<'telegram' | 'youtube'>(getContentSubTabFromUrl);
  const [selectedExamSlug, setSelectedExamSlug] = useState<string | null>(getExamSlugFromUrl);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const prevActiveViewRef = useRef(activeView);

  // Synchronize browser URL bar, back/forward navigation state, and SEO metadata
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let targetPath = '/';
    let pageTitle = 'DSSSB PYQ Online - TGT Computer Science Mock Tests & Official PYQs';
    let pageDesc = 'Free online DSSSB TGT Computer Science mock tests, official previous year question papers (PYQs), subject-wise practice, error vault, and rank predictor for Delhi government exam preparation at DSSSBPYQ.Online.';

    if (activeView === 'content') {
      targetPath = contentSubTab === 'youtube' ? '/content#youtube' : '/content#telegram';
      pageTitle = 'Official DSSSB Study Content & Communities - Telegram Channels & YouTube Lectures | DSSSB PYQ Online';
      pageDesc = 'Access official Telegram study groups, computer science PDF notes, previous year question papers, and YouTube video lecture playlists for DSSSB TGT Computer Science & General Ability exams.';
    } else if (activeView === 'seo-preview') {
      targetPath = '/seo';
      pageTitle = 'Google Search Engine Preview & SERP Architecture | DSSSB PYQ Online';
      pageDesc = 'Inspect Google SERP search engine preview cards, direct URL routing architecture, and XML sitemaps for DSSSBPYQ.Online.';
    } else if (activeView === 'syllabus') {
      targetPath = selectedExamSlug ? `/syllabus/${selectedExamSlug}` : '/syllabus';

      if (selectedExamSlug === 'tgt-computer-science') {
        pageTitle = 'DSSSB TGT Computer Science Official Syllabus Tracker & DOE 32 Modules | DSSSB PYQ Online';
        pageDesc = 'Track official 32 Computer Science DOE modules, Part A General paper, and Teaching Methodology topics for DSSSB TGT CS exam with interactive checkboxes.';
      } else if (selectedExamSlug === 'pgt-computer-science') {
        pageTitle = 'DSSSB PGT Computer Science Syllabus Tracker & Advanced CS Topics | DSSSB PYQ Online';
        pageDesc = 'Check off advanced Computer Science, AI, Discrete Mathematics, Data Structures, Algorithms, and Pedagogy for DSSSB PGT CS exam.';
      } else if (selectedExamSlug === 'special-education') {
        pageTitle = 'DSSSB Special Education Teacher Syllabus Tracker - RPwD Act & Pedagogy | DSSSB PYQ Online';
        pageDesc = 'Interactive syllabus checklist for DSSSB Special Education Teacher & PRT exams covering RPwD Act 2016, Inclusive Education, and Child Psychology.';
      } else if (selectedExamSlug === 'prt-nursery') {
        pageTitle = 'DSSSB Primary & Nursery Teacher Syllabus Tracker - ECCE & Pedagogy | DSSSB PYQ Online';
        pageDesc = 'Check off Early Childhood Education (ECCE), Foundational Literacy & Numeracy (FLN), NCF 2005, and NEP 2020 for DSSSB Assistant Teacher exam.';
      } else if (selectedExamSlug === 'non-teaching-ldc') {
        pageTitle = 'DSSSB LDC / Junior Assistant / Steno Syllabus Tracker | DSSSB PYQ Online';
        pageDesc = 'Complete General Ability syllabus checklist for DSSSB Non-Teaching posts: Maths, Reasoning, English, Hindi, Delhi GA, and Computer Literacy.';
      } else {
        pageTitle = 'DSSSB Exam Official Syllabus Tracker Hub 2026 - TGT, PGT, PRT & Non-Teaching | DSSSB PYQ Online';
        pageDesc = 'Access official syllabus checklists for all DSSSB exams: TGT Computer Science, PGT CS, Special Education, Nursery/Primary Teacher, and LDC/Junior Assistant.';
      }
    } else if (activeView === 'tgt-cs-view') {
      targetPath = '/tgt-cs';
      pageTitle = 'DSSSB TGT Computer Science (41/26) Practice Hub | DSSSB PYQ Online';
      pageDesc = 'Practice DSSSB TGT CS 41/26 32 CS Modules, Part A General paper, and 200 Marks CBT Full Length Mocks at DSSSBPYQ.Online.';
    } else if (activeView === 'common-dsssb-view') {
      targetPath = '/common-dsssb';
      pageTitle = 'Common DSSSB Exam Practice Hub - 100 Marks Part A | DSSSB PYQ Online';
      pageDesc = 'Practice Part A General Ability (100 Marks) common for all DSSSB exams: TGT, PGT, PRT, Nursery, LDC, Steno, and Special Educator.';
    } else if (activeView === 'teaching-methodology-view') {
      targetPath = '/teaching-methodology';
      pageTitle = 'DSSSB Teaching Methodology & Pedagogy Mock Tests | DSSSB PYQ Online';
      pageDesc = 'Practice Teaching Methodology, Pedagogy, and Child Development questions for DSSSB exams.';
    } else if (activeView === 'part-a-view') {
      targetPath = '/part-a';
      pageTitle = 'DSSSB Part A PYQs & Practice Tests - General Awareness, Reasoning, Quants, English, Hindi | DSSSB PYQ Online';
      pageDesc = 'Practice DSSSB Part A general section mock tests, past year question papers, GK, Reasoning, Maths, English, and Hindi quizzes at DSSSBPYQ.Online.';
    } else if (activeView === 'part-b-view') {
      targetPath = '/part-b';
      pageTitle = 'DSSSB Part B Computer Science PYQs & Topic-Wise Tests - TGT CS | DSSSB PYQ Online';
      pageDesc = 'Master DSSSB TGT Computer Science Part B with subject-wise previous year questions, Operating Systems, DBMS, Networking, Data Structures, C++, Python, and Teaching Methodology tests.';
    } else if (activeView === 'full-mock-view') {
      targetPath = '/full-mocks';
      pageTitle = 'DSSSB TGT Computer Science Full-Length Mock Tests - Official 200 Marks Pattern | DSSSB PYQ Online';
      pageDesc = 'Take real exam-like 200 marks DSSSB TGT CS full-length mock tests with negative marking, timers, detailed solutions, and instant rank prediction.';
    } else if (activeView === 'adaptive-path') {
      targetPath = '/booster';
      pageTitle = 'DSSSB Subject Booster Practice Hub - Target Weak Areas | DSSSB PYQ Online';
      pageDesc = 'Boost your DSSSB TGT Computer Science preparation with topic-focused booster tests and adaptive practice sets.';
    } else if (activeView === 'mistakes') {
      targetPath = '/mistakes';
      pageTitle = 'Mistakes Vault & Error Analysis - DSSSB PYQ Online';
      pageDesc = 'Review and eliminate incorrect answers from past mock tests with the intelligent DSSSB Mistakes Vault.';
    } else if (activeView === 'bookmarks') {
      targetPath = '/bookmarks';
      pageTitle = 'Bookmarked Questions & Quick Revision - DSSSB PYQ Online';
      pageDesc = 'Access your saved high-yield DSSSB TGT Computer Science questions for rapid pre-exam revision.';
    } else if (activeView === 'data-manager') {
      targetPath = '/data-manager';
      pageTitle = 'JSON Data Manager & Indexer - DSSSB PYQ Online';
      pageDesc = 'Administrative dashboard for scanning, organizing, and linking mock test JSON files and managing metadata.';
    } else if (activeView === 'solution-review') {
      targetPath = '/solution-review';
      pageTitle = 'Detailed Test Solution Review & Explanations - DSSSB PYQ Online';
      pageDesc = 'Analyze question-by-question solutions, explanations, and key concepts from your recent DSSSB practice tests.';
    } else if (activeView === 'result') {
      targetPath = '/result';
      pageTitle = 'Test Performance Analysis & Scorecard - DSSSB PYQ Online';
      pageDesc = 'View your detailed score breakdown, accuracy percentage, time distribution, and rank prediction on DSSSB PYQ Online.';
    } else if (activeView === 'quiz') {
      const search = window.location.search;
      targetPath = `/quiz${search}`;
      pageTitle = selectedQuiz ? `${selectedQuiz.title} - Live Practice Test | DSSSB PYQ Online` : 'Live Practice Test - DSSSB PYQ Online';
    }

    const currentFullPath = window.location.pathname + window.location.search + window.location.hash;
    if (currentFullPath !== targetPath) {
      window.history.pushState({ activeView, contentSubTab, selectedExamSlug }, '', targetPath);
    }

    // Update Document Title
    document.title = pageTitle;

    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', pageDesc);

    // Update Canonical Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', `https://dsssbpyq.online${targetPath}`);

    // Scroll to top ONLY when activeView changes
    if (prevActiveViewRef.current !== activeView) {
      prevActiveViewRef.current = activeView;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeView, selectedQuiz, contentSubTab, selectedExamSlug]);


  // Dynamically load AdSense script on desktop / web view only (screen width >= 768px)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      if (activeView === 'dashboard' || activeView === 'test-list' || activeView === 'hub' || activeView === 'common-hub') {
        const loadAdSense = () => {
          if (!document.getElementById('adsense-script')) {
            const script = document.createElement('script');
            script.id = 'adsense-script';
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9282190735069880';
            script.async = true;
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
          }
        };

        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => setTimeout(loadAdSense, 1000));
        } else {
          setTimeout(loadAdSense, 1500);
        }
      }
    }
  }, [activeView]);

  useEffect(() => {
    const handlePopState = () => {
      const v = getViewFromUrl();
      const c = getContentSubTabFromUrl();
      const s = getExamSlugFromUrl();
      setActiveView(v);
      setContentSubTab(c);
      if (s) setSelectedExamSlug(s);
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Force light mode theme
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Cache clearing state & handler
  const [cacheToast, setCacheToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const handleClearQuizCache = async () => {
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
      try {
        localStorage.removeItem('dsssb_quizzes_metadata_override');
      } catch (_) {}

      // Re-fetch fresh metadata from network/static bundle
      const freshQuizzes = await fetchQuizzesMetadata();
      if (freshQuizzes && freshQuizzes.length > 0) {
        setStaticQuizzes(freshQuizzes);
      }

      setCacheToast({
        message: "Quiz cache & stale memory purged successfully! Re-synced latest 667 mock tests.",
        type: 'success'
      });
      setTimeout(() => setCacheToast(null), 4000);
    } catch (err) {
      console.error("Error clearing quiz cache:", err);
      setCacheToast({
        message: "Failed to clear quiz cache. Please try again.",
        type: 'info'
      });
      setTimeout(() => setCacheToast(null), 4000);
    }
  };
  
  // User Profile state (Local Storage based)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getOrCreateUserProfile());
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showAchievementModal, setShowAchievementModal] = useState<boolean>(false);

  // Username collection states
  const [username, setUsername] = useState<string>(() => userProfile.username || 'Candidate');
  const [showUsernameModal, setShowUsernameModal] = useState<boolean>(false);
  const [tempUsernameInput, setTempUsernameInput] = useState<string>('');
  
  // Quiz session intermediate states
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, number>>({});
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [localBookmarks, setLocalBookmarks] = useState<Record<number, boolean>>({});
  const [currentQuestionTimeSpent, setCurrentQuestionTimeSpent] = useState<Record<number, number>>({});

  // Local Storage lists
  const [pastAttempts, setPastAttempts] = useState<Attempt[]>(() => {
    try {
      const resetDone = localStorage.getItem('dsssb_metric_reset_v5');
      if (!resetDone) return [];
      const attempts = localStorage.getItem('dsssb_attempts');
      const parsed = attempts ? JSON.parse(attempts) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  });
  const [savedBookmarks, setSavedBookmarks] = useState<Bookmark[]>(() => {
    try {
      const resetDone = localStorage.getItem('dsssb_metric_reset_v5');
      if (!resetDone) return [];
      const bookmarks = localStorage.getItem('dsssb_bookmarks');
      const parsed = bookmarks ? JSON.parse(bookmarks) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  });
  const [missedQuestions, setMissedQuestions] = useState<Question[]>(() => {
    try {
      const resetDone = localStorage.getItem('dsssb_metric_reset_v5');
      if (!resetDone) return [];
      const missed = localStorage.getItem('dsssb_missed_questions');
      const parsed = missed ? JSON.parse(missed) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  });
  const [staticQuizzes, setStaticQuizzes] = useState<Quiz[]>(getInitialQuizzes);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
  const [customQuizzes, setCustomQuizzes] = useState<Quiz[]>(() => {
    try {
      const resetDone = localStorage.getItem('dsssb_metric_reset_v5');
      if (!resetDone) return [];
      const customs = localStorage.getItem('dsssb_custom_quizzes');
      const parsed = customs ? JSON.parse(customs) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  });
  const allQuizzes = useMemo(() => {
    const combined = [...staticQuizzes, ...customQuizzes];
    const map = new Map<string, Quiz>();
    combined.forEach(q => {
      if (q && q.testId && !map.has(q.testId)) {
        map.set(q.testId, q);
      }
    });
    return Array.from(map.values());
  }, [staticQuizzes, customQuizzes]);

  const [unlockedQuizIds, setUnlockedQuizIds] = useState<Record<string, boolean>>(() => {
    try {
      const resetDone = localStorage.getItem('dsssb_metric_reset_v5');
      if (!resetDone) return {};
      const unlocked = localStorage.getItem('dsssb_unlocked_quizzes');
      return unlocked ? JSON.parse(unlocked) : {};
    } catch (_) {
      return {};
    }
  });
  const [questionPerformance, setQuestionPerformance] = useState<Record<string, 'correct' | 'incorrect' | 'unattempted'>>(() => {
    try {
      const resetDone = localStorage.getItem('dsssb_metric_reset_v5');
      if (!resetDone) return {};
      const perf = localStorage.getItem('dsssb_question_performance');
      return perf ? JSON.parse(perf) : {};
    } catch (_) {
      return {};
    }
  });

  // Dashboard filter & interaction states
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState<string>('');

  const matchingQuizzes = useMemo(() => {
    if (!dashboardSearchQuery.trim()) return [];
    const query = dashboardSearchQuery.toLowerCase().trim();
    const seen = new Set<string>();
    return allQuizzes.filter(quiz => {
      if (!quiz || !quiz.testId) return false;
      if (seen.has(quiz.testId)) return false;
      const matchTitle = quiz.title?.toLowerCase().includes(query) || false;
      const matchSubject = quiz.subject?.toLowerCase().includes(query) || false;
      const matchTopic = quiz.topic?.toLowerCase().includes(query) || false;
      const matchCategory = quiz.category?.toLowerCase().includes(query) || false;
      const isMatch = matchTitle || matchSubject || matchTopic || matchCategory;
      if (isMatch) {
        seen.add(quiz.testId);
        return true;
      }
      return false;
    });
  }, [dashboardSearchQuery, staticQuizzes, customQuizzes]);

  // Data import & restoration handler for Profile Sync
  const handleDataImported = (restored: any) => {
    if (restored.profile) {
      setUserProfile(restored.profile);
      if (restored.profile.username) {
        setUsername(restored.profile.username);
      }
    }
    if (Array.isArray(restored.pastAttempts)) {
      setPastAttempts(restored.pastAttempts);
    }
    if (Array.isArray(restored.savedBookmarks)) {
      setSavedBookmarks(restored.savedBookmarks);
    }
    if (Array.isArray(restored.missedQuestions)) {
      setMissedQuestions(restored.missedQuestions);
    }
    if (restored.questionPerformance) {
      setQuestionPerformance(restored.questionPerformance);
    }
    if (restored.unlockedQuizIds) {
      setUnlockedQuizIds(restored.unlockedQuizIds);
    }
    if (Array.isArray(restored.customQuizzes)) {
      setCustomQuizzes(restored.customQuizzes);
    }
  };

  const handleClearAllData = () => {
    try {
      localStorage.removeItem('dsssb_user_profile');
      localStorage.removeItem('dsssb_attempts');
      localStorage.removeItem('dsssb_bookmarks');
      localStorage.removeItem('dsssb_missed_questions');
      localStorage.removeItem('dsssb_question_performance');
      localStorage.removeItem('dsssb_unlocked_quizzes');
      localStorage.removeItem('dsssb_custom_quizzes');
      localStorage.removeItem('dsssb_completed_test_ids');
      localStorage.removeItem('dsssb_completed_test_scores');
      localStorage.removeItem('dsssb_syllabus_tracker_progress');
    } catch (_) {}

    const freshProfile = getOrCreateUserProfile();
    setUserProfile(freshProfile);
    setUsername(freshProfile.username);
    setPastAttempts([]);
    setSavedBookmarks([]);
    setMissedQuestions([]);
    setQuestionPerformance({});
    setUnlockedQuizIds({});
    setCustomQuizzes([]);
  };

  const matchingSyllabusItems = useMemo(() => {
    if (!dashboardSearchQuery.trim()) return [];
    const query = dashboardSearchQuery.toLowerCase().trim();
    const matches: Array<{
      examTitle: string;
      sectionTitle: string;
      item: any;
    }> = [];

    DSSSB_EXAMS.forEach(exam => {
      exam.sections.forEach(sec => {
        sec.items.forEach(item => {
          const matchTitle = item.title?.toLowerCase().includes(query) || false;
          const matchDesc = item.description?.toLowerCase().includes(query) || false;
          const matchCode = item.code?.toLowerCase().includes(query) || false;
          const matchSection = sec.title?.toLowerCase().includes(query) || false;
          
          if (matchTitle || matchDesc || matchCode || matchSection) {
            if (!matches.some(existing => existing.item.id === item.id)) {
              matches.push({
                examTitle: exam.title,
                sectionTitle: sec.title,
                item
              });
            }
          }
        });
      });
    });

    return matches;
  }, [dashboardSearchQuery]);
  const [activePartATab, setActivePartATab] = useState<string>('All Subjects');
  const [fullMockTab, setFullMockTab] = useState<'mock' | 'pyp'>('mock');
  const [appVisibleCount, setAppVisibleCount] = useState<number>(15);
  const [mockSubTab, setMockSubTab] = useState<'part_a' | 'full'>('full');
  const [partBSubject, setPartBSubject] = useState<'All Subjects' | 'TGT CS' | 'Teaching Methodology'>('All Subjects');
  const [partBTopic, setPartBTopic] = useState<string>('All Topics');
  const [tgtCsInitialTab, setTgtCsInitialTab] = useState<'part_a' | 'part_b' | 'part_a_full' | 'full'>('part_b');
  const [tgtCsInitialTopic, setTgtCsInitialTopic] = useState<string>('All Topics');
  const [showSubscribeModal, setShowSubscribeModal] = useState<boolean>(false);

  // Automated Daily Mock Unlocking System - Live ticker state & modal state
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const [lockedQuizModal, setLockedQuizModal] = useState<{ quiz: Quiz; status: MockUnlockStatus } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Google Analytics on mount
  useEffect(() => {
    initGA();
  }, []);

  // Question Reporting & Admin states
  const [reportedQuestions, setReportedQuestions] = useState<ReportedQuestionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('dsssb_reported_questions');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  });
  const [reportedQuestionIds, setReportedQuestionIds] = useState<(string | number)[]>(() => {
    try {
      const saved = localStorage.getItem('dsssb_reported_question_ids');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  });
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<(string | number)[]>(() => {
    try {
      const saved = localStorage.getItem('dsssb_deleted_question_ids');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  });
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Active Quiz Session Persistence State
  const [activeQuizSession, setActiveQuizSession] = useState<ActiveQuizSession | null>(() => {
    try {
      const saved = localStorage.getItem('dsssb_active_quiz_session');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && parsed.quiz && Array.isArray(parsed.quiz.questions) && parsed.quiz.questions.length > 0) {
        return parsed as ActiveQuizSession;
      }
      return null;
    } catch (_) {
      return null;
    }
  });

  const refreshActiveSession = () => {
    try {
      const saved = localStorage.getItem('dsssb_active_quiz_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.quiz && Array.isArray(parsed.quiz.questions) && parsed.quiz.questions.length > 0) {
          setActiveQuizSession(parsed as ActiveQuizSession);
          return;
        }
      }
    } catch (_) {}
    setActiveQuizSession(null);
  };

  // Modal states for Discard / Confirm replacement
  const [showDiscardConfirmModal, setShowDiscardConfirmModal] = useState<boolean>(false);
  const [pendingStartQuiz, setPendingStartQuiz] = useState<Quiz | null>(null);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState<boolean>(false);

  // Haptic feedback trigger for tactile touch interaction
  const triggerHaptic = (pattern: number | number[] = 12) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (_) {}
    }
  };

  const handleResumeQuiz = () => {
    if (!activeQuizSession) return;
    setSelectedQuiz(activeQuizSession.quiz);
    setActiveView('quiz');
  };

  const executeDiscardSession = () => {
    try {
      localStorage.removeItem('dsssb_active_quiz_session');
    } catch (_) {}
    setActiveQuizSession(null);
    setShowDiscardConfirmModal(false);
  };

  
  // PWA Install State for Mobile Header
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dsssb_app_installed') === 'true' || window.matchMedia('(display-mode: standalone)').matches;
    } catch (_) {
      return false;
    }
  });
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase()) || window.innerWidth < 768;
      setIsMobileDevice(isMobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem('dsssb_app_installed', 'true');
      } catch (_) {}
      setShowInstallModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    triggerHaptic(15);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        try {
          localStorage.setItem('dsssb_app_installed', 'true');
        } catch (_) {}
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallModal(true);
    }
  };

  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const [showDailyQuizWarning, setShowDailyQuizWarning] = useState<boolean>(false);
  const [shareToastMessage, setShareToastMessage] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShareToastMessage("🔗 Direct Mock Test Link copied to clipboard!");
      setTimeout(() => setShareToastMessage(null), 3500);
    }).catch(() => {
      alert(`Direct Mock Test Link: ${text}`);
    });
  };

  const handleShareMockLink = (quiz: Quiz, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Generate URL targeting the root path "/" with tab parameter to prevent 404s on unconfigured static hosts
    const viewToTabMap: Record<string, string> = {
      'tgt-cs-view': 'tgt-cs',
      'common-dsssb-view': 'common-dsssb',
      'part-a-view': 'part-a',
      'part-b-view': 'part-b',
      'full-mock-view': 'full-mocks',
      'adaptive-path': 'booster',
      'mistakes': 'mistakes',
      'bookmarks': 'bookmarks',
      'solution-review': 'solution-review',
      'syllabus': 'syllabus'
    };
    const tabParam = viewToTabMap[activeView] || 'dashboard';
    const shareUrl = `${window.location.origin}/?tab=${tabParam}&testId=${encodeURIComponent(quiz.testId)}`;
    
    if (navigator.share) {
      navigator.share({
        title: `DSSSB Mock Test: ${quiz.title}`,
        text: `🎯 Practice "${quiz.title}" (${quiz.questions?.length || 20} Qs) on DSSSB PYQ Online!`,
        url: shareUrl,
      }).catch(() => {
        copyToClipboard(shareUrl);
      });
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const handleImportCustomQuizzes = (newQuizzes: Quiz[]) => {
    setStaticQuizzes(prev => {
      const cleanPrev = prev.filter(p => !newQuizzes.some(n => n.testId === p.testId));
      return [...cleanPrev, ...newQuizzes];
    });
    setCustomQuizzes(prev => {
      const cleanPrev = prev.filter(p => !newQuizzes.some(n => n.testId === p.testId));
      const updated = [...cleanPrev, ...newQuizzes];
      try {
        localStorage.setItem('dsssb_custom_quizzes', safeStringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const handleDeleteCustomQuiz = (testId: string) => {
    setCustomQuizzes(prev => {
      const filtered = prev.filter(q => q.testId !== testId);
      try {
        localStorage.setItem('dsssb_custom_quizzes', safeStringify(filtered));
      } catch (_) {}
      return filtered;
    });
  };

  // Async Handler for Daily Booster Quiz that dynamically fetches questions if needed
  const handleStartDailyBoosterQuiz = async () => {
    setIsLoadingQuiz(true);
    try {
      const todayStr = getTodayDateString();
      let dailyQuiz = generateDailyQuiz(todayStr);

      if (!dailyQuiz || !dailyQuiz.questions || dailyQuiz.questions.length === 0) {
        // Questions are metadata-only in staticQuizzes; fetch sample questions dynamically across subjects
        const subjectsMap: Record<string, string[]> = {
          'Quantitative Aptitude': ['Quantitative Aptitude'],
          'General Intelligence & Reasoning': ['General Intelligence & Reasoning', 'Reasoning'],
          'General Awareness': ['General Awareness'],
          'General English': ['General English'],
          'General Hindi': ['General Hindi']
        };

        const loadedQuestionsBySubject: Record<string, Question[]> = {};
        const allLoadedQuestions: Question[] = [];

        // Pick sample quizzes from staticQuizzes for each subject
        for (const [subjectKey, subjectNames] of Object.entries(subjectsMap)) {
          const candidateQuizzes = staticQuizzes.filter(q => 
            subjectNames.some(name => (q.subject || '').includes(name) || (q.title || '').includes(name))
          );
          const toLoad = candidateQuizzes.slice(0, 3);
          const subjectQs: Question[] = [];

          for (const candidate of toLoad) {
            try {
              const fullQuiz = await loadActiveQuizQuestions(candidate);
              if (fullQuiz && fullQuiz.questions && fullQuiz.questions.length > 0) {
                subjectQs.push(...fullQuiz.questions);
                allLoadedQuestions.push(...fullQuiz.questions);
              }
            } catch (_) {}
          }
          loadedQuestionsBySubject[subjectKey] = subjectQs;
        }

        // If specific subjects didn't get enough, load first 5 general static quizzes
        if (allLoadedQuestions.length < 20) {
          const generalCandidates = staticQuizzes.slice(0, 5);
          for (const genCandidate of generalCandidates) {
            try {
              const fullQuiz = await loadActiveQuizQuestions(genCandidate);
              if (fullQuiz && fullQuiz.questions) {
                allLoadedQuestions.push(...fullQuiz.questions);
              }
            } catch (_) {}
          }
        }

        // Seeded random
        const seededRandom = (seedStr: string) => {
          let h = 1779033703 ^ seedStr.length;
          for (let i = 0; i < seedStr.length; i++) {
            h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
            h = (h << 13) | (h >>> 19);
          }
          return () => {
            h = Math.imul(h ^ (h >>> 16), 2246822507);
            h = Math.imul(h ^ (h >>> 13), 3266489909);
            return ((h ^= h >>> 16) >>> 0) / 4294967296;
          };
        };
        const rand = seededRandom(todayStr);
        const shuffle = <T,>(arr: T[]): T[] => {
          const copy = [...arr];
          for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
          }
          return copy;
        };

        const dailyQuestions: Question[] = [];
        for (const [subjectKey, questions] of Object.entries(loadedQuestionsBySubject)) {
          if (questions.length > 0) {
            const shuffled = shuffle(questions);
            const selected = shuffled.slice(0, 4);
            selected.forEach(q => {
              if (!dailyQuestions.some(dq => dq.question === q.question)) {
                dailyQuestions.push({
                  ...q,
                  id: dailyQuestions.length + 1,
                  section: `Part A - ${subjectKey}`
                });
              }
            });
          }
        }

        if (dailyQuestions.length < 20 && allLoadedQuestions.length > 0) {
          const shuffledAll = shuffle(allLoadedQuestions);
          for (const q of shuffledAll) {
            if (dailyQuestions.length >= 20) break;
            if (!dailyQuestions.some(dq => dq.question === q.question)) {
              dailyQuestions.push({
                ...q,
                id: dailyQuestions.length + 1,
                section: q.section || 'Part A - General'
              });
            }
          }
        }

        const finalQuestions = shuffle(dailyQuestions).map((q, idx) => ({
          ...q,
          id: idx + 1
        }));

        if (finalQuestions.length > 0) {
          const dateParts = todayStr.split('-');
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const year = dateParts[0];
          const monthName = months[parseInt(dateParts[1], 10) - 1] || 'Today';
          const day = parseInt(dateParts[2], 10);
          const formattedDate = `${day} ${monthName} ${year}`;

          dailyQuiz = {
            testId: `daily_quiz_${todayStr}`,
            title: `Daily Part A Practice Booster - ${formattedDate}`,
            totalTimeMinutes: 20,
            markingScheme: { correct: 1, negative: 0.25 },
            questions: finalQuestions,
            category: 'part_a',
            subject: 'Daily Quiz',
            topic: 'Daily Challenge',
            qCount: finalQuestions.length
          };
        }
      }

      if (dailyQuiz && dailyQuiz.questions && dailyQuiz.questions.length > 0) {
        handleStartTestAttempt(dailyQuiz);
      } else {
        alert("Daily Booster Quiz questions are preparing. Please try again in a moment.");
      }
    } catch (err) {
      console.error("Error launching daily booster quiz:", err);
      alert("Unable to load daily quiz questions. Please check connection.");
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Helper to determine today's date string in YYYY-MM-DD format
  const getTodayDateString = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Generate deterministic daily quiz based on date
  const generateDailyQuiz = (dateString: string): Quiz | null => {
    const subjectsMap = {
      'Quantitative Aptitude': ['Quantitative Aptitude'],
      'General Intelligence & Reasoning': ['General Intelligence & Reasoning', 'Reasoning'],
      'General Awareness': ['General Awareness'],
      'General English': ['General English'],
      'General Hindi': ['General Hindi']
    };

    const seededRandom = (seedStr: string) => {
      let h = 1779033703 ^ seedStr.length;
      for (let i = 0; i < seedStr.length; i++) {
        h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
      }
      return () => {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return ((h ^= h >>> 16) >>> 0) / 4294967296;
      };
    };

    const rand = seededRandom(dateString);

    const shuffle = <T,>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const dailyQuestions: Question[] = [];

    for (const [subjectKey, subjectNames] of Object.entries(subjectsMap)) {
      const subjectQuizzes = staticQuizzes.filter(q => subjectNames.includes(q.subject));
      const allQuestions: Question[] = subjectQuizzes.flatMap(q => (q.questions || []) as Question[]);
      
      if (allQuestions.length === 0) {
        continue;
      }

      const shuffledQuestions = shuffle(allQuestions);
      const selected = shuffledQuestions.slice(0, 4);

      selected.forEach((q: Question) => {
        dailyQuestions.push({
          ...q,
          id: dailyQuestions.length + 1,
          section: `Part A - ${subjectKey}`
        });
      });
    }

    if (dailyQuestions.length < 20) {
      const allPartAQuestions: Question[] = staticQuizzes
        .filter(q => q.category === 'part_a')
        .flatMap(q => (q.questions || []) as Question[]);
      if (allPartAQuestions.length > 0) {
        const shuffledAll = shuffle(allPartAQuestions);
        while (dailyQuestions.length < 20 && shuffledAll.length > 0) {
          const candidate = shuffledAll.pop()!;
          if (candidate && !dailyQuestions.some(q => q.question === candidate.question)) {
            dailyQuestions.push({
              ...candidate,
              id: dailyQuestions.length + 1,
              section: candidate.section || 'Part A - General'
            });
          }
        }
      }
    }

    const finalQuestions = shuffle(dailyQuestions).map((q, idx) => ({
      ...q,
      id: idx + 1
    }));

    if (finalQuestions.length === 0) return null;

    const dateParts = dateString.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = dateParts[0];
    const monthName = months[parseInt(dateParts[1], 10) - 1] || 'Today';
    const day = parseInt(dateParts[2], 10);
    const formattedDate = `${day} ${monthName} ${year}`;

    return {
      testId: `daily_quiz_${dateString}`,
      title: `Daily Part A Practice Booster - ${formattedDate}`,
      totalTimeMinutes: 20,
      markingScheme: { correct: 1, negative: 0.25 },
      questions: finalQuestions,
      category: 'part_a',
      subject: 'Daily Quiz',
      topic: 'Daily Challenge'
    };
  };

  // Initialize data from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('dsssb_username');
      if (!savedUser) {
        setShowUsernameModal(true);
      }

      // Automatically register the high-performance Service Worker for offline capability & PWA Builder compliance
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('[PWA] ServiceWorker registered successfully with scope:', registration.scope);
          }).catch((err) => {
            console.warn('[PWA] ServiceWorker registration failed:', err);
          });
        });
      }

      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            if (name !== 'dsssb-quiz-cache-v1' && !name.includes('dsssbpyq')) {
              caches.delete(name);
            }
          }
        }).catch(() => {});
      }
    } catch (e) {
      console.warn("Error checking username modal or resetting metrics", e);
    }
  }, []);

  // Track Web Analytics Page Views on view navigation
  useEffect(() => {
    trackPageView(`DSSSB - ${activeView.toUpperCase()}`, `/${activeView}`);
  }, [activeView]);

  // Robust utility to prevent crashes when serializing local storage data (such as accidental DOM click events or React internals)
  const safeStringify = (val: any): string => {
    const isDomOrFiber = (obj: any): boolean => {
      if (!obj || typeof obj !== 'object') return false;
      try {
        if (
          obj.nodeType !== undefined ||
          obj.tagName !== undefined ||
          obj.ownerDocument !== undefined ||
          (typeof HTMLElement !== 'undefined' && obj instanceof HTMLElement) ||
          (typeof window !== 'undefined' && obj === window) ||
          obj.$$typeof ||
          obj._owner ||
          obj.stateNode ||
          (obj.constructor?.name && (
            obj.constructor.name.includes('Element') ||
            obj.constructor.name.includes('HTML') ||
            obj.constructor.name.includes('Node') ||
            obj.constructor.name.includes('Fiber') ||
            obj.constructor.name.includes('Synthetic') ||
            obj.constructor.name.includes('Event')
          ))
        ) {
          return true;
        }
      } catch (_e) {
        return true;
      }
      return false;
    };

    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key: string, value: any) => {
        if (typeof value === "object" && value !== null) {
          if (isDomOrFiber(value)) return undefined;
          if (
            typeof key === 'string' &&
            (key.startsWith('__react') || key.startsWith('__v') || key === 'stateNode' || key === 'nativeEvent' || key === 'target' || key === 'currentTarget')
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

    try {
      if (isDomOrFiber(val)) return Array.isArray(val) ? "[]" : "{}";
      return JSON.stringify(val, getCircularReplacer());
    } catch (_err: any) {
      return Array.isArray(val) ? "[]" : "{}";
    }
  };



  const QUIZ_CACHE_NAME = 'dsssb-quiz-cache-v2';

  // Helper to load complete quiz questions on-demand with Cache API & dynamic import, keeping list memory lightweight
  const loadFullQuizData = async (quiz: Quiz): Promise<Quiz> => {
    setIsLoadingQuiz(true);
    try {
      const activeQuizData = await loadActiveQuizQuestions(quiz);
      return activeQuizData;
    } catch (err: any) {
      console.error("Failed to load full quiz:", err);
      alert("Error loading quiz questions: " + (err?.message || "Please check your internet connection."));
      throw err;
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Auto-fetch local static mock tests metadata from /content/quizzes-metadata.json with Cache API & localStorage override support
  useEffect(() => {
    const fetchLocalContentQuizzes = async () => {
      try {
        const formattedQuizzes = await fetchQuizzesMetadata();

        if (formattedQuizzes && formattedQuizzes.length > 0) {
          setStaticQuizzes(formattedQuizzes);
          
          // Clean up customQuizzes so that any fetched server static quizzes are NOT duplicated/stale in customQuizzes
          setCustomQuizzes(prev => {
            const cleaned = prev.filter(q => !formattedQuizzes.some(fq => fq.testId === q.testId));
            try {
              localStorage.setItem('dsssb_custom_quizzes', safeStringify(cleaned));
            } catch (_) {}
            return cleaned;
          });
        }
      } catch (e) {
        console.warn("Error syncing static server mock tests metadata", e);
      }
    };

    fetchLocalContentQuizzes();
  }, []);

  // Parse URL query parameter ?testId=... to automatically open mock tests in a new tab/window
  useEffect(() => {
    let active = true;
    const handleUrlLaunch = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const testIdParam = params.get('testId');
        if (!testIdParam) return;

        const isBuiltin = staticQuizzes.some(mq => mq.testId === testIdParam);
        const isSpecial = testIdParam.startsWith('booster_') || testIdParam === 'recovery_mistakes_vault';
        let isCustom = false;
        try {
          const customs = localStorage.getItem('dsssb_custom_quizzes');
          if (customs) {
            const parsedCustoms: Quiz[] = JSON.parse(customs);
            isCustom = parsedCustoms.some(cq => cq.testId === testIdParam);
          }
        } catch (_) {}

        if (isBuiltin || isSpecial || isCustom || staticQuizzes.length > 0) {
          // Find in staticQuizzes
          let foundQuiz = staticQuizzes.find(mq => mq.testId === testIdParam);
          
          // Find in staticQuizzes
          if (!foundQuiz) {
            foundQuiz = staticQuizzes.find(sq => sq.testId === testIdParam);
          }

          // Find in customQuizzes
          if (!foundQuiz) {
            const customs = localStorage.getItem('dsssb_custom_quizzes');
            if (customs) {
              const parsedCustoms: Quiz[] = JSON.parse(customs);
              foundQuiz = parsedCustoms.find(cq => cq.testId === testIdParam);
            }
          }

          // Recreate booster quiz if requested
          if (!foundQuiz && testIdParam.startsWith('booster_')) {
            const topicSlug = testIdParam.replace('booster_', '');
            const slugToTopicName: Record<string, string> = {
              'operating_system': 'Operating System',
              'dbms': 'DBMS',
              'networks': 'Networks',
              'software_engineering': 'Software Engineering',
              'teaching_methodology': 'Teaching Methodology',
              'reasoning': 'Reasoning',
              'quantitative_aptitude': 'Quantitative Aptitude',
              'general_awareness': 'General Awareness',
              'general_english': 'General English',
              'general_hindi': 'General Hindi'
            };
            const topicName = slugToTopicName[topicSlug] || 'Computer Science';
            
            // Collect questions for booster
            const allQuestions: Question[] = [];
            staticQuizzes.forEach(quiz => {
              (quiz.questions || []).forEach(q => {
                const sec = (q.section || '').toLowerCase();
                const text = (q.question || '').toLowerCase();
                const exp = (q.explanation || '').toLowerCase();
                const matchesTopic = 
                  (topicName === 'Operating System' && (sec.includes('operating') || text.includes('process') || text.includes('thread') || text.includes('scheduling') || text.includes('deadlock') || text.includes('semaphore') || text.includes('paging') || exp.includes('belady'))) ||
                  (topicName === 'DBMS' && (sec.includes('dbms') || sec.includes('database') || text.includes('normal form') || text.includes('bcnf') || text.includes('relational algebra') || text.includes('acid') || text.includes('sql') || text.includes('projection') || text.includes('selection'))) ||
                  (topicName === 'Networks' && (sec.includes('network') || text.includes('osi') || text.includes('routing') || text.includes('packet') || text.includes('ip address') || text.includes('dns') || text.includes('layer'))) ||
                  (topicName === 'Software Engineering' && (sec.includes('software') || text.includes('agile') || text.includes('sdlc') || text.includes('testing') || text.includes('model') || text.includes('coupling') || text.includes('cohesion'))) ||
                  (topicName === 'Teaching Methodology' && (sec.includes('teaching') || sec.includes('methodology') || sec.includes('pedagogy') || text.includes('piaget') || text.includes('assessment') || text.includes('tlm') || text.includes('bandura') || text.includes('learning'))) ||
                  (topicName === 'Reasoning' && (sec.includes('reasoning') || sec.includes('intelligence') || text.includes('code language') || text.includes('series') || text.includes('odd one out') || text.includes('point a is') || text.includes('brother of my wife'))) ||
                  (topicName === 'Quantitative Aptitude' && (sec.includes('quant') || sec.includes('arithmetic') || sec.includes('numerical') || text.includes('doubles itself') || text.includes('train running') || text.includes('shopkeeper') || text.includes('average age'))) ||
                  (topicName === 'General Awareness' && (sec.includes('awareness') || text.includes('article') || text.includes('slave dynasty') || text.includes('constitution'))) ||
                  (topicName === 'General English' && (sec.includes('english') || text.includes('synonym') || text.includes('obstinate'))) ||
                  (topicName === 'General Hindi' && (sec.includes('hindi') || text.includes('सूर्योदय') || text.includes('संधि')));

                if (matchesTopic) {
                  if (!allQuestions.some(aq => aq.question === q.question)) {
                    allQuestions.push(q);
                  }
                }
              });
            });

            if (allQuestions.length > 0) {
              const normalizedQuestions = allQuestions.map((q, idx) => ({
                ...q,
                id: idx + 1
              }));
              foundQuiz = {
                testId: testIdParam,
                title: `${topicName} Weakness Booster Test`,
                totalTimeMinutes: Math.max(10, Math.ceil(normalizedQuestions.length * 1.5)),
                category: "part_b",
                markingScheme: { correct: 1, negative: 0.25 },
                questions: normalizedQuestions
              };
            }
          }

          // Recreate mistake vault dynamic recovery test
          if (!foundQuiz && testIdParam === 'recovery_mistakes_vault') {
            const missed = localStorage.getItem('dsssb_missed_questions');
            if (missed) {
              const parsedMissed: Question[] = JSON.parse(missed);
              if (parsedMissed.length > 0) {
                foundQuiz = {
                  testId: "recovery_mistakes_vault",
                  title: "Mistakes Vault Recovery Drill",
                  category: "part_b",
                  totalTimeMinutes: Math.max(5, Math.ceil(parsedMissed.length * 1.5)),
                  markingScheme: { correct: 1, negative: 0.25 },
                  questions: parsedMissed
                };
              }
            }
          }

          if (foundQuiz && active) {
            let fullQuiz = foundQuiz;
            if ((!foundQuiz.questions || foundQuiz.questions.length === 0) && (foundQuiz as any).file) {
              fullQuiz = await loadFullQuizData(foundQuiz);
            }
            if (active) {
              handleStartTestAttempt(fullQuiz, undefined, true);
              
              // Clean up the testId from the URL to avoid double-triggering or loops on state updates
              try {
                const cleanUrl = new URL(window.location.href);
                cleanUrl.searchParams.delete('testId');
                window.history.replaceState({}, '', cleanUrl.toString());
              } catch (_) {}
            }
          }
        }
      } catch (e) {
        console.error("Error launching from query param", e);
      }
    };

    handleUrlLaunch();
    return () => {
      active = false;
    };
  }, [customQuizzes, staticQuizzes]);

  // Helper: Persist attempts
  const saveAttempt = (newAttempt: Attempt) => {
    const updated = [newAttempt, ...pastAttempts];
    setPastAttempts(updated);
    localStorage.setItem('dsssb_attempts', safeStringify(updated));

    // Explicitly update completed test IDs and scores
    const completedIds = Array.from(new Set(updated.map(a => a.testId)));
    localStorage.setItem('dsssb_completed_test_ids', safeStringify(completedIds));

    const scoresMap = updated.reduce((acc, a) => {
      if (!acc[a.testId] || a.score > acc[a.testId]) {
        acc[a.testId] = a.score;
      }
      return acc;
    }, {} as Record<string, number>);
    localStorage.setItem('dsssb_completed_test_scores', safeStringify(scoresMap));
  };

  // Helper: Toggle bookmark
  const toggleBookmark = (q: Question, quizId: string, quizTitle: string) => {
    if (!q || !q.id) {
      console.warn("Attempted to toggle bookmark with invalid question object:", typeof q);
      return;
    }
    let updated: Bookmark[] = [];
    const exists = savedBookmarks.some(b => b && b.question && b.quizId === quizId && b.question.id === q.id);
    
    if (exists) {
      updated = savedBookmarks.filter(b => b && b.question && !(b.quizId === quizId && b.question.id === q.id));
    } else {
      updated = [...savedBookmarks, { quizId, quizTitle, question: q }];
    }
    
    setSavedBookmarks(updated);
    localStorage.setItem('dsssb_bookmarks', safeStringify(updated));

    // Save list of bookmarked question IDs
    const bookmarkedIds = updated.filter(b => b && b.question).map(b => `${b.quizId}_q_${b.question.id}`);
    localStorage.setItem('dsssb_bookmarked_question_ids', safeStringify(bookmarkedIds));
  };

  // Question Report & Admin Handlers
  const handleReportQuestion = (reportRecord: ReportedQuestionRecord) => {
    if (!reportRecord || !reportRecord.question) return;
    setReportedQuestions(prev => {
      const updated = [reportRecord, ...prev.filter(r => r && r.id !== reportRecord.id)];
      try {
        localStorage.setItem('dsssb_reported_questions', safeStringify(updated));
      } catch (_) {}
      return updated;
    });

    const reportedKey = reportRecord.quizId 
      ? `${reportRecord.quizId}_q_${reportRecord.questionId}` 
      : String(reportRecord.questionId);

    setReportedQuestionIds(prev => {
      if (prev.includes(reportedKey)) return prev;
      const updated = [...prev, reportedKey];
      try {
        localStorage.setItem('dsssb_reported_question_ids', safeStringify(updated));
      } catch (_) {}
      return updated;
    });

    // Automatically add question to missedQuestions (Wrong / Reported questions)
    setMissedQuestions(prev => {
      if (prev.some(m => m && m.id === reportRecord.question.id)) return prev;
      const updated = [...prev, reportRecord.question];
      try {
        localStorage.setItem('dsssb_missed_questions', safeStringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const handleDeleteQuestion = (questionId: string | number, testId?: string) => {
    const keyToDelete = (typeof questionId === 'string' && questionId.includes('_q_'))
      ? questionId
      : testId
        ? `${testId}_q_${questionId}`
        : String(questionId);

    setDeletedQuestionIds(prev => {
      if (prev.includes(keyToDelete)) return prev;
      const updated = [...prev, keyToDelete];
      try {
        localStorage.setItem('dsssb_deleted_question_ids', safeStringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const handleDismissReport = (reportId: string) => {
    setReportedQuestions(prev => {
      const updated = prev.filter(r => r.id !== reportId);
      try {
        localStorage.setItem('dsssb_reported_questions', safeStringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const handleClearAllReported = () => {
    setReportedQuestions([]);
    setReportedQuestionIds([]);
    try {
      localStorage.removeItem('dsssb_reported_questions');
      localStorage.removeItem('dsssb_reported_question_ids');
    } catch (_) {}
  };

  const handleRestoreQuestion = (questionId: string | number, testId?: string) => {
    const keyToRestore = (typeof questionId === 'string' && questionId.includes('_q_'))
      ? questionId
      : testId
        ? `${testId}_q_${questionId}`
        : String(questionId);

    setDeletedQuestionIds(prev => {
      const updated = prev.filter(id => id !== keyToRestore && id !== questionId && id !== String(questionId));
      try {
        localStorage.setItem('dsssb_deleted_question_ids', safeStringify(updated));
      } catch (_) {}
      return updated;
    });

    setReportedQuestionIds(prev => {
      const updated = prev.filter(id => id !== keyToRestore && id !== questionId && id !== String(questionId));
      try {
        localStorage.setItem('dsssb_reported_question_ids', safeStringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const handleUpdateQuestion = (updatedQ: Question, quizId: string) => {
    if (!updatedQ) return;
    setStaticQuizzes(prev => prev.map(quiz => {
      if (!quiz) return quiz;
      if (quiz.testId === quizId || (quiz.questions || []).some(q => q && q.id === updatedQ.id)) {
        return {
          ...quiz,
          questions: (quiz.questions || []).map(q => q && q.id === updatedQ.id ? updatedQ : q)
        };
      }
      return quiz;
    }));
  };

  // Helper: Save missed questions to Mistake Vault
  const recordMissedQuestions = (questions: Question[], answers: Record<number, number>) => {
    const newMissed = [...missedQuestions].filter(Boolean);
    (questions || []).forEach(q => {
      if (!q || q.id === undefined) return;
      const userAns = answers[q.id];
      const isIncorrect = userAns !== undefined && userAns !== q.answer;
      
      if (isIncorrect) {
        // Prevent duplicate questions in mistake vault
        const exists = newMissed.some(m => m && m.id === q.id && m.question === q.question);
        if (!exists) {
          newMissed.push(q);
        }
      } else if (userAns === q.answer) {
        // If they get it correct later, remove it from mistake vault
        const idx = newMissed.findIndex(m => m && m.id === q.id && m.question === q.question);
        if (idx !== -1) {
          newMissed.splice(idx, 1);
        }
      }
    });

    setMissedQuestions(newMissed);
    localStorage.setItem('dsssb_missed_questions', safeStringify(newMissed));

    // Save incorrect question IDs explicitly
    const incorrectKeys = newMissed.map(mq => mq?.id).filter(Boolean);
    localStorage.setItem('dsssb_incorrect_question_ids', safeStringify(incorrectKeys));
  };

  // Clear past history logs
  const handleClearHistory = () => {
    setShowClearHistoryModal(true);
  };

  const executeClearHistory = () => {
    setPastAttempts([]);
    try {
      localStorage.removeItem('dsssb_attempts');
      localStorage.removeItem('dsssb_completed_test_ids');
      localStorage.removeItem('dsssb_completed_test_scores');
    } catch (_) {}
    setShowClearHistoryModal(false);
  };

  // Start test flow - checks if unlock schedule applies
  const handleStartTestAttempt = async (quiz: Quiz, testIndex?: number, bypassLock = false) => {
    // Determine test position index in list
    let resolvedIndex = testIndex;
    if (resolvedIndex === undefined) {
      const numMatch = quiz.title?.match(/(?:mock|test|paper|cbt|part)\s*#?\s*(\d+)/i) || quiz.title?.match(/(\d+)/);
      if (numMatch && numMatch[1]) {
        resolvedIndex = Math.max(0, parseInt(numMatch[1], 10) - 1);
      } else {
        resolvedIndex = 0;
      }
    }

    const isDailyOrBooster = quiz.testId?.startsWith('daily_quiz_') || quiz.testId?.startsWith('booster_') || quiz.subject === 'Daily Quiz' || quiz.topic === 'Daily Challenge';

    if (activeQuizSession && activeQuizSession.quiz.testId !== quiz.testId) {
      setPendingStartQuiz(quiz);
      return;
    }

    let fullQuiz = quiz;
    if ((!quiz.questions || quiz.questions.length === 0) && (quiz as any).file) {
      try {
        fullQuiz = await loadFullQuizData(quiz);
      } catch (err) {
        return; // load error handled in loadFullQuizData
      }
    }

    proceedWithQuizLaunch(fullQuiz);
  };

  const proceedWithQuizLaunch = (quiz: Quiz) => {
    launchQuizWorkspace(quiz);
  };

  const launchQuizWorkspace = (quiz: Quiz) => {
    trackQuizStart(quiz.testId, quiz.title, quiz.category);
    
    try {
      localStorage.removeItem('dsssb_active_quiz_session');
    } catch (_) {}

    const freshSession: ActiveQuizSession = {
      quiz,
      mode: 'exam',
      durationMinutes: quiz.totalTimeMinutes,
      currentIdx: 0,
      userAnswers: {},
      visitedQuestions: { [(quiz.questions && quiz.questions[0]) ? quiz.questions[0].id : 0]: true },
      localBookmarks: {},
      secondsLeft: quiz.totalTimeMinutes * 60,
      activeSectionIdx: 0,
      submittedSections: {},
      lastUpdated: Date.now()
    };

    try {
      localStorage.setItem('dsssb_active_quiz_session', safeStringify(freshSession));
      setActiveQuizSession(freshSession);
    } catch (_) {}

    setSelectedQuiz(quiz);
    setCurrentAnswers({});
    setTimeSpentSeconds(0);
    setLocalBookmarks({});
    setActiveView('quiz');
  };

  // Handle active test submission (triggers 3s analyzing performance page)
  const handleQuizSubmit = (
    answers: Record<number, number>, 
    timeSpent: number, 
    bookmarks: Record<number, boolean>,
    qTimeSpent?: Record<number, number>
  ) => {
    if (!selectedQuiz) return;

    try {
      localStorage.removeItem('dsssb_active_quiz_session');
    } catch (_) {}
    setActiveQuizSession(null);

    setCurrentAnswers(answers);
    setTimeSpentSeconds(timeSpent);
    if (qTimeSpent) {
      setCurrentQuestionTimeSpent(qTimeSpent);
    }
    setActiveView('analyzing');
    setAnalyzingProgress(0);

    // Animate analysis loading state
    const interval = setInterval(() => {
      setAnalyzingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Complete and log final attempts in local state
          let corrects = 0;
          let incorrects = 0;
          let unattempted = 0;

          const qList = selectedQuiz.questions || [];
          qList.forEach(q => {
            const ans = answers[q.id];
            if (ans === undefined) {
              unattempted++;
            } else if (ans === q.answer) {
              corrects++;
            } else {
              incorrects++;
            }
          });

          const rawScore = corrects - (incorrects * 0.25);
          const scoreValue = parseFloat(rawScore.toFixed(2));
          const accValue = (qList.length - unattempted) > 0
            ? Math.round((corrects / (qList.length - unattempted)) * 100)
            : 0;

          const attemptRecord: Attempt = {
            id: 'attempt_' + Date.now(),
            testId: selectedQuiz.testId,
            testTitle: selectedQuiz.title,
            score: scoreValue,
            correctCount: corrects,
            incorrectCount: incorrects,
            unattemptedCount: unattempted,
            accuracy: accValue,
            timeSpentSeconds: timeSpent,
            timestamp: new Date().toISOString(),
            mode: 'exam'
          };

          saveAttempt(attemptRecord);
          recordMissedQuestions(qList, answers);

          // Update question performance records
          const updatedPerf = { ...questionPerformance };
          qList.forEach(q => {
            const ans = answers[q.id];
            const qKey = `${selectedQuiz.testId}_q_${q.id}`;
            if (ans === undefined) {
              updatedPerf[qKey] = 'unattempted';
            } else if (ans === q.answer) {
              updatedPerf[qKey] = 'correct';
            } else {
              updatedPerf[qKey] = 'incorrect';
            }
          });
          setQuestionPerformance(updatedPerf);
          localStorage.setItem('dsssb_question_performance', safeStringify(updatedPerf));

          if (selectedQuiz.testId.startsWith('daily_quiz_')) {
            localStorage.setItem(`dsssb_daily_quiz_attempted_${getTodayDateString()}`, 'true');
          }

          setActiveView('result');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Generate dynamic mistake vault test
  const handleStartMistakesVaultTest = () => {
    if (missedQuestions.length === 0) return;
    const url = `${window.location.origin}/?tab=mistakes&testId=recovery_mistakes_vault`;
    window.open(url, '_blank');
  };

  // Match quiz topics flexibly for Part B CS filter checks
  const matchQuizTopic = (quiz: Quiz, selectedTopic: string): boolean => {
    if (selectedTopic === 'All Topics') return true;
    
    // Exact topic match
    if (quiz.topic === selectedTopic) return true;

    // Fuzzy matching for similar topics or aliases
    const quizTopicLower = (quiz.topic || '').toLowerCase();
    const quizTitleLower = (quiz.title || '').toLowerCase();
    const quizFileLower = ((quiz as any).file || '').toLowerCase();
    const selectedTopicLower = selectedTopic.toLowerCase();

    if (
      (quizTopicLower && (quizTopicLower.includes(selectedTopicLower) || selectedTopicLower.includes(quizTopicLower))) ||
      (quizTitleLower && quizTitleLower.includes(selectedTopicLower)) ||
      (quizFileLower && quizFileLower.includes(selectedTopicLower))
    ) {
      return true;
    }

    // Specific aliases mapping
    if (selectedTopic === 'Mathematics - I, II, III, IV' && (quizTopicLower.includes('mathematics') || quizTopicLower.includes('numerical techniques') || quizTopicLower.includes('discrete structure'))) return true;
    if (selectedTopic === 'Operating Systems' && (quizTopicLower.includes('operating system') || quizTopicLower.includes('os') || quizTitleLower.includes('os mock') || quizFileLower.includes('os_mock'))) return true;
    if (selectedTopic === 'Database Management System (DBMS)' && (quizTopicLower.includes('dbms') || quizTopicLower.includes('database') || quizTitleLower.includes('dbms'))) return true;
    if (selectedTopic === 'Computer Networks' && (quizTopicLower.includes('network') || quizTopicLower.includes('networks') || quizTopicLower.includes('protocol') || quizTopicLower.includes('cn') || quizTitleLower.includes('network') || quizFileLower.includes('network') || quizFileLower.includes('/cn/'))) return true;
    if (selectedTopic === 'Software Engineering' && quizTopicLower.includes('software engineering')) return true;
    if (selectedTopic === 'Programming in C, C++ & Data Structures' && (quizTopicLower.includes('data structure') || quizTopicLower.includes('programming in c') || quizTopicLower.includes('c++') || quizTopicLower.includes('data structures'))) return true;
    if (selectedTopic === 'Fundamentals of Information Technology' && (quizTopicLower.includes('information technology') || quizTopicLower.includes('computer basics') || quizTopicLower.includes('basics of computer') || quizTopicLower.includes('computer fundamentals') || quizTopicLower.includes('it fundamental'))) return true;
    if (selectedTopic === 'E-Commerce' && quizTopicLower.includes('e-commerce')) return true;
    if (selectedTopic === 'Design and Analysis of Algorithms (DAA)' && (quizTopicLower.includes('algorithm') || quizTopicLower.includes('algorithms') || quizTopicLower.includes('daa'))) return true;
    if (selectedTopic === 'Digital Electronics' && (quizTopicLower.includes('digital electronics') || quizTopicLower.includes('digital system') || quizTopicLower.includes('logic design'))) return true;
    if (selectedTopic === 'Computer Architecture' && (quizTopicLower.includes('architecture') || quizTopicLower.includes('computer organization') || quizTopicLower.includes('coo') || quizTopicLower.includes('coa'))) return true;
    if (selectedTopic === 'Internet Programming' && (quizTopicLower.includes('internet') || quizTopicLower.includes('web design') || quizTopicLower.includes('html') || quizTopicLower.includes('css'))) return true;
    if (selectedTopic === 'Java Programming and Website Design' && (quizTopicLower.includes('java') || quizTopicLower.includes('oop'))) return true;
    if (selectedTopic === '.NET Programming' && quizTopicLower.includes('.net')) return true;
    if (selectedTopic === 'Linux Environment' && (quizTopicLower.includes('linux') || quizTopicLower.includes('unix'))) return true;
    if (selectedTopic === 'Computer Graphics & Multimedia Applications' && (quizTopicLower.includes('graphics') || quizTopicLower.includes('multimedia'))) return true;
    if (selectedTopic === 'Mobile Computing' && (quizTopicLower.includes('mobile') || quizTopicLower.includes('wireless'))) return true;
    if (selectedTopic === 'Computer Network Security' && (quizTopicLower.includes('security') || quizTopicLower.includes('cryptography'))) return true;
    if (selectedTopic === 'Management Information System (MIS)' && quizTopicLower.includes('mis')) return true;
    if (selectedTopic === 'Business Economics' && quizTopicLower.includes('economics')) return true;
    if (selectedTopic === 'Business Communication, Organization & Management' && (quizTopicLower.includes('communication') || quizTopicLower.includes('management') || quizTopicLower.includes('organization'))) return true;

    return false;
  };

  // Helper to resolve the exact topic of a question
  const getQuestionTopic = (question: Question, quiz: Quiz): string => {
    if (quiz.topic) {
      if (quiz.topic === 'Operating System') return 'Operating System';
      if (quiz.topic === 'DBMS') return 'DBMS';
      if (quiz.topic === 'Networks') return 'Networks';
      if (quiz.topic === 'Software Engineering') return 'Software Engineering';
      if (quiz.topic === 'Teaching Methodology') return 'Teaching Methodology';
    }
    if (quiz.subject) {
      return quiz.subject;
    }
    
    const sec = (question.section || '').toLowerCase();
    const text = (question.question || '').toLowerCase();

    if (sec.includes('reasoning') || text.includes('code language') || text.includes('shortest distance')) {
      return 'Reasoning';
    }
    if (sec.includes('arithmetical') || sec.includes('numerical') || sec.includes('quant') || text.includes('simple interest') || text.includes('speed') || text.includes('average')) {
      return 'Quantitative Aptitude';
    }
    if (sec.includes('awareness') || text.includes('constitution') || text.includes('article') || text.includes('dynasty')) {
      return 'General Awareness';
    }
    if (sec.includes('english') || text.includes('synonym') || text.includes('antonym')) {
      return 'General English';
    }
    if (sec.includes('hindi') || text.includes('सूर्योदय') || text.includes('संधि')) {
      return 'General Hindi';
    }
    if (sec.includes('teaching') || sec.includes('methodology') || text.includes('piaget') || text.includes('learning theory') || text.includes('tlm')) {
      return 'Teaching Methodology';
    }

    if (text.includes('page replacement') || text.includes('semaphore') || text.includes('deadlock') || text.includes('thrashing') || text.includes('scheduling') || text.includes('operating system') || text.includes('fifo') || text.includes('lru')) {
      return 'Operating System';
    }
    if (text.includes('database') || text.includes('normal form') || text.includes('bcnf') || text.includes('relational algebra') || text.includes('acid') || text.includes('sql') || text.includes('projection') || text.includes('selection')) {
      return 'DBMS';
    }
    if (text.includes('network') || text.includes('osi') || text.includes('routing') || text.includes('packet') || text.includes('ip address') || text.includes('dns') || text.includes('layer')) {
      return 'Networks';
    }
    if (text.includes('tree') || text.includes('complexity') || text.includes('search') || text.includes('nodes') || text.includes('algorithm') || text.includes('data structure')) {
      return 'Software Engineering';
    }

    return 'Computer Science';
  };

  // Helper to aggregate stats for each topic
  const getTopicPerformanceStats = () => {
    const topics = [
      'Operating System',
      'DBMS',
      'Networks',
      'Software Engineering',
      'Teaching Methodology',
      'Reasoning',
      'Quantitative Aptitude',
      'General Awareness',
      'General English',
      'General Hindi',
      'Computer'
    ];

    const stats: Record<string, { correct: number; incorrect: number; unattempted: number; total: number }> = {};
    topics.forEach(t => {
      stats[t] = { correct: 0, incorrect: 0, unattempted: 0, total: 0 };
    });

    const allQuizzes = [...staticQuizzes, ...customQuizzes];

    allQuizzes.forEach(quiz => {
      const hasAttemptedQuiz = pastAttempts.some(a => a.testId === quiz.testId);

      (quiz.questions || []).forEach(q => {
        const topic = getQuestionTopic(q, quiz);
        if (!stats[topic]) {
          stats[topic] = { correct: 0, incorrect: 0, unattempted: 0, total: 0 };
        }

        stats[topic].total++;

        const qKey = `${quiz.testId}_q_${q.id}`;
        let status: 'correct' | 'incorrect' | 'unattempted' | 'none' = 'none';

        if (questionPerformance[qKey]) {
          status = questionPerformance[qKey];
        } else if (hasAttemptedQuiz) {
          const isMissed = missedQuestions.some(mq => mq.question === q.question);
          if (isMissed) {
            status = 'incorrect';
          } else {
            status = 'correct';
          }
        }

        if (status === 'correct') {
          stats[topic].correct++;
        } else if (status === 'incorrect') {
          stats[topic].incorrect++;
        } else if (status === 'unattempted') {
          stats[topic].unattempted++;
        }
      });
    });

    return stats;
  };

  // Helper to dynamically build booster quiz
  const handleStartBoosterTest = (topicName: string) => {
    const allQuestions: Question[] = [];
    const allQuizzes = [...staticQuizzes, ...customQuizzes];
    
    allQuizzes.forEach(quiz => {
      (quiz.questions || []).forEach(q => {
        if (getQuestionTopic(q, quiz) === topicName) {
          if (!allQuestions.some(aq => aq.question === q.question)) {
            allQuestions.push(q);
          }
        }
      });
    });

    if (allQuestions.length === 0) {
      alert(`No active questions found for topic ${topicName} in the database yet.`);
      return;
    }

    const boosterSlug = topicName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const url = `${window.location.origin}/?tab=booster&testId=booster_${boosterSlug}`;
    window.open(url, '_blank');
  };

  const handleStartBoosterTestDirect = async (topicName: string) => {
    setIsLoadingQuiz(true);
    try {
      const allQuestions: Question[] = [];
      const allQuizzes = [...staticQuizzes, ...customQuizzes];

      // First check if any loaded quiz in memory has questions for this topic
      allQuizzes.forEach(quiz => {
        (quiz.questions || []).forEach(q => {
          if (getQuestionTopic(q, quiz) === topicName) {
            if (!allQuestions.some(aq => aq.question === q.question)) {
              allQuestions.push(q);
            }
          }
        });
      });

      // If not enough questions loaded in memory yet, dynamically load matching candidate quizzes
      if (allQuestions.length < 5) {
        const matchingQuizzes = allQuizzes.filter(q =>
          (q.topic || '').toLowerCase().includes(topicName.toLowerCase()) ||
          (q.subject || '').toLowerCase().includes(topicName.toLowerCase()) ||
          (q.title || '').toLowerCase().includes(topicName.toLowerCase())
        );

        const quizzesToScan = matchingQuizzes.length > 0 ? matchingQuizzes.slice(0, 10) : allQuizzes.slice(0, 5);

        for (const quiz of quizzesToScan) {
          try {
            const fullQuiz = await loadActiveQuizQuestions(quiz);
            if (fullQuiz && fullQuiz.questions) {
              fullQuiz.questions.forEach(q => {
                if (getQuestionTopic(q, fullQuiz) === topicName || matchingQuizzes.includes(quiz)) {
                  if (!allQuestions.some(aq => aq.question === q.question)) {
                    allQuestions.push(q);
                  }
                }
              });
            }
          } catch (_) {}
        }
      }

      if (allQuestions.length === 0) {
        alert(`Booster questions for "${topicName}" are loading. Please try again in a moment.`);
        return;
      }

      const boosterSlug = topicName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const boosterQuiz: Quiz = {
        testId: `booster_${boosterSlug}`,
        title: `${topicName} Weakness Booster Test`,
        totalTimeMinutes: Math.max(10, Math.ceil(allQuestions.slice(0, 25).length * 1.5)),
        category: "part_b",
        markingScheme: { correct: 1, negative: 0.25 },
        questions: allQuestions.slice(0, 25).map((q, idx) => ({ ...q, id: idx + 1 })),
        qCount: Math.min(allQuestions.length, 25)
      };

      handleStartTestAttempt(boosterQuiz);
    } catch (err) {
      console.error("Error starting booster test:", err);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const isQuestionActiveForQuiz = (
    q: Question,
    testId: string,
    repIds: (string | number)[],
    delIds: (string | number)[]
  ): boolean => {
    if (!q) return false;
    const compositeKey = `${testId}_q_${q.id}`;
    if ((delIds as (string | number)[]).includes(compositeKey)) return false;
    if ((repIds as (string | number)[]).includes(compositeKey)) return false;

    const qIdStr = String(q.id);
    if (qIdStr.includes('_q_')) {
      if ((delIds as (string | number)[]).includes(qIdStr) || (repIds as (string | number)[]).includes(qIdStr)) return false;
    }
    return true;
  };

  const filterQuizQuestions = (
    quiz: Quiz,
    repIds: (string | number)[],
    delIds: (string | number)[]
  ): Quiz => {
    if (!quiz) return quiz;
    const activeQuestions = (quiz.questions || []).filter(q => 
      isQuestionActiveForQuiz(q, quiz.testId, repIds, delIds)
    );
    return {
      ...quiz,
      questions: activeQuestions
    };
  };

  // Unique helper for combining quizzes without duplicates by testId, filtering deleted/reported questions per specific mock
  const combinedQuizzesMap = new Map<string, Quiz>();
  [...staticQuizzes, ...customQuizzes].forEach(q => {
    if (q && q.testId && !combinedQuizzesMap.has(q.testId)) {
      const filteredQ = filterQuizQuestions(q, reportedQuestionIds, deletedQuestionIds);
      combinedQuizzesMap.set(q.testId, filteredQ);
    }
  });
  const allCombinedQuizzes = Array.from(combinedQuizzesMap.values()).sort((a, b) => {
    return (a.title || '').localeCompare(b.title || '', undefined, { numeric: true, sensitivity: 'base' });
  });

  // Helper to determine if a quiz is free (All tests are 100% free and unlocked)
  const isQuizFree = (_quiz: Quiz) => true;

  const getSubjectMockCount = (sub: string): number => {
    if (sub === 'All Subjects') {
      return allCombinedQuizzes.filter(q => q.category === 'part_a' && q.testType !== 'pyp').length;
    }
    const isReasoningMatch = sub === 'Reasoning';
    return allCombinedQuizzes.filter(q => {
      if (q.category !== 'part_a' || q.testType === 'pyp') return false;
      if (isReasoningMatch) {
        return q.subject === 'General Intelligence & Reasoning' || q.subject === 'Reasoning' || q.subject === 'Reasoning Ability';
      }
      return q.subject === sub;
    }).length;
  };

  const partBAllCount = allCombinedQuizzes.filter(q => q.category === 'part_b' && q.testType !== 'pyp').length;
  const partBCSCount = allCombinedQuizzes.filter(q => q.category === 'part_b' && q.testType !== 'pyp' && (q.subject === 'Computer Science' || q.subject === 'TGT CS')).length;
  const partBTeachingCount = allCombinedQuizzes.filter(q => q.category === 'part_b' && q.testType !== 'pyp' && q.subject === 'Teaching Methodology').length;

  const getPartBTopicCount = (topic: string): number => {
    if (topic === 'All Topics') {
      return partBCSCount;
    }
    return allCombinedQuizzes.filter(q => q.category === 'part_b' && q.testType !== 'pyp' && (q.subject === 'Computer Science' || q.subject === 'TGT CS') && matchQuizTopic(q, topic)).length;
  };

  const fullMockFullLengthCount = allCombinedQuizzes.filter(q => {
    if (q.category !== 'full' || q.testType === 'pyp') return false;
    const isPartAMock = q.title.toLowerCase().includes('part a') || q.title.toLowerCase().includes('part-a') || q.isPartA === true;
    return !isPartAMock;
  }).length;

  const fullMockPartACount = allCombinedQuizzes.filter(q => {
    if (q.category !== 'full' || q.testType === 'pyp') return false;
    const isPartAMock = q.title.toLowerCase().includes('part a') || q.title.toLowerCase().includes('part-a') || q.isPartA === true;
    return isPartAMock;
  }).length;

  // Filter lists
  const partAQuizzes = allCombinedQuizzes.filter(q => {
    if (q.testType === 'pyp') return false; // remove any paper from pyp
    if (activePartATab === 'All Subjects') {
      return q.category === 'part_a';
    }
    if (activePartATab === 'Full Mock & PYP') {
      return q.category === 'full';
    }
    const isReasoningMatch = activePartATab === 'Reasoning' && (q.subject === 'General Intelligence & Reasoning' || q.subject === 'Reasoning' || q.subject === 'Reasoning Ability');
    const isMatch = q.subject === activePartATab || isReasoningMatch;
    return q.category === 'part_a' && isMatch;
  });
  const partBQuizzes = allCombinedQuizzes.filter(q => {
    if (q.testType === 'pyp') return false; // remove any paper from pyp
    if (q.category !== 'part_b') return false;
    if (partBSubject === 'All Subjects') {
      return true;
    }
    if (partBSubject === 'TGT CS') {
      const isCS = q.subject === 'Computer Science' || q.subject === 'TGT CS';
      if (partBTopic === 'All Topics') {
        return isCS;
      }
      return isCS && matchQuizTopic(q, partBTopic);
    } else {
      return q.subject === 'Teaching Methodology';
    }
  });
  const fullMockQuizzes = allCombinedQuizzes.filter(q => {
    if (q.testType === 'pyp') return false; // remove any paper from pyp completely
    const lowerTitle = (q.title || '').toLowerCase();
    const isFullCat = q.category === 'full' || lowerTitle.includes('full mock') || lowerTitle.includes('full paper') || lowerTitle.includes('full cbt') || lowerTitle.includes('200 marks') || lowerTitle.includes('full length') || (q.testId && q.testId.startsWith('full_'));
    if (!isFullCat) return false;

    if (fullMockTab === 'mock') {
      const isPartAMock = lowerTitle.includes('part a') || lowerTitle.includes('part-a') || q.isPartA === true;
      if (mockSubTab === 'part_a') {
        return isPartAMock;
      } else if (mockSubTab === 'full') {
        return !isPartAMock;
      }
      return true;
    }
    return true;
  });

  // Category progress stats calculation for dashboard cards
  const attemptedTestIds = new Set(pastAttempts.map(a => a.testId));

  const totalPartAQuizzes = allCombinedQuizzes.filter(q => q.category === 'part_a' && q.testType !== 'pyp');
  const attemptedPartACount = totalPartAQuizzes.filter(q => attemptedTestIds.has(q.testId)).length;
  const partAPct = totalPartAQuizzes.length > 0 ? Math.min(100, Math.round((attemptedPartACount / totalPartAQuizzes.length) * 100)) : 0;

  const totalPartBQuizzes = allCombinedQuizzes.filter(q => q.category === 'part_b' && q.testType !== 'pyp');
  const attemptedPartBCount = totalPartBQuizzes.filter(q => attemptedTestIds.has(q.testId)).length;
  const partBPct = totalPartBQuizzes.length > 0 ? Math.min(100, Math.round((attemptedPartBCount / totalPartBQuizzes.length) * 100)) : 0;

  const totalFullMockQuizzes = allCombinedQuizzes.filter(q => q.category === 'full' && q.testType !== 'pyp');
  const attemptedFullMockCount = totalFullMockQuizzes.filter(q => attemptedTestIds.has(q.testId)).length;
  const fullMockPct = totalFullMockQuizzes.length > 0 ? Math.min(100, Math.round((attemptedFullMockCount / totalFullMockQuizzes.length) * 100)) : 0;

  const todayDateStr = getTodayDateString();
  const hasAttemptedDailyBooster = localStorage.getItem(`dsssb_daily_quiz_attempted_${todayDateStr}`) === 'true';
  const dailyBoosterPct = hasAttemptedDailyBooster ? 100 : 0;

  const stats = getTopicPerformanceStats();
  const attemptedTopics = Object.entries(stats).filter(([topic, s]) => s.correct + s.incorrect > 0);
  
  // Sort by lowest accuracy first, and then by highest incorrect count
  const sortedTopics = [...attemptedTopics].sort((a, b) => {
    const accuracyA = a[1].correct / (a[1].correct + a[1].incorrect);
    const accuracyB = b[1].correct / (b[1].correct + b[1].incorrect);
    if (accuracyA !== accuracyB) {
      return accuracyA - accuracyB; // lowest accuracy first
    }
    return b[1].incorrect - a[1].incorrect; // highest incorrect count first
  });

  const weakestTopic = sortedTopics[0]?.[0];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">

      {/* Premium Web App Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-6 py-4 sticky top-0 z-40 shadow-sm backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" loading="lazy" decoding="async" 
              alt="BytePrep CS Logo" 
              width="40"
              height="40"
              className="w-10 h-10 object-contain shrink-0 filter drop-shadow-xs select-none cursor-pointer"
              onClick={() => setActiveView('dashboard')}
              referrerPolicy="no-referrer"
            />
            <div className="cursor-pointer" onClick={() => setActiveView('dashboard')}>
              <h1 className="text-xl md:text-2xl font-black tracking-wide display-font transition-opacity hover:opacity-95 flex items-center gap-1.5">
                <span className="text-blue-600 dark:text-blue-400 font-black">BytePrep</span>
                <span className="text-amber-500 font-black">:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-black">CS</span>
                <span className="hidden sm:inline-block text-xs font-bold text-slate-400 dark:text-slate-500 ml-1.5 pl-2 border-l border-slate-300 dark:border-slate-700">
                  DSSSB PYQ
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">

            {/* PWA Install Button (Icon Only) */}
            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
                title="Install App"
                aria-label="Install App"
                id="install-app-icon-btn"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <div className="hidden lg:flex items-center gap-2.5 xl:gap-3.5">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`text-xs font-bold transition-colors cursor-pointer ${
                  activeView === 'dashboard' ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('syllabus')}
                className={`text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeView === 'syllabus' ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5 text-amber-500" /> Syllabus
              </button>
              <button
                onClick={() => setActiveView('adaptive-path')}
                className={`text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeView === 'adaptive-path' ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-50 dark:fill-indigo-950/40" /> Analysis
              </button>
              <button
                onClick={() => setActiveView('bookmarks')}
                className={`text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeView === 'bookmarks' ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5" /> Saved ({savedBookmarks.length})
              </button>
            </div>

            {/* Profile & Sync Header Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 px-3 py-1.5 rounded-xl transition-all cursor-pointer group shrink-0"
              title="User Profile & Cross-Device Sync"
              id="user-profile-header-btn"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                {userProfile.username ? userProfile.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {userProfile.username || 'Profile'}
                </div>
                <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                  {userProfile.profileId}
                </div>
              </div>
            </button>
          </div>
        </div>
      </header>



      {/* Main Orchestrator Workspace with Honeycomb Grid Background */}
      <main className={`flex-grow bg-honeycomb ${!['quiz', 'result', 'solution-review'].includes(activeView) ? 'pb-20 md:pb-0' : ''}`}>
        {/* Floating Share Toast Notification */}
        {shareToastMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-bounce">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>{shareToastMessage}</span>
          </div>
        )}
        
        {/* Render Active View Router */}
        <React.Suspense fallback={<LazyViewFallback />}>
        {activeView === 'content' && (
          <ContentHub 
            initialTab={contentSubTab}
            onNavigateToTab={(tab) => {
              setContentSubTab(tab);
            }}
            onOpenSubscribeModal={() => setShowSubscribeModal(true)}
          />
        )}

        {activeView === 'seo-preview' && (
          <SeoPreviewHub />
        )}

        {activeView === 'syllabus' && (
          <SyllabusTracker 
            initialExamSlug={selectedExamSlug}
            onNavigateToView={(view, topicContext) => {
              if (view === 'part-b-view' && topicContext) {
                const topicLower = topicContext.toLowerCase();
                setTgtCsInitialTab('part_b');
                setPartBSubject('TGT CS');
                
                let selectedTopic = 'All Topics';
                if (topicLower.includes('network')) {
                  selectedTopic = 'Computer Networks';
                } else if (topicLower.includes('operating') || topicLower.includes('system') || topicLower.includes('os')) {
                  selectedTopic = 'Operating System';
                } else if (topicLower.includes('dbms') || topicLower.includes('database')) {
                  selectedTopic = 'DBMS';
                } else if (topicLower.includes('software')) {
                  selectedTopic = 'Software Engineering';
                } else if (topicLower.includes('teaching') || topicLower.includes('pedagog')) {
                  selectedTopic = 'Teaching Methodology';
                } else if (topicLower.includes('programming') || topicLower.includes('c++')) {
                  selectedTopic = 'Programming (C/C++/Java/Python)';
                } else if (topicLower.includes('digital') || topicLower.includes('electron')) {
                  selectedTopic = 'Digital Electronics';
                } else if (topicLower.includes('web')) {
                  selectedTopic = 'Web Technologies';
                } else if (topicLower.includes('architecture') || topicLower.includes('coa')) {
                  selectedTopic = 'Computer Architecture';
                }
                
                setTgtCsInitialTopic(selectedTopic);
                setPartBTopic(selectedTopic);
                
                // Route them to the rich TGT CS Hub dashboard view
                setActiveView('tgt-cs-view');
              } else if (view === 'part-a-view' && topicContext) {
                const topicLower = topicContext.toLowerCase();
                setTgtCsInitialTab('part_a');
                
                let selectedPartASubject = 'All Subjects';
                if (topicLower.includes('reasoning') || topicLower.includes('intellig')) {
                  selectedPartASubject = 'General Intelligence & Reasoning';
                } else if (topicLower.includes('awareness') || topicLower.includes('gk') || topicLower.includes('current')) {
                  selectedPartASubject = 'General Awareness';
                } else if (topicLower.includes('quant') || topicLower.includes('math') || topicLower.includes('arith')) {
                  selectedPartASubject = 'Quantitative Aptitude';
                } else if (topicLower.includes('english')) {
                  selectedPartASubject = 'General English';
                } else if (topicLower.includes('hindi')) {
                  selectedPartASubject = 'General Hindi';
                }
                
                setActivePartATab(selectedPartASubject);
                // Route them to the TGT CS Hub dashboard view for Part A
                setActiveView('tgt-cs-view');
              } else {
                setActiveView(view);
              }
            }} 
            onSelectExamSlug={(slug) => {
              setSelectedExamSlug(slug);
            }}
            onShareAchievement={() => setShowAchievementModal(true)}
          />
        )}

        {activeView === 'dashboard' && (
          <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-8 space-y-4 md:space-y-6 animate-fadeIn">
            
            {/* Promotional Banners Grid (Modular Component /src/components/PromoBanners.tsx) */}
            <PromoBanners
              onOpenSubscribeModal={() => setShowSubscribeModal(true)}
              onNavigateToView={(view) => setActiveView(view as any)}
            />

            {/* Minimized 3D Light Welcome Card - MOBILE ONLY (Hidden in Web View) */}
            <div className="block md:hidden bg-gradient-to-r from-indigo-50 via-sky-50 to-amber-50/70 border-2 border-indigo-200/90 rounded-2xl p-3 text-slate-900 shadow-[0_4px_0_0_#c7d2fe] relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="shrink-0">
                    <Glass3dIcon type="target" size="sm" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="text-xs font-black tracking-tight text-indigo-950 truncate">
                        Hi, {username || 'Candidate'}! 👋
                      </h2>
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase shadow-2xs">
                        PRO
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-semibold truncate">
                      DSSSB TGT CS Prep Synced
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setShowAchievementModal(true)}
                    className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-900 border border-amber-300 font-extrabold px-2 py-1.5 rounded-xl text-[10px] shadow-2xs cursor-pointer flex items-center gap-1"
                    title="Share Achievement Card"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Card</span>
                  </button>

                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 active:translate-y-0.5 text-white font-extrabold px-2.5 py-1.5 rounded-xl text-[10px] border border-indigo-500 shadow-[0_2px_0_0_#3730a3] cursor-pointer flex items-center gap-1"
                  >
                    <User className="w-3 h-3 text-amber-300" />
                    <span>Sync</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Attempt Component (Top Stats) - ABOVE SEARCH */}
            <div className="bg-white border-2 border-slate-200/90 dark:bg-slate-900/80 dark:border-slate-800 rounded-xl md:rounded-3xl p-2.5 md:p-6 shadow-sm">
              <div className="grid grid-cols-3 gap-1 md:gap-6 divide-x divide-slate-100 dark:divide-slate-800">
                <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left md:pr-6 px-1">
                  <div className="space-y-0.5">
                    <span className="text-[8px] md:text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Attempts</span>
                    <p className="text-base md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{pastAttempts.length}</p>
                  </div>
                  <div className="hidden md:flex shrink-0">
                    <Glass3dIcon type="books" size="md" />
                  </div>
                </div>

                <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left md:px-6 px-1">
                  <div className="space-y-0.5">
                    <span className="text-[8px] md:text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Avg Score</span>
                    <p className="text-base md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                      {pastAttempts.length > 0 
                        ? (pastAttempts.reduce((sum, a) => sum + a.score, 0) / pastAttempts.length).toFixed(1) 
                        : '--'}
                    </p>
                  </div>
                  <div className="hidden md:flex shrink-0">
                    <Glass3dIcon type="trophy" size="md" />
                  </div>
                </div>

                <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left md:pl-6 px-1">
                  <div className="space-y-0.5">
                    <span className="text-[8px] md:text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Accuracy</span>
                    <p className="text-base md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                      {pastAttempts.length > 0 
                        ? `${(pastAttempts.reduce((sum, a) => sum + a.accuracy, 0) / pastAttempts.length).toFixed(0)}%` 
                        : '--'}
                    </p>
                  </div>
                  <div className="hidden md:flex shrink-0">
                    <Glass3dIcon type="lightning" size="md" />
                  </div>
                </div>
              </div>
            </div>

            {/* Minimalistic Single Search Bar */}
            <div id="dashboard-search-container" className="relative w-full">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="dashboard-search-bar"
                type="text"
                value={dashboardSearchQuery}
                onChange={(e) => setDashboardSearchQuery(e.target.value)}
                placeholder="Search mock tests, syllabus topics (e.g., DBMS, Hindi, Maths, OS, Computer Basics)..."
                className="w-full pl-12 pr-10 py-3.5 bg-white border-2 border-slate-200/90 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
              />
              {dashboardSearchQuery && (
                <button
                  onClick={() => setDashboardSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600 font-bold text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-all"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Part A Mock Sunday Special Banner - Hidden on Mobile View */}
            <div className="hidden sm:block">
              <PartAMockSpecialBanner
                onClick={() => {
                  const partAFullMocks = allCombinedQuizzes.filter(q => 
                    q.subject === 'Part A Full Mock' || 
                    (q.category === 'full' && (q.title.toLowerCase().includes('part a') || q.title.toLowerCase().includes('part-a') || q.isPartA === true))
                  );
                  const selectedPartAMockQuiz = partAFullMocks[0] || allCombinedQuizzes.find(q => q.category === 'full') || allCombinedQuizzes[0];
                  if (selectedPartAMockQuiz) {
                    handleStartTestAttempt(selectedPartAMockQuiz);
                  }
                }}
              />
            </div>

            {/* Daily Challenge Streak Tracker & Daily Booster Quiz - BELOW SEARCH */}
            <DailyStreakTracker 
              onStartDailyBooster={handleStartDailyBoosterQuiz} 
              hasAttemptedToday={hasAttemptedDailyBooster} 
              onShareAchievement={() => setShowAchievementModal(true)}
            />

            {dashboardSearchQuery ? (
              /* Search Results View */
              <div className="space-y-6 md:space-y-8 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm md:text-base font-black text-slate-800 flex items-center gap-2">
                      <Search className="w-5 h-5 text-blue-600 animate-pulse" />
                      Search Results for "{dashboardSearchQuery}"
                    </h3>
                    <p className="text-[11px] md:text-xs text-slate-500 font-medium mt-0.5">
                      Found {matchingQuizzes.length} mock tests and {matchingSyllabusItems.length} matching syllabus topics
                    </p>
                  </div>
                  <button
                    onClick={() => setDashboardSearchQuery('')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all"
                  >
                    Clear Search
                  </button>
                </div>

                {/* Grid container to split or separate results cleanly */}
                <div className="space-y-6 md:space-y-10">
                  {/* Matching Quizzes / Mock Tests */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Matching Practice Tests ({matchingQuizzes.length})
                    </h4>
                    {matchingQuizzes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matchingQuizzes.map((quiz) => (
                          <div 
                            key={quiz.testId}
                            onClick={() => handleStartTestAttempt(quiz)}
                            className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-all shadow-sm group hover:border-blue-500/50"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 tracking-wider inline-block">
                                {quiz.category === 'part_b' ? 'Subjective / Part B' : quiz.category === 'part_a' ? 'General / Part A' : 'Full Length Mock'}
                              </span>
                              <h5 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                {quiz.title}
                              </h5>
                              <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                                <span className="flex items-center gap-1">⏱️ {quiz.totalTimeMinutes} mins</span>
                                <span className="flex items-center gap-1">📋 {quiz.questions?.length || 0} Questions</span>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 font-semibold">
                        No matching mock tests or practice sets found.
                      </div>
                    )}
                  </div>

                  {/* Matching Syllabus Topics */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5" />
                      Matching Syllabus Modules &amp; Topics ({matchingSyllabusItems.length})
                    </h4>
                    {matchingSyllabusItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matchingSyllabusItems.map(({ examTitle, sectionTitle, item }) => (
                          <div 
                            key={item.id}
                            className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-sm transition-all hover:border-indigo-500/30"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 tracking-wider">
                                  {item.code || 'Syllabus Item'}
                                </span>
                                <span className="text-[9px] font-black text-slate-500">
                                  {sectionTitle}
                                </span>
                              </div>
                              <h5 className="font-bold text-sm text-slate-800">
                                {item.title}
                              </h5>
                              {item.description && (
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-[10px] text-slate-500 font-bold">
                                Importance: <strong className={item.importance === 'Core' ? 'text-rose-500' : item.importance === 'High' ? 'text-amber-500' : 'text-slate-500'}>{item.importance || 'Standard'}</strong>
                              </span>
                              <div className="flex gap-2">
                                {item.practiceTab && (
                                  <button
                                    onClick={() => setActiveView(item.practiceTab === 'part-a-view' ? 'common-dsssb-view' : item.practiceTab === 'part-b-view' ? 'tgt-cs-view' : 'dashboard')}
                                    className="text-[10px] font-black text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 transition-all cursor-pointer"
                                  >
                                    View Hub
                                  </button>
                                )}
                                <button
                                  onClick={() => handleStartBoosterTestDirect(item.title.replace(/^\d+\.\s*/, ''))}
                                  className="text-[10px] font-black text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Sparkles className="w-3 h-3 text-indigo-500 group-hover:text-white" /> Practice Topic
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 font-semibold">
                        No matching syllabus topics or subjects found.
                      </div>
                    )}
                  </div>

                  {/* Empty state when absolutely nothing matches */}
                  {matchingQuizzes.length === 0 && matchingSyllabusItems.length === 0 && (
                    <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
                        <Search className="w-6 h-6" />
                      </div>
                      <h5 className="font-bold text-sm text-slate-700">No study material found</h5>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        We couldn't find any mock tests or syllabus topics matching "{dashboardSearchQuery}". Try using simpler search terms like "DBMS", "Hindi", "Maths", "Web", or "Networks".
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Default Dashboard Main Content (When search query is empty) */
              <>
                {activeQuizSession && activeQuizSession.quiz && (
                  <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 border-2 border-amber-500/30 rounded-xl md:rounded-3xl p-3 md:p-6 shadow-sm relative overflow-hidden animate-fadeIn space-y-2 md:space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 relative z-10">
                      <div className="flex items-start gap-2.5 md:gap-3.5">
                        <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
                          <Play className="w-4 h-4 md:w-6 md:h-6 fill-current ml-0.5" />
                        </div>
                        <div className="space-y-0.5 md:space-y-1">
                          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                            <span className="bg-amber-500 text-white font-extrabold text-[9px] md:text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                              ⚡ Active Test in Progress
                            </span>
                            <span className="text-[10px] md:text-[11px] font-medium text-slate-500">
                              Auto-saved
                            </span>
                          </div>
                          <h3 className="text-xs md:text-lg font-black text-slate-900 tracking-tight">
                            {activeQuizSession.quiz.title}
                          </h3>
                          <div className="flex items-center gap-1.5 md:gap-3 text-[11px] md:text-xs font-semibold text-slate-700 flex-wrap">
                            <span className="bg-white/80 px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg border border-amber-200 text-slate-800 font-bold">
                              📝 {Object.keys(activeQuizSession.userAnswers || {}).length} / {activeQuizSession.quiz.questions?.length || 0} Answered
                            </span>
                            <span className="bg-white/80 px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg border border-amber-200 text-amber-900 font-bold">
                              ⏱️ {Math.floor(activeQuizSession.secondsLeft / 60)}m {activeQuizSession.secondsLeft % 60}s Remaining
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                        <button
                          onClick={handleResumeQuiz}
                          className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-black py-2.5 px-4 md:py-3 md:px-6 rounded-xl text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" /> Resume Last Quiz
                        </button>
                        <button
                          onClick={() => setShowDiscardConfirmModal(true)}
                          className="bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold py-2.5 px-3 md:py-3 md:px-4 rounded-xl text-xs border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="Discard this test session"
                        >
                          <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" /> Discard
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dashboard Centered Launcher Cards */}
                <div className="space-y-3 md:space-y-6 w-full">
                  {/* AdSense/AdMob Responsive Banner Slot 1 */}
                  <React.Suspense fallback={null}>
                    <AdBanner location="dashboard_top" />
                  </React.Suspense>

                  <div className="text-center space-y-0.5 pt-2">
                    <h2 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">
                      Select Exam Suite / Practice Section
                    </h2>
                    <p className="text-[11px] md:text-xs text-slate-500">
                      <span className="hidden sm:inline">Click on any exam hub to launch practice tests</span>
                      <span className="sm:hidden">Select a section to launch practice tests</span>
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {/* Main Exam Category 1: Computer Science */}
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.3, delay: 0.04, type: 'spring', stiffness: 200, damping: 20 }}
                      onClick={() => setActiveView('tgt-cs-view')}
                      className="glass-box backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl md:rounded-3xl p-5 md:p-6 text-center flex flex-col items-center justify-center space-y-3 shadow-lg hover:shadow-2xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-b border-l border-indigo-200/60 dark:border-indigo-800/60 text-[9px] md:text-[10px] font-black px-2.5 py-0.5 md:px-3 md:py-1 rounded-bl-xl md:rounded-bl-2xl uppercase tracking-wider">
                        32 CS Modules
                      </div>
                      <div className="pt-2 group-hover:scale-110 transition-transform">
                        <Glass3dIcon type="target" size="lg" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black text-base md:text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          TGT Computer Science
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          32 DOE Topics, PYQs &amp; Tracker
                        </p>
                      </div>
                    </motion.div>

                    {/* Main Exam Category 2: General Ability */}
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.3, delay: 0.08, type: 'spring', stiffness: 200, damping: 20 }}
                      onClick={() => setActiveView('common-dsssb-view')}
                      className="glass-box backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl md:rounded-3xl p-5 md:p-6 text-center flex flex-col items-center justify-center space-y-3 shadow-lg hover:shadow-2xl hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-b border-l border-amber-200/60 dark:border-amber-800/60 text-[9px] md:text-[10px] font-black px-2.5 py-0.5 md:px-3 md:py-1 rounded-bl-xl md:rounded-bl-2xl uppercase tracking-wider">
                        Part A (100 Marks)
                      </div>
                      <div className="pt-2 group-hover:scale-110 transition-transform">
                        <Glass3dIcon type="calculator" size="lg" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black text-base md:text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          General Ability
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Maths, Reasoning, GK &amp; Languages
                        </p>
                      </div>
                    </motion.div>

                    {/* Main Exam Category 3: Teaching Methodology */}
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.3, delay: 0.10, type: 'spring', stiffness: 200, damping: 20 }}
                      onClick={() => setActiveView('teaching-methodology-view')}
                      className="glass-box backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl md:rounded-3xl p-5 md:p-6 text-center flex flex-col items-center justify-center space-y-3 shadow-lg hover:shadow-2xl hover:border-purple-400 dark:hover:border-purple-500 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-purple-500/10 text-purple-700 dark:text-purple-300 border-b border-l border-purple-200/60 dark:border-purple-800/60 text-[9px] md:text-[10px] font-black px-2.5 py-0.5 md:px-3 md:py-1 rounded-bl-xl md:rounded-bl-2xl uppercase tracking-wider">
                        Pedagogy
                      </div>
                      <div className="pt-2 group-hover:scale-110 transition-transform">
                        <Glass3dIcon type="books" size="lg" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black text-base md:text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          Teaching Methodology
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Child Psychology, Pedagogy &amp; NEP
                        </p>
                      </div>
                    </motion.div>

                    {/* Main Exam Category 4: Full-Length CBT Mock Tests */}
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.3, delay: 0.12, type: 'spring', stiffness: 200, damping: 20 }}
                      onClick={() => setActiveView('full-mock-view')}
                      className="glass-box backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl md:rounded-3xl p-5 md:p-6 text-center flex flex-col items-center justify-center space-y-3 shadow-lg hover:shadow-2xl hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-b border-l border-emerald-200/60 dark:border-emerald-800/60 text-[9px] md:text-[10px] font-black px-2.5 py-0.5 md:px-3 md:py-1 rounded-bl-xl md:rounded-bl-2xl uppercase tracking-wider">
                        200 Marks CBT
                      </div>
                      <div className="pt-2 group-hover:scale-110 transition-transform">
                        <Glass3dIcon type="trophy" size="lg" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black text-base md:text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Full Mock CBT Series
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Real 200 Marks Exam CBT Simulation
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* AdSense/AdMob Responsive Banner Slot 2 */}
                  <React.Suspense fallback={null}>
                    <AdBanner location="dashboard_bottom" />
                  </React.Suspense>
                </div>

                {/* Persistent Leaderboard & Local History logs Section */}
                <div className="pt-6 border-t border-slate-200">
                  <Leaderboard 
                    attempts={pastAttempts} 
                    onReattempt={(testId) => {
                      const q = staticQuizzes.find(mq => mq.testId === testId) || staticQuizzes.find(sq => sq.testId === testId) || customQuizzes.find(cq => cq.testId === testId);
                      if (q) handleStartTestAttempt(q);
                    }}
                    onClearHistory={handleClearHistory}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* TGT CS Exam Suite sub-view - Full dedicated page */}
        {activeView === 'tgt-cs-view' && (
          <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-6 md:py-8 space-y-6 md:space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </button>
              <span className="bg-indigo-100 text-indigo-900 border border-indigo-200 text-[10px] font-black px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full uppercase tracking-wider">
                <span className="hidden sm:inline">💻 TGT Computer Science (41/26) Exam Suite</span>
                <span className="sm:hidden">💻 Computer Science</span>
              </span>
            </div>

            <TgtCsHub
              quizzes={allCombinedQuizzes}
              pastAttempts={pastAttempts}
              nowTick={nowTick}
              onStartQuiz={(quiz, index) => handleStartTestAttempt(quiz, index)}
              onLockedQuizClick={(quiz, status) => setLockedQuizModal({ quiz, status })}
              onShareQuiz={(quiz, e) => handleShareMockLink(quiz, e)}
              onOpenSyllabusTracker={() => setActiveView('syllabus')}
              getMockUnlockStatus={getMockUnlockStatus}
              initialActiveTab={tgtCsInitialTab}
              initialCsTopicFilter={tgtCsInitialTopic}
            />
          </div>
        )}

        {/* Common DSSSB Exam Hub sub-view - Full dedicated page */}
        {activeView === 'common-dsssb-view' && (
          <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3 space-y-3 sm:space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </button>
              <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full uppercase tracking-wider">
                <span className="hidden sm:inline">🏛️ Common DSSSB Exam Hub (Part A)</span>
                <span className="sm:hidden">🏛️ General Ability</span>
              </span>
            </div>

            <CommonDsssbHub
              quizzes={allCombinedQuizzes}
              pastAttempts={pastAttempts}
              nowTick={nowTick}
              onStartQuiz={(quiz, index) => handleStartTestAttempt(quiz, index)}
              onLockedQuizClick={(quiz, status) => setLockedQuizModal({ quiz, status })}
              onShareQuiz={(quiz, e) => handleShareMockLink(quiz, e)}
              getMockUnlockStatus={getMockUnlockStatus}
            />
          </div>
        )}

        {/* Teaching Methodology sub-view - Full dedicated page */}
        {activeView === 'teaching-methodology-view' && (
          <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-6 md:py-8 space-y-6 md:space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </button>
              <span className="bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-black px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full uppercase tracking-wider">
                <span className="hidden sm:inline">🎓 Teaching Methodology &amp; Pedagogy</span>
                <span className="sm:hidden">🎓 Teaching Methodology</span>
              </span>
            </div>

            <TeachingMethodologyHub
              quizzes={allCombinedQuizzes}
              pastAttempts={pastAttempts}
              nowTick={nowTick}
              onStartQuiz={(quiz, index) => handleStartTestAttempt(quiz, index)}
              onLockedQuizClick={(quiz, status) => setLockedQuizModal({ quiz, status })}
              onShareQuiz={(quiz, e) => handleShareMockLink(quiz, e)}
              getMockUnlockStatus={getMockUnlockStatus}
            />
          </div>
        )}

        {/* Part A sub-view - Full screen custom practice */}
        {activeView === 'part-a-view' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8 space-y-6 md:space-y-8 animate-fadeIn">
            {/* Header / Back button */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </button>
              <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Part A - Practice
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                General Intelligence &amp; Aptitude
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select a subject option below to practice target previous year questions and topic assessments.
              </p>
            </div>



            {/* Subject Selector Buttons ("select option like earlier" - not dropdown!) */}
            <div className="space-y-3">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Select Subject Option
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'All Subjects',
                  'Quantitative Aptitude',
                  'Reasoning',
                  'General Awareness',
                  'General English',
                  'General Hindi'
                ].map((sub, idx) => (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    key={sub}
                    onClick={() => setActivePartATab(sub)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      activePartATab === sub
                        ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {sub} ({getSubjectMockCount(sub)})
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Practice Quizzes List */}
            <motion.div 
              key={activePartATab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
                Available Practice Mocks ({partAQuizzes.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {partAQuizzes.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-8 text-center max-w-lg mx-auto shadow-sm text-slate-500">More mock tests coming soon.</div>
                ) : (
                  <>
                    {partAQuizzes.slice(0, appVisibleCount).map((quiz, index) => {
                      const unlockStatus = getMockUnlockStatus(index, nowTick);
                      const quizAttempts = pastAttempts.filter(a => a.testId === quiz.testId);
                      const isAttempted = quizAttempts.length > 0;
                      const mockLabel = getMockNumberLabel(quiz, index);
                      const topicBadge = getTopicBadge(quiz);
                      const diffTag = getDifficultyTag(index);
                      return (
                        <div key={quiz.testId} className="bg-white border-2 border-slate-200/90 hover:border-amber-500 rounded-2xl p-4 md:p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-md group relative">
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto scrollbar-none pb-0.5">
                              <span className="bg-amber-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 shadow-2xs">
                                {mockLabel}
                              </span>
                              <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                                📌 {topicBadge}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 border shrink-0 whitespace-nowrap ${diffTag.bg} ${diffTag.text} ${diffTag.border}`}>
                                <span>{diffTag.icon}</span> {diffTag.label}
                              </span>
                              {isAttempted && (
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shrink-0 whitespace-nowrap shadow-2xs">
                                  ✅ Attempted ({quizAttempts.length}x)
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm text-slate-800 leading-snug text-center py-2 border-y border-slate-100 my-1">{quiz.title}</h4>
                          </div>
                          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 w-full shrink-0">
                            <button
                              onClick={(e) => handleShareMockLink(quiz, e)}
                              className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center gap-1 shrink-0"
                              title="Share Direct Link to this Mock Test"
                            >
                              <Share2 className="w-3.5 h-3.5 text-slate-500" /> Share Link
                            </button>
                            {unlockStatus.isUnlocked ? (
                              <button
                                onClick={() => handleStartTestAttempt(quiz, index)}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer bg-amber-600 text-white hover:bg-amber-700 shadow-xs"
                              >
                                {isAttempted ? "Reattempt Test" : "Start Test"}
                              </button>
                            ) : (
                              <button
                                onClick={() => setLockedQuizModal({ quiz, status: unlockStatus })}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer bg-amber-600 text-white hover:bg-amber-700 shadow-xs"
                              >
                                Unlock Test
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {partAQuizzes.length > appVisibleCount && (
                      <div className="pt-4 text-center">
                        <button
                          onClick={() => setAppVisibleCount(prev => prev + 15)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-6 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                        >
                          ⚡ Load More Mock Tests ({partAQuizzes.length - appVisibleCount} remaining)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Part B sub-view - Full screen custom CS practice */}
        {activeView === 'part-b-view' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8 space-y-6 md:space-y-8 animate-fadeIn">
            {/* Header / Back button */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </button>
              <span className="bg-indigo-100 text-indigo-800 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Part B - Practice
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                Core Syllabus &amp; Pedagogy
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Practice highly specific questions mapped with the DSSSB TGT Computer Science official syllabus.
              </p>
            </div>



            {/* Subject Selector Buttons ("select option like earlier" - not dropdown!) */}
            <div className="space-y-3">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Select Part B Subject
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'All Subjects', label: `All Subjects (CS + Pedagogy) (${partBAllCount})` },
                  { value: 'TGT CS', label: `TGT Computer Science (CS) (${partBCSCount})` },
                  { value: 'Teaching Methodology', label: `Teaching Methodology (${partBTeachingCount})` }
                ].map((item, idx) => (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: idx * 0.06 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    key={item.value}
                    onClick={() => setPartBSubject(item.value as any)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      partBSubject === item.value
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* CS Topic Selector Buttons */}
            {partBSubject === 'TGT CS' && (
              <div className="space-y-3 animate-fadeIn">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                   Select Computer Science Topic
                </label>
                <div className="flex flex-wrap gap-2">
                  {['All Topics', ...OFFICIAL_CS_TOPICS_LIST].map((topic, idx) => (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={topic}
                      onClick={() => setPartBTopic(topic)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        partBTopic === topic
                          ? "bg-slate-800 border-slate-800 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {topic} ({getPartBTopicCount(topic)})
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Practice Quizzes List */}
            <motion.div
              key={`${partBSubject}-${partBTopic}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
                Available Practice Mocks ({partBQuizzes.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {partBQuizzes.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-8 text-center max-w-lg mx-auto shadow-sm text-slate-500">More mock tests coming soon.</div>
                ) : (
                  partBQuizzes.slice(0, appVisibleCount).map((quiz, index) => {
                    const unlockStatus = getMockUnlockStatus(index, nowTick);
                    const quizAttempts = pastAttempts.filter(a => a.testId === quiz.testId);
                    const isAttempted = quizAttempts.length > 0;
                    const mockLabel = getMockNumberLabel(quiz, index);
                    const topicBadge = getTopicBadge(quiz);
                    const diffTag = getDifficultyTag(index);
                    return (
                      <div key={quiz.testId} className="bg-white border-2 border-slate-200/90 hover:border-indigo-500 rounded-2xl p-4 md:p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-md group relative">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto scrollbar-none pb-0.5">
                            <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 shadow-2xs">
                              {mockLabel}
                            </span>
                            <span className="bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                              📌 {topicBadge}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 border shrink-0 whitespace-nowrap ${diffTag.bg} ${diffTag.text} ${diffTag.border}`}>
                              <span>{diffTag.icon}</span> {diffTag.label}
                            </span>
                            {isAttempted && (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shrink-0 whitespace-nowrap shadow-2xs">
                                ✅ Attempted ({quizAttempts.length}x)
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-slate-800 leading-snug text-center py-2 border-y border-slate-100 my-1">{quiz.title}</h4>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={(e) => handleShareMockLink(quiz, e)}
                            className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center gap-1 shrink-0"
                            title="Share Direct Link to this Mock Test"
                          >
                            <Share2 className="w-3.5 h-3.5 text-slate-500" /> Share Link
                          </button>
                          {unlockStatus.isUnlocked ? (
                            <button
                              onClick={() => handleStartTestAttempt(quiz, index)}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                            >
                              {isAttempted ? "Reattempt Test" : "Start Test"}
                            </button>
                          ) : (
                            <button
                              onClick={() => setLockedQuizModal({ quiz, status: unlockStatus })}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                            >
                              Unlock Test
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {partBQuizzes.length > appVisibleCount && (
                  <div className="pt-4 text-center">
                    <button
                      onClick={() => setAppVisibleCount(prev => prev + 15)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-6 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                    >
                      ⚡ Load More Mock Tests ({partBQuizzes.length - appVisibleCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Full-Length simulation sub-view */}
        {activeView === 'full-mock-view' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8 space-y-6 md:space-y-8 animate-fadeIn">
            {/* Header / Back button */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </button>
              <span className="bg-blue-100 text-blue-800 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Full-Length Simulation
              </span>
            </div>

            <div className="flex items-center gap-3">
              <FullMockCategoryIcon size={40} className="w-10 h-10 shrink-0 shadow-sm rounded-xl" />
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  DSSSB TGT CS Full Mock Tests (200 Marks Simulator)
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Simulate a real computer science examination in strict exam conditions. Features both Part A and Part B combined with section-based lock submission.
                </p>
              </div>
            </div>

            {/* Toggle Option: Mock Test vs PYP (Previous Year Papers) */}
            <div className="bg-slate-100 p-1.5 rounded-2xl max-w-md border border-slate-200/80 flex items-center gap-1">
              <button
                onClick={() => setFullMockTab('mock')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  fullMockTab === 'mock'
                    ? "bg-white text-blue-700 shadow-sm border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Trophy className="w-4 h-4" /> Mock Test Series
              </button>
              <button
                onClick={() => setFullMockTab('pyp')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  fullMockTab === 'pyp'
                    ? "bg-white text-amber-700 shadow-sm border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <BookOpen className="w-4 h-4" /> Official PYP Papers
              </button>
            </div>

            {/* Sub-Toggle for Mock Test Series: Part A vs Full Mock */}
            {fullMockTab === 'mock' && (
              <div className="bg-slate-100/60 p-1 rounded-xl max-w-sm border border-slate-200/40 flex items-center gap-1 animate-fadeIn">
                <button
                  onClick={() => setMockSubTab('full')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    mockSubTab === 'full'
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Full Mock (200 Qs) ({fullMockFullLengthCount})
                </button>
                <button
                  onClick={() => setMockSubTab('part_a')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    mockSubTab === 'part_a'
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Part A Mock (100 Qs) ({fullMockPartACount})
                </button>
              </div>
            )}

            {/* Practice Quizzes List */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
                Available {fullMockTab === 'mock' ? (mockSubTab === 'part_a' ? 'Part A Mock Tests' : 'Full Mock Tests') : 'Previous Year Papers'} ({fullMockQuizzes.length})
              </h3>
              <div>
                {fullMockTab === 'pyp' ? (
                  <div className="bg-amber-50/40 border-2 border-dashed border-amber-200 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-4 shadow-sm animate-fadeIn">
                    <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 mx-auto text-3xl">
                      📅
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-black text-slate-800 text-sm tracking-tight">Papers Will Be Uploaded Later</h4>
                      <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                        We are currently scanning, resolving, and verifying official previous year papers (PYPs) for DSSSB TGT CS. They will be uploaded shortly!
                      </p>
                    </div>
                    <div className="pt-2">
                      
                    </div>
                  </div>
                ) : fullMockQuizzes.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-8 text-center max-w-lg mx-auto shadow-sm text-slate-500">More mock tests coming soon.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {fullMockQuizzes.map((quiz, index) => {
                      const unlockStatus = getMockUnlockStatus(index, nowTick);
                      const quizAttempts = pastAttempts.filter(a => a.testId === quiz.testId);
                      const isAttempted = quizAttempts.length > 0;
                      const mockLabel = getMockNumberLabel(quiz, index);
                      const diffTag = getDifficultyTag(index);
                      return (
                        <div 
                          key={quiz.testId} 
                          className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-4 md:p-5 flex flex-col justify-between gap-4 transition-all shadow-[0_4px_0_0_#cbd5e1] dark:shadow-[0_4px_0_0_#1e293b] hover:shadow-[0_8px_0_0_#6366f1] hover:-translate-y-1 group relative overflow-hidden"
                        >
                          {/* Top Badges Row */}
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                                {mockLabel}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 border ${diffTag.bg} ${diffTag.text} ${diffTag.border}`}>
                                <span>{diffTag.icon}</span> {diffTag.label}
                              </span>
                            </div>

                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                🎓 200 Marks CBT
                              </span>
                              {isAttempted && (
                                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                                  ✅ Attempted ({quizAttempts.length}x)
                                </span>
                              )}
                            </div>

                            {/* Centered Name / Title in Middle */}
                            <div className="py-3 text-center border-y border-slate-100 dark:border-slate-800 my-1">
                              <h4 className="font-black text-sm text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {quiz.title}
                              </h4>
                            </div>
                          </div>

                          {/* 3D Tactile Action Buttons */}
                          <div className="pt-2 flex items-center gap-2 w-full shrink-0">
                            <button
                              onClick={(e) => handleShareMockLink(quiz, e)}
                              className="px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 shrink-0 border border-slate-200 dark:border-slate-700 active:translate-y-0.5"
                              title="Share Direct Link to this Mock Test"
                            >
                              <Share2 className="w-3.5 h-3.5 text-slate-500" /> Share
                            </button>
                            {unlockStatus.isUnlocked ? (
                              <button
                                onClick={() => handleStartTestAttempt(quiz, index)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-[0_4px_0_0_#3730a3] active:translate-y-1 active:shadow-none hover:brightness-110 text-center flex items-center justify-center gap-1.5"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>{isAttempted ? "Reattempt Test" : "Start Test"}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setLockedQuizModal({ quiz, status: unlockStatus })}
                                className="flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer bg-slate-800 hover:bg-slate-900 text-white shadow-[0_4px_0_0_#0f172a] active:translate-y-1 active:shadow-none text-center flex items-center justify-center gap-1.5"
                              >
                                <Lock className="w-3.5 h-3.5 text-amber-400" />
                                <span>Unlock Test</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quiz interface active session workspace */}
        {activeView === 'quiz' && selectedQuiz && (
          <QuizInterface
            quiz={filterQuizQuestions(selectedQuiz, reportedQuestionIds, deletedQuestionIds)}
            mode="exam"
            durationMinutes={selectedQuiz.totalTimeMinutes}
            initialSessionState={
              activeQuizSession && activeQuizSession.quiz.testId === selectedQuiz.testId
                ? {
                    currentIdx: activeQuizSession.currentIdx,
                    userAnswers: activeQuizSession.userAnswers,
                    visitedQuestions: activeQuizSession.visitedQuestions,
                    localBookmarks: activeQuizSession.localBookmarks,
                    secondsLeft: activeQuizSession.secondsLeft,
                    activeSectionIdx: activeQuizSession.activeSectionIdx,
                    submittedSections: activeQuizSession.submittedSections,
                    questionTimeSpent: activeQuizSession.questionTimeSpent
                  }
                : null
            }
            onBack={() => {
              refreshActiveSession();
              setActiveView('dashboard');
            }}
            onDiscardSession={() => {
              try { localStorage.removeItem('dsssb_active_quiz_session'); } catch (_) {}
              setActiveQuizSession(null);
            }}
            onSubmit={handleQuizSubmit}
            onReportQuestion={handleReportQuestion}
            savedBookmarks={savedBookmarks}
            onToggleGlobalBookmark={(q) => toggleBookmark(q, selectedQuiz.testId, selectedQuiz.title)}
          />
        )}

        {/* Calculating performance interstitial screen */}
        {activeView === 'analyzing' && (
          <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 z-[80] text-center">
            <div className="max-w-md w-full space-y-8 animate-fadeIn">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 animate-spin">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-extrabold display-font tracking-tight">Analyzing Performance...</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-normal">
                    Evaluating correct and incorrect answers against the official DSSSB TGT CS negative marking scheme (-0.25). Compiling statistics...
                  </p>
                </div>
              </div>

              {/* Loader progress bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300" style={{ width: `${analyzingProgress}%` }}></div>
              </div>

            </div>
          </div>
        )}

        {/* Quiz result screen and analytics logs */}
        {activeView === 'result' && selectedQuiz && (
          <ResultScreen
            quiz={selectedQuiz}
            userAnswers={currentAnswers}
            timeSpentSeconds={timeSpentSeconds}
            questionTimeSpent={currentQuestionTimeSpent}
            mode="exam"
            savedBookmarks={savedBookmarks}
            onToggleGlobalBookmark={(q) => toggleBookmark(q, selectedQuiz.testId, selectedQuiz.title)}
            onRestart={() => handleStartTestAttempt(selectedQuiz)}
            onBackToHome={() => setActiveView('dashboard')}
            onOpenSolutionReview={() => setActiveView('solution-review')}
          />
        )}

        {/* Immersive Question Analysis/Solution Review */}
        {activeView === 'solution-review' && selectedQuiz && (
          <SolutionReview
            quiz={selectedQuiz}
            userAnswers={currentAnswers}
            questionTimeSpent={currentQuestionTimeSpent}
            savedBookmarks={savedBookmarks}
            onToggleGlobalBookmark={(q) => toggleBookmark(q, selectedQuiz.testId, selectedQuiz.title)}
            onReportQuestion={handleReportQuestion}
            onBack={() => setActiveView('result')}
          />
        )}

        {/* Bookmarked questions star hub */}
        {activeView === 'bookmarks' && (
          <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-fadeIn">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="bg-white border border-slate-200 hover:bg-slate-50 p-2.5 rounded-xl text-slate-600 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="hidden sm:inline">Saved Star Hub</span>
                  <span className="sm:hidden">Saved Questions</span>
                </h2>
                <p className="text-xs text-slate-500">Your custom library of difficult, memory-anchored, and highly high-yield questions.</p>
              </div>
            </div>

            {savedBookmarks.length === 0 ? (
              <div className="h-64 rounded-3xl bg-white border border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <BookMarked className="w-12 h-12 text-slate-400 mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">No bookmarked questions yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1 leading-normal">
                  Star questions inside any full-length mock test or practice topic to build a custom study bank here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedBookmarks.map((bookmark) => {
                  if (!bookmark || !bookmark.question) return null;
                  const q = bookmark.question;
                  const opts = q.options || [];
                  return (
                    <div key={`${bookmark.quizId}_${q.id}`} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3 relative">
                      <button 
                        onClick={() => toggleBookmark(q, bookmark.quizId, bookmark.quizTitle)}
                        className="absolute top-4 right-4 text-amber-500 hover:text-slate-400 transition-colors"
                        title="Remove Bookmark"
                      >
                        <XCircle className="w-5 h-5 fill-white" />
                      </button>
                      
                      <div className="space-y-1 pr-6">
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                          {bookmark.quizTitle}
                        </span>
                        <p className="font-semibold text-xs text-slate-500 mt-1">{q.section}</p>
                        <h4 className="font-bold text-xs md:text-sm text-slate-800 leading-normal mt-1">
                          {q.question}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {opts.map((opt, oIdx) => {
                          const isCorrect = q.answer === oIdx;
                          return (
                            <div 
                              key={oIdx} 
                              className={`p-3 rounded-xl border text-xs font-semibold ${
                                isCorrect 
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                                  : 'bg-slate-50 border-slate-100 text-slate-500'
                              }`}
                            >
                              {cleanOptionText(opt)}
                              {isCorrect && (
                                <span className="float-right bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.2 rounded uppercase">Correct</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed border border-slate-100/60">
                        <strong>Solution Explanation:</strong> {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* JSON Data Manager & Indexer */}
        {activeView === 'data-manager' && (
          <DataManager staticQuizzes={staticQuizzes} />
        )}

        {/* Performance Analysis Page */}
        {activeView === 'adaptive-path' && (
          <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveView('dashboard')}
                  className="bg-white border border-slate-200 hover:bg-slate-50 p-2.5 rounded-xl text-slate-600 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600 fill-indigo-100 animate-pulse" /> Performance Analysis
                  </h2>
                  <p className="text-xs text-slate-500">Continuous diagnostic mapping of your DSSSB syllabus weak nodes and overall preparation stats.</p>
                </div>
              </div>
            </div>

            {sortedTopics.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center space-y-6 shadow-sm">
                <div className="max-w-md mx-auto space-y-2">
                  <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">Your Diagnostic Map is Empty</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Complete any full mock tests or practice sets. The adaptive engine will analyze your correct, incorrect, and unattempted responses to auto-generate personalized booster drills.
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-blue-100"
                  >
                    Go to Dashboard & Start a Test
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Topic Health Tracker */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Syllabus Node Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedTopics.map(([topic, data]) => {
                      const totalAttempted = data.correct + data.incorrect;
                      const accuracy = Math.round((data.correct / totalAttempted) * 100);
                      let statusLabel = "Struggling";
                      let statusColor = "bg-rose-50 text-rose-700 border-rose-100";
                      let progressColor = "bg-rose-500";
                      
                      if (accuracy >= 85) {
                        statusLabel = "Mastered";
                        statusColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                        progressColor = "bg-emerald-500";
                      } else if (accuracy >= 70) {
                        statusLabel = "Proficient";
                        statusColor = "bg-amber-50 text-amber-700 border-amber-100";
                        progressColor = "bg-amber-500";
                      }

                      return (
                        <div key={topic} className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-800">{topic}</span>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                              <span>Accuracy: {accuracy}%</span>
                              <span>{data.correct} Correct • {data.incorrect} Incorrect</span>
                            </div>
                            <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
                              <div className={`h-full ${progressColor}`} style={{ width: `${accuracy}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Generated Recommendation Booster Block */}
                {weakestTopic && stats[weakestTopic] && (
                  <div className="bg-indigo-50/60 border border-indigo-100 rounded-3xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5">
                        <Zap className="w-4 h-4 text-indigo-700" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase text-indigo-700 tracking-wider">Dynamic Path Action Recommended</span>
                        <h4 className="font-bold text-sm text-slate-800">
                          Launch {weakestTopic} Weakness Booster Test
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Our algorithm shows you consistently struggle on <strong>{weakestTopic}</strong> concepts (Accuracy is only {
                            Math.round(
                              (stats[weakestTopic].correct /
                                Math.max(1, stats[weakestTopic].correct + stats[weakestTopic].incorrect)) *
                                100
                            )
                          }%). A personalized study package has been auto-compiled to break this failure loop.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-indigo-100/60 pt-4">
                      <span className="text-[10px] font-bold text-slate-500">
                        Targeted Drill: {stats[weakestTopic].total} Questions Available
                      </span>
                      <button
                        onClick={() => handleStartBoosterTest(weakestTopic)}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold py-2.5 px-5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Play className="w-3 h-3 fill-white" /> Start Weakness Booster
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        </React.Suspense>
      </main>

      {/* Mobile Bottom Navigation Bar (Fixed at the bottom on mobile devices) */}
      {!['quiz', 'result', 'solution-review'].includes(activeView) && (
        <nav
          aria-label="Mobile Bottom Navigation"
          className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] px-2 py-1.5 flex items-center justify-around z-40 md:hidden pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
        >
          {[
            {
              id: 'home',
              label: 'BytePrep : CS',
              icon: Trophy,
              isActive: ['dashboard', 'part-a-view', 'part-b-view', 'full-mock-view', 'tgt-cs-view', 'common-dsssb-view', 'teaching-methodology-view'].includes(activeView),
              onClick: () => {
                triggerHaptic(12);
                if (['dashboard', 'part-a-view', 'part-b-view', 'full-mock-view', 'tgt-cs-view', 'common-dsssb-view', 'teaching-methodology-view'].includes(activeView)) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setActiveView('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              },
              activeColor: 'text-blue-600 dark:text-blue-400',
              activeBg: 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-200/60 dark:border-blue-800/60',
            },
            {
              id: 'syllabus',
              label: 'Syllabus',
              icon: ListTodo,
              isActive: activeView === 'syllabus',
              onClick: () => {
                triggerHaptic(12);
                if (activeView === 'syllabus') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setActiveView('syllabus');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              },
              activeColor: 'text-amber-600 dark:text-amber-400',
              activeBg: 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-200/60 dark:border-amber-800/60',
            },
            {
              id: 'booster',
              label: 'AI Booster',
              icon: Sparkles,
              isActive: activeView === 'adaptive-path',
              onClick: () => {
                triggerHaptic(12);
                if (activeView === 'adaptive-path') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setActiveView('adaptive-path');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              },
              activeColor: 'text-indigo-600 dark:text-indigo-400',
              activeBg: 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-200/60 dark:border-indigo-800/60',
            },
            {
              id: 'bookmarks',
              label: 'Saved',
              badge: savedBookmarks.length,
              icon: Star,
              isActive: activeView === 'bookmarks',
              onClick: () => {
                triggerHaptic(12);
                if (activeView === 'bookmarks') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setActiveView('bookmarks');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              },
              activeColor: 'text-purple-600 dark:text-purple-400',
              activeBg: 'bg-purple-50/90 dark:bg-purple-950/50 border-purple-200/60 dark:border-purple-800/60',
            },
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <motion.button
                key={item.id}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={item.onClick}
                onTouchStart={() => triggerHaptic(8)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2 transition-colors cursor-pointer rounded-2xl min-w-[58px] ${
                  item.isActive
                    ? `${item.activeColor} font-extrabold`
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold'
                }`}
              >
                {item.isActive && (
                  <motion.div
                    layoutId="mobileNavPill"
                    className={`absolute inset-0 rounded-2xl border shadow-2xs ${item.activeBg}`}
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <motion.div
                  animate={item.isActive ? { scale: [1, 1.2, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }}
                  transition={{ duration: 0.28 }}
                  className="relative z-10"
                >
                  <IconComponent className={`w-5 h-5 ${item.isActive ? 'fill-current opacity-90' : ''}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-blue-600 dark:bg-blue-500 text-white font-extrabold text-[8px] px-1 rounded-full min-w-4 h-4 flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
                <span className="relative z-10 text-[10px] font-bold mt-0.5 whitespace-nowrap tracking-tight">
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </nav>
      )}

      {/* AdSense-Compliant Footer with traffic counters, live users and legal links */}
      {!['quiz', 'result', 'solution-review'].includes(activeView) && (
        <FooterWithCompliance 
          onOpenSubscribeModal={() => setShowSubscribeModal(true)} 
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
      )}





      {/* Sleek Custom Welcome & Username Modal Overlay */}
      {showUsernameModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden animate-slideUp">
            {/* Premium accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
            
            <div className="text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0">
                <Trophy className="w-7 h-7" />
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight display-font">
                Welcome to DSSSBpyq.Online!
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Unlock official mock tests, full-length sample papers, subject revisions, and custom practice exams. To personalize your prep reports, please tell us your name.
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (tempUsernameInput.trim()) {
                  const finalName = tempUsernameInput.trim();
                  setUsername(finalName);
                  localStorage.setItem('dsssb_username', finalName);
                  setShowUsernameModal(false);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Your Name / Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={tempUsernameInput}
                  onChange={(e) => setTempUsernameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUsername('Anonymous');
                    localStorage.setItem('dsssb_username', 'Anonymous');
                    setShowUsernameModal(false);
                  }}
                  className="w-full border border-slate-200 hover:bg-slate-50 font-semibold py-3 px-4 rounded-xl text-xs transition-all text-slate-700 cursor-pointer text-center"
                >
                  Skip Naming
                </button>
                <button
                  type="submit"
                  disabled={!tempUsernameInput.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-100"
                >
                  Let's Begin <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sleek Daily Quiz Attempt Warning Modal Overlay */}
      {showDailyQuizWarning && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden animate-slideUp">
            {/* Soft Emerald highlight bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
            
            <div className="text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight display-font">
                Quiz Already Attempted!
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                You have already attempted today's Daily Quiz challenge. Excellent dedication to your practice! 
              </p>
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-left">
                <p className="text-xs text-amber-900 leading-normal font-medium text-center">
                  <strong>Notice:</strong> To simulate real exam conditions and build consistent discipline, the Daily Booster Quiz is strictly limited to <strong>one attempt per day</strong>. Please check back tomorrow for a brand new set of questions!
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDailyQuizWarning(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs tracking-wide transition-all shadow-md cursor-pointer text-center block"
              >
                Understood, Continue Practice
              </button>
            </div>
          </div>
        </div>
      )}

      

      {/* DISCARD SESSION CONFIRMATION MODAL */}
      {showDiscardConfirmModal && activeQuizSession && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[90] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleIn space-y-5">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Discard Test Progress?</h4>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[240px]">{activeQuizSession.quiz?.title}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              Are you sure you want to discard your active test session? All saved answers and remaining time for this test will be permanently erased.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setShowDiscardConfirmModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDiscardSession}
                className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md shadow-red-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Discard Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PENDING START NEW QUIZ MODAL */}
      {pendingStartQuiz && activeQuizSession && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[90] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleIn space-y-5">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Active Test in Progress</h4>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[240px]">Saved: {activeQuizSession.quiz?.title}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/70 text-amber-950">
              You already have a test session in progress. Starting <strong>"{pendingStartQuiz.title}"</strong> will discard your existing test progress.
            </p>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={async () => {
                  const quizToStart = pendingStartQuiz;
                  setPendingStartQuiz(null);
                  executeDiscardSession();
                  
                  let fullQuiz = quizToStart;
                  if ((!quizToStart.questions || quizToStart.questions.length === 0) && (quizToStart as any).file) {
                    try {
                      fullQuiz = await loadFullQuizData(quizToStart);
                    } catch (err) {
                      return; // handled in loader
                    }
                  }
                  proceedWithQuizLaunch(fullQuiz);
                }}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md shadow-red-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Discard Previous & Start New
              </button>
              <button
                onClick={() => {
                  setPendingStartQuiz(null);
                  handleResumeQuiz();
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" /> Resume Saved Test Instead
              </button>
              <button
                onClick={() => setPendingStartQuiz(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR HISTORY CONFIRMATION MODAL */}
      {showClearHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[90] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleIn space-y-5">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Clear Attempt History?</h4>
                <p className="text-xs text-slate-500 font-medium">All local attempt logs and scores</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              Are you sure you want to clear your local attempt logs and custom badges? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setShowClearHistoryModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeClearHistory}
                className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md shadow-red-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA INSTALL GUIDE MODAL FOR MOBILE */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[95] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleIn space-y-5 text-left">
            <div className="flex items-center gap-3 text-blue-600">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Install DSSSBpyq App</h4>
                <p className="text-xs text-slate-500 font-medium">Add to your mobile home screen for instant access</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <p className="font-bold text-slate-800">How to install on your mobile browser:</p>
              <ul className="list-disc pl-4 space-y-2">
                <li><strong>Chrome (Android):</strong> Tap the menu icon (3 dots) in the top right, then select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li><strong>Safari (iOS):</strong> Tap the <strong>Share</strong> button at the bottom of your screen, scroll down, and tap <strong>"Add to Home Screen"</strong>.</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setShowInstallModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cache Notification Toast */}
      {cacheToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4 animate-spin" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-bold text-slate-100">{cacheToast.message}</p>
          </div>
          <button 
            onClick={() => setCacheToast(null)}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic Lazy-Loading Quiz Overlay */}
      {isLoadingQuiz && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center z-50">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200/80 max-w-sm w-full mx-4 text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mx-auto" />
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-800">Loading Mock Test</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Fetching full question set from DSSSB Pyq servers...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* User Profile & Cross-Device Sync Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={userProfile}
        onProfileUpdate={(updated) => {
          setUserProfile(updated);
          setUsername(updated.username);
        }}
        attempts={pastAttempts}
        bookmarks={savedBookmarks}
        missedQuestions={missedQuestions}
        questionPerformance={questionPerformance}
        onDataImported={handleDataImported}
        onClearAllData={handleClearAllData}
        onShareAchievement={() => setShowAchievementModal(true)}
      />

      {/* Shareable Achievement Card Modal */}
      <AchievementCardModal
        isOpen={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        streakCount={getStreakCount()}
        syllabusPercent={getSyllabusCompletionStats().percent}
        attemptsCount={pastAttempts.length}
        avgAccuracy={pastAttempts.length > 0 ? Math.round(pastAttempts.reduce((acc, a) => acc + (a.scorePercent || 0), 0) / pastAttempts.length) : 0}
        username={userProfile.username || 'Candidate'}
        profileId={userProfile.profileId}
      />

      {/* Official YouTube & Telegram Channel Subscribe Modal */}
      <SubscribeBannerModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
      />

      {/* Admin Reported Questions Audit Tracker Modal */}
      <ReportedQuestionsTrackerModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        reportedQuestions={reportedQuestions}
        onDismissReport={handleDismissReport}
        onClearAllReports={handleClearAllReported}
      />

      {/* Mobile App Install Prompt Modal */}
      <MobileAppInstallModal />
    </div>
  );
}

