import React, { useState } from 'react';
import { 
  Send, Youtube, ExternalLink, ShieldCheck, Download, Bell, 
  Play, BookOpen, CheckCircle2, Sparkles, Share2, Copy, Check,
  FileText, Users, Search, MessageSquare, Video, Clapperboard, MonitorPlay
} from 'lucide-react';
import { Glass3dIcon } from './Glass3dIcons';

interface ContentHubProps {
  initialTab?: 'telegram' | 'youtube';
  onNavigateToTab?: (tab: 'telegram' | 'youtube') => void;
  onOpenSubscribeModal?: () => void;
}

export const ContentHub: React.FC<ContentHubProps> = ({ 
  initialTab = 'telegram',
  onNavigateToTab,
  onOpenSubscribeModal
}) => {
  const [activeTab, setActiveTab] = useState<'telegram' | 'youtube'>(initialTab);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (tab: 'telegram' | 'youtube') => {
    setActiveTab(tab);
    if (onNavigateToTab) {
      onNavigateToTab(tab);
    }
  };

  const handleCopyLink = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Telegram Channels & PDF Resources Data
  const telegramResources = [
    {
      id: 'apar_channel_list',
      title: 'APAR चैनल सूची | Channel Directory',
      url: 'https://t.me/dsssb_computer_science_apar',
      badge: 'Official Directory',
      category: 'APAR Channel',
      subtext: 'Direct verified channel list for DSSSB TGT/PGT Computer Science, Special Education & PRT Teacher updates.',
      sublinks: [
        { label: 'APAR TGT Computer Science Main Channel', url: 'https://t.me/dsssb_tgt_cs_official' },
        { label: 'Daily CBT Quiz & Answer Key Alerts', url: 'https://t.me/dsssb_quiz_bot' },
        { label: 'CS Notes & PYQ PDF Library', url: 'https://t.me/dsssb_cs_pdf_vault' },
      ],
      members: '18,500+ Members',
      iconType: 'telegram' as const
    },
    {
      id: 'tgt_cs_discussion',
      title: 'DSSSB TGT CS Candidate Group & Doubt Forum',
      url: 'https://t.me/dsssb_cs_discussion',
      badge: 'Active Community',
      category: 'Discussion Group',
      subtext: 'Ask computer science doubts, discuss syllabus coverage (Parts A & B), and compare mock scores with toppers.',
      sublinks: [
        { label: 'Post a CS Question / Logic Doubt', url: 'https://t.me/dsssb_cs_discussion' },
        { label: 'Exam Notification & Admit Card Discussions', url: 'https://t.me/dsssb_cs_discussion' },
      ],
      members: '12,200+ Members',
      iconType: 'telegram' as const
    },
    {
      id: 'dsssb_pdf_vault',
      title: 'Free Study Material & PYQ PDF Downloads',
      url: 'https://t.me/dsssb_notes_and_pdfs',
      badge: 'Free PDFs',
      category: 'Study Vault',
      subtext: 'Free access to DSSSB 2014-2024 Computer Science solved question papers, Operating Systems notes, and DBMS handwritten formula cheatsheets.',
      sublinks: [
        { label: 'Download 2024 TGT CS Question Paper PDF', url: 'https://t.me/dsssb_notes_and_pdfs' },
        { label: 'Download Teaching Methodology 500 MCQs', url: 'https://t.me/dsssb_notes_and_pdfs' },
      ],
      members: '24,000+ Downloads',
      iconType: 'telegram' as const
    }
  ];

  // YouTube Video Courses & Solved Papers Data
  const youtubeCourses = [
    {
      id: 'tgt_cs_crash_course',
      title: 'DSSSB TGT Computer Science Complete 2026 Master Series',
      url: 'https://www.youtube.com/results?search_query=dsssb+tgt+computer+science+complete+course',
      badge: 'Full Playlist',
      channel: 'Delhi Teacher Exam CS Prep',
      views: '145K+ Views',
      duration: '42 Video Lectures',
      description: 'Complete syllabus breakdown covering Operating Systems, Data Structures, DBMS, Networking, C++, Python, HTML/CSS, and Logic Gates.',
      iconType: 'youtube' as const,
      episodes: [
        { title: 'Operating System Memory Management & Page Replacement', duration: '48m', level: 'High Priority' },
        { title: 'DBMS Relational Algebra & SQL Normalization (1NF to 3NF)', duration: '55m', level: 'High Priority' },
        { title: 'Computer Networks TCP/IP vs OSI Layer MCQs', duration: '42m', level: 'Medium' },
      ]
    },
    {
      id: 'pyq_video_solutions',
      title: 'DSSSB TGT CS Previous Year Papers Step-by-Step Video Solutions',
      url: 'https://www.youtube.com/results?search_query=dsssb+computer+science+pyq+solutions',
      badge: 'Paper Solutions',
      channel: 'DSSSB Prep Video Vault',
      views: '98K+ Views',
      duration: '18 Past Papers',
      description: 'Detailed question-by-question walkthrough of actual CBT exam papers from 2014, 2017, 2021, and 2024 with shortcut tricks.',
      iconType: 'youtube' as const,
      episodes: [
        { title: '2024 TGT CS Slot 1 Complete 200 Questions Discussion', duration: '1h 30m', level: 'Must Watch' },
        { title: '2021 DSSSB Computer Science Female Shift Solved Paper', duration: '1h 15m', level: 'Must Watch' },
      ]
    },
    {
      id: 'pedagogy_video_series',
      title: 'Teaching Methodology & Pedagogy (Part B Special 20 Marks)',
      url: 'https://www.youtube.com/results?search_query=dsssb+teaching+methodology+computer+science',
      badge: 'Pedagogy Masterclass',
      channel: 'Teacher Pedagogy Hub',
      views: '76K+ Views',
      duration: '12 Lectures',
      description: 'Master Bloom\'s Taxonomy, Constructivism, ICT Pedagogy, Inclusive Education, and NCF 2005/NEP 2020 concepts.',
      iconType: 'youtube' as const,
      episodes: [
        { title: 'Pedagogy in Computer Science Education & Lesson Planning', duration: '38m', level: 'Part B' },
        { title: 'NCF 2005 & NEP 2020 Key Teaching MCQs', duration: '45m', level: 'Part B' },
      ]
    }
  ];

  const filteredTelegram = telegramResources.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtext.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredYoutube = youtubeCourses.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn" id="content-module-container">
      
      {/* Header Banner with Native Glassmorphism Box */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900/90 text-white p-4 sm:p-6 md:p-8 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
        
        {/* Glow ambient background graphics */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/30 via-sky-500/20 to-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 rounded-full bg-gradient-to-tr from-amber-500/20 via-blue-500/20 to-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 font-black text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-950" />
                  DSSSB Content Hub
                </span>
                <span className="text-slate-400 font-mono text-[11px] sm:text-xs">Updated Daily</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight display-font text-white">
                Study Materials &amp; Videos
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/90 font-medium max-w-2xl leading-relaxed">
                Verified Telegram channel PDFs &amp; subject-wise YouTube playlist lectures.
              </p>
            </div>

            {/* 3D Glassmorphism Quick Badges */}
            <div 
              onClick={onOpenSubscribeModal}
              className="hidden sm:flex items-center gap-3 shrink-0 cursor-pointer hover:scale-105 transition-all"
              title="Click to Subscribe to YouTube & Telegram Channels"
            >
              <Glass3dIcon type="telegram" size="lg" />
              <Glass3dIcon type="youtube" size="lg" />
            </div>
          </div>

          {/* Search Bar inside Header */}
          <div className="pt-1 sm:pt-2">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Telegram PDFs, YouTube videos..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-white/10 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700/80 rounded-xl sm:rounded-2xl text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 backdrop-blur-md"
              />
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Subscribe Callout Banner */}
      <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-sky-500/10 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
          <div className="p-2 bg-rose-500/10 rounded-xl shrink-0">
            <Youtube className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-xs sm:text-sm font-bold leading-tight">
            If you find this website beneficial, please <span className="text-rose-600 dark:text-rose-400 font-extrabold">subscribe to our YouTube channel</span> &amp; <span className="text-sky-600 dark:text-sky-400 font-extrabold">join Telegram</span> for daily free PDF notes &amp; video lectures!
          </p>
        </div>
        <button
          onClick={onOpenSubscribeModal}
          className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Youtube className="w-4 h-4 fill-white" />
          <span>Subscribe Channels</span>
        </button>
      </div>

      {/* Minimalist 2-Column Tabs on Mobile */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        
        {/* Telegram Tab Button */}
        <button
          onClick={() => handleTabChange('telegram')}
          className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-300 text-left flex items-center gap-2.5 sm:gap-4 cursor-pointer relative overflow-hidden group ${
            activeTab === 'telegram'
              ? 'bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-indigo-500/15 border-sky-400/80 shadow-lg dark:border-sky-500/80 ring-2 ring-sky-400/20'
              : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 shadow-sm backdrop-blur-md'
          }`}
          style={{ backdropFilter: 'blur(16px)' }}
        >
          <div className="hidden sm:block">
            <Glass3dIcon type="telegram" size="lg" />
          </div>
          <div className="sm:hidden shrink-0">
            <Glass3dIcon type="telegram" size="sm" />
          </div>
          <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-black text-slate-900 dark:text-white text-xs sm:text-base group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                Telegram Directory
              </h3>
              <span className={`text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                activeTab === 'telegram' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                PDFs
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-normal hidden sm:block">
              Official channel list, APAR directory, study notes PDFs &amp; daily discussion group.
            </p>
          </div>
        </button>

        {/* YouTube Tab Button */}
        <button
          onClick={() => handleTabChange('youtube')}
          className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-300 text-left flex items-center gap-2.5 sm:gap-4 cursor-pointer relative overflow-hidden group ${
            activeTab === 'youtube'
              ? 'bg-gradient-to-r from-rose-500/15 via-red-500/10 to-pink-500/15 border-rose-400/80 shadow-lg dark:border-rose-500/80 ring-2 ring-rose-400/20'
              : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700 shadow-sm backdrop-blur-md'
          }`}
          style={{ backdropFilter: 'blur(16px)' }}
        >
          <div className="hidden sm:block">
            <Glass3dIcon type="youtube" size="lg" />
          </div>
          <div className="sm:hidden shrink-0">
            <Glass3dIcon type="youtube" size="sm" />
          </div>
          <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-black text-slate-900 dark:text-white text-xs sm:text-base group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                YouTube Videos
              </h3>
              <span className={`text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                activeTab === 'youtube' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                Courses
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-normal hidden sm:block">
              Full TGT CS video playlists, step-by-step paper solutions &amp; pedagogy masterclasses.
            </p>
          </div>
        </button>

      </div>

      {/* Content Section based on active tab */}
      {activeTab === 'telegram' && (
        <div className="space-y-4 sm:space-y-5 animate-fadeIn">
          
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 sm:pb-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500" />
              <h2 className="font-black text-slate-900 dark:text-white text-sm sm:text-lg">Verified Telegram Channels &amp; APAR</h2>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-sky-200/60 dark:border-sky-800">
              {filteredTelegram.length} Feeds
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredTelegram.map((item) => (
              <div 
                key={item.id}
                className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 rounded-2xl p-4 md:p-5 flex flex-col justify-between gap-4 transition-all shadow-[0_4px_0_0_#cbd5e1] dark:shadow-[0_4px_0_0_#1e293b] hover:shadow-[0_8px_0_0_#0284c7] hover:-translate-y-1 group relative overflow-hidden"
              >
                {/* Top Badges & Header Row */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <span className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-300/40 font-extrabold text-[9px] md:text-[10px] px-2.5 py-0.5 rounded-md uppercase">
                      {item.badge}
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono font-bold">{item.members}</span>
                  </div>

                  <div className="flex justify-center my-1">
                    <Glass3dIcon type="telegram" size="md" />
                  </div>

                  {/* Centered Title in Middle */}
                  <div className="py-2 text-center border-y border-slate-100 dark:border-slate-800">
                    <h3 className="font-black text-sm text-slate-900 dark:text-white leading-snug group-hover:text-sky-600 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-center line-clamp-3">
                    {item.subtext}
                  </p>

                  {/* Direct Sublinks */}
                  {item.sublinks && item.sublinks.length > 0 && (
                    <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-left">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                        Quick Sub-Links:
                      </span>
                      <div className="space-y-1">
                        {item.sublinks.slice(0, 2).map((sub, sIdx) => (
                          <a
                            key={sIdx}
                            href={sub.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-sky-950/50 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between transition-colors group/sub cursor-pointer"
                          >
                            <span className="truncate group-hover/sub:text-sky-600">{sub.label}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover/sub:text-sky-500 shrink-0 ml-1" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3D Action Buttons */}
                <div className="pt-2 flex items-center gap-2 w-full shrink-0">
                  <button
                    onClick={() => handleCopyLink(item.url, item.id)}
                    className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 active:translate-y-0.5 shrink-0 flex items-center justify-center gap-1"
                    title="Copy Link"
                  >
                    {copiedLink === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer bg-gradient-to-b from-sky-400 via-sky-500 to-sky-600 text-white shadow-[0_4px_0_0_#0284c7] active:translate-y-1 active:shadow-none hover:brightness-110 text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Join Channel</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* YouTube Tab Content */}
      {activeTab === 'youtube' && (
        <div className="space-y-4 sm:space-y-5 animate-fadeIn">
          
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 sm:pb-3">
            <div className="flex items-center gap-2">
              <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
              <h2 className="font-black text-slate-900 dark:text-white text-sm sm:text-lg">YouTube Playlists &amp; PYQs</h2>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-rose-200/60 dark:border-rose-800">
              {filteredYoutube.length} Courses
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredYoutube.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 hover:border-rose-500 dark:hover:border-rose-500 rounded-2xl p-4 md:p-5 flex flex-col justify-between gap-4 transition-all shadow-[0_4px_0_0_#cbd5e1] dark:shadow-[0_4px_0_0_#1e293b] hover:shadow-[0_8px_0_0_#e11d48] hover:-translate-y-1 group relative overflow-hidden"
              >
                {/* Top Badges & Header Row */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <span className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-300/40 font-extrabold text-[9px] md:text-[10px] px-2.5 py-0.5 rounded-md uppercase">
                      {course.badge}
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono font-bold">{course.views}</span>
                  </div>

                  <div className="flex justify-center my-1">
                    <Glass3dIcon type="youtube" size="md" />
                  </div>

                  {/* Centered Title in Middle */}
                  <div className="py-2 text-center border-y border-slate-100 dark:border-slate-800">
                    <h3 className="font-black text-sm text-slate-900 dark:text-white leading-snug group-hover:text-rose-600 transition-colors">
                      {course.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-center line-clamp-3">
                    {course.description}
                  </p>

                  {/* Featured Lectures Preview */}
                  {course.episodes && course.episodes.length > 0 && (
                    <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-left">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                        Featured Video Lectures:
                      </span>
                      <div className="space-y-1">
                        {course.episodes.slice(0, 2).map((ep, eIdx) => (
                          <div
                            key={eIdx}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2"
                          >
                            <span className="truncate">{ep.title}</span>
                            <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-500 shrink-0">{ep.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3D Action Button */}
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer bg-gradient-to-b from-rose-500 via-rose-600 to-rose-700 text-white shadow-[0_4px_0_0_#be123c] active:translate-y-1 active:shadow-none hover:brightness-110 text-center flex items-center justify-center gap-1.5 mt-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Playlist</span>
                </a>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};

export default ContentHub;
