import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Search, Filter, Sparkles, Clock, Calendar, User, Tag, 
  ArrowRight, ArrowLeft, Share2, Bookmark, CheckCircle2, ChevronRight, 
  BookMarked, Layers, FileText, ExternalLink, X 
} from 'lucide-react';
import { blogArticles, BlogArticleData as BlogArticle } from '../data/blogArticles';
import { Glass3dIcon } from './Glass3dIcons';

export type { BlogArticle };

const articlesData = blogArticles;

const CATEGORIES = [
  'All',
  'DSSSB',
  'KVS / NVS',
  'EMRS & State',
  'Exam Strategy',
  'Computer Science Notes'
] as const;

interface BlogSectionProps {
  onOpenArticleId?: string | null;
  onCloseArticle?: () => void;
  className?: string;
}

export default function BlogSection({ onOpenArticleId, onCloseArticle, className = '' }: BlogSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<BlogArticle | null>(() => {
    if (onOpenArticleId) {
      return articlesData.find(a => a.id === onOpenArticleId || a.slug === onOpenArticleId) || null;
    }
    return null;
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dsssb_blog_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('dsssb_blog_bookmarks', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Filter articles based on search & category
  const filteredArticles = useMemo(() => {
    return articlesData.filter(article => {
      const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q) ||
        article.tags.some(t => t.toLowerCase().includes(q)) ||
        article.content.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleOpenArticle = (article: BlogArticle) => {
    setActiveArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseArticle = () => {
    setActiveArticle(null);
    if (onCloseArticle) {
      onCloseArticle();
    }
  };

  const handleShare = (article: BlogArticle) => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${article.title} - ${url}`);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <section className={`w-full bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800 font-sans ${className}`} id="blog-knowledge-section">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] sm:text-xs font-black rounded-lg uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Exam Knowledge &amp; Strategy Hub
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-xs font-black rounded-lg uppercase tracking-wider">
                Updated August 2026
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400 shrink-0" />
              <span>Computer Science Teacher Exam Articles &amp; Prep Guides</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              In-depth articles, pattern rules, high-yield revision cheatsheets, eligibility guidelines, and preparation strategies for DSSSB TGT/PGT CS, KVS, NVS, EMRS, and State Computer Teacher exams.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, topics, rules..."
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
          <span className="text-xs font-extrabold text-slate-400 shrink-0 flex items-center gap-1 uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border-slate-700/60'
              }`}
            >
              <span>{category}</span>
              {category === 'All' ? (
                <span className="text-[10px] opacity-75">({articlesData.length})</span>
              ) : (
                <span className="text-[10px] opacity-75">
                  ({articlesData.filter(a => a.category === category).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Article Cards Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-3">
            <Search className="w-10 h-10 text-slate-500 mx-auto animate-bounce" />
            <h3 className="text-sm font-bold text-slate-300">No articles match your search criteria</h3>
            <p className="text-xs text-slate-400">Try searching for keywords like &quot;DSSSB&quot;, &quot;Operating Systems&quot;, &quot;KVS&quot;, or &quot;Strategy&quot;.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => {
              const isBookmarked = bookmarkedIds.includes(article.id);
              return (
                <div
                  key={article.id}
                  onClick={() => handleOpenArticle(article)}
                  className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/60 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Header Top Row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold rounded-md uppercase tracking-wide">
                        {article.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" /> {article.readTime}
                        </span>
                        <button
                          onClick={(e) => toggleBookmark(article.id, e)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white'
                          }`}
                          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Article Title */}
                    <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                  </div>

                  {/* Footer metadata & Read Button */}
                  <div className="pt-4 mt-4 border-t border-slate-700/60 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[130px] text-[11px] font-medium">{article.author}</span>
                    </div>

                    <span className="text-indigo-400 group-hover:text-indigo-300 font-extrabold text-xs flex items-center gap-1 shrink-0 group-hover:translate-x-1 transition-transform">
                      <span>Read Full Article</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* INDEPENDENT FULL-PAGE ARTICLE READER OVERLAY */}
      {activeArticle && (
        <div className="fixed inset-0 z-[200] bg-slate-950 text-slate-100 overflow-y-auto font-sans animate-fadeIn">
          {/* Reader Top Sticky Header Bar */}
          <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
            <button
              onClick={handleCloseArticle}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Articles</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 min-w-0">
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-black rounded uppercase tracking-wider">
                {activeArticle.category}
              </span>
              <h4 className="text-xs font-bold text-slate-300 truncate max-w-md">
                {activeArticle.title}
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleBookmark(activeArticle.id)}
                className={`p-2 rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
                  bookmarkedIds.includes(activeArticle.id)
                    ? 'bg-amber-400/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarkedIds.includes(activeArticle.id) ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{bookmarkedIds.includes(activeArticle.id) ? 'Bookmarked' : 'Save'}</span>
              </button>

              <button
                onClick={() => handleShare(activeArticle)}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Share Article"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                onClick={handleCloseArticle}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                title="Close Reader"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Reader Body Content Container */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
            
            {/* Metadata Header */}
            <div className="space-y-4 border-b border-slate-800 pb-8">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-black text-xs rounded-lg uppercase tracking-wider">
                  {activeArticle.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {activeArticle.readTime}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {activeArticle.date}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                {activeArticle.title}
              </h1>

              {/* Author Card */}
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-base shrink-0">
                  {activeArticle.author.charAt(0)}
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <span>{activeArticle.author}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {activeArticle.authorRole}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Highlight Box */}
            <div className="bg-indigo-950/50 border border-indigo-800/80 rounded-2xl p-5 text-indigo-200 text-xs sm:text-sm leading-relaxed space-y-2">
              <strong className="text-indigo-300 uppercase tracking-wider text-[11px] font-black block">Key Takeaway Summary</strong>
              <p>{activeArticle.summary}</p>
            </div>

            {/* Article Content Render */}
            <div 
              className="prose prose-invert prose-indigo max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 font-normal"
              dangerouslySetInnerHTML={{ __html: activeArticle.content }}
            />

            {/* Article Tags */}
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" /> Article Tags &amp; Topics
              </div>
              <div className="flex flex-wrap gap-2">
                {activeArticle.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Navigation within Reader */}
            <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={handleCloseArticle}
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Articles &amp; Dashboard</span>
              </button>

              <button
                onClick={() => handleShare(activeArticle)}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Preparation Article</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
