import React, { useState } from 'react';
import { 
  Search, ExternalLink, Globe, Copy, Check, Sparkles, RefreshCw,
  Sliders, Link2, Share2, Code, ShieldCheck, CheckCircle2, Info
} from 'lucide-react';
import { Glass3dIcon } from './Glass3dIcons';

interface SeoPreviewHubProps {
  currentRoute?: string;
  onNavigateRoute?: (route: string) => void;
}

export const SeoPreviewHub: React.FC<SeoPreviewHubProps> = ({
  currentRoute = '#seo-preview',
  onNavigateRoute
}) => {
  const [queryKeyword, setQueryKeyword] = useState('dsssb tgt computer science apar channel');
  const [siteTitle, setSiteTitle] = useState('APAR चैनल सूची | DSSSB TGT Computer Science Prep Hub');
  const [siteUrl, setSiteUrl] = useState('https://www.sarkariserviceprep.com/2026/04/dsssb-tgt-cs');
  const [siteMetaDescription, setSiteMetaDescription] = useState(
    'Detailed APAR channel list for DSSSB TGT Computer Science 2026. Access syllabus breakdown, free PYQ PDF notes, CBT mock tests, and verified Telegram & YouTube learning channels.'
  );

  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  // Sitelinks structure matching Image 3
  const [sitelinks, setSitelinks] = useState([
    {
      title: 'APAR चैनल सूची | Telegram Channel',
      url: 'https://www.sarkariserviceprep.com/2026/04/apar-channel-list',
      desc: 'APAR channel directory for DSSSB teacher exam updates and daily syllabus alerts.'
    },
    {
      title: 'DSSSB TGT CS CBT Mock Tests',
      url: 'https://www.sarkariserviceprep.com/#/quiz/tgt-cs-full-1',
      desc: 'Free 200 marks full-length CBT mock test with negative marking and instant scorecards.'
    },
    {
      title: 'YouTube Video Crash Course',
      url: 'https://www.sarkariserviceprep.com/#/content/youtube',
      desc: 'Step-by-step video solutions for 2014-2024 previous year papers.'
    },
    {
      title: 'Part B Computer Science Syllabus',
      url: 'https://www.sarkariserviceprep.com/#/syllabus',
      desc: 'Complete coverage of OS, DBMS, Networks, Data Structures, and Pedagogy.'
    }
  ]);

  const handleCopyTag = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(id);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const metaHtmlString = `<title>${siteTitle}</title>
<meta name="description" content="${siteMetaDescription}" />
<link rel="canonical" href="${siteUrl}" />
<meta property="og:title" content="${siteTitle}" />
<meta property="og:description" content="${siteMetaDescription}" />
<meta property="og:url" content="${siteUrl}" />
<meta property="og:type" content="website" />`;

  return (
    <div className="space-y-6 animate-fadeIn" id="seo-preview-module">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 text-white p-6 md:p-8 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-500/20 via-sky-500/20 to-blue-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-950" />
              SEO &amp; Direct Link Hub
            </span>
            <span className="text-slate-400 font-mono text-xs">Direct Hash Router Active</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight display-font text-white flex items-center gap-2.5">
            Google Search Preview &amp; SEO Sitemap
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
            Generate clean canonical search result snippets (SERP format), inspect deep routing hashes, and export search engine meta tags.
          </p>
        </div>
      </div>

      {/* Main Grid: SERP Preview (Image 3 layout) and Editor Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Google Search Result Preview Card (Matching Image 3) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Google Search SERP Result Simulation
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                Google Desktop / Mobile View
              </span>
            </div>

            {/* Google Query Header (Image 3 top line) */}
            <div className="text-sm font-sans text-slate-700 dark:text-slate-300">
              These are results for <span className="font-bold italic text-slate-900 dark:text-white">{queryKeyword}</span>
            </div>

            {/* Google Search Result Card Box (Image 3 exact format) */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 font-sans">
              
              {/* URL Breadcrumb Line with favicon */}
              <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[10px] shadow-sm shrink-0">
                  S
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-slate-900 dark:text-slate-200 font-bold text-xs">Sarkari Service Prep</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{siteUrl}</span>
                </div>
              </div>

              {/* Main Title Link */}
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block font-medium text-lg md:text-xl text-blue-700 dark:text-blue-400 hover:underline hover:text-blue-800 transition-colors cursor-pointer leading-snug"
              >
                {siteTitle}
              </a>

              {/* Meta Description Snippet */}
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {siteMetaDescription}
              </p>

              {/* Sub-Sitelinks List (Matching Image 3 APAR channel list sublinks) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-900 space-y-2">
                {sitelinks.map((link, idx) => (
                  <div key={idx} className="group py-1 border-b border-slate-50 dark:border-slate-900/50 last:border-0">
                    <a
                      href={link.url}
                      className="font-medium text-sm text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                    >
                      <span>{link.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                    </a>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                      {link.desc}
                    </p>
                  </div>
                ))}
              </div>

            </div>

            {/* Direct Hash Navigation Sitemap Bar */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-blue-500" />
                Direct Routing Deep Links (Copy or Navigate)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: 'Content Hub', hash: '#content' },
                  { label: 'Telegram Tab', hash: '#content/telegram' },
                  { label: 'YouTube Tab', hash: '#content/youtube' },
                  { label: 'TGT CS Hub', hash: '#tgt-cs' },
                  { label: 'Teaching Pedagogy', hash: '#teaching-methodology' },
                  { label: 'Syllabus Tracker', hash: '#syllabus' },
                ].map((routeItem, rIdx) => (
                  <button
                    key={rIdx}
                    onClick={() => {
                      if (onNavigateRoute) onNavigateRoute(routeItem.hash);
                      window.location.hash = routeItem.hash;
                    }}
                    className="bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 text-left truncate transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate">{routeItem.label}</span>
                    <span className="text-[9px] font-mono text-blue-600 dark:text-blue-400 group-hover:underline">
                      {routeItem.hash}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: SEO Controls & Meta Tag Generator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-4">
            
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <h2 className="font-extrabold text-slate-900 dark:text-white text-sm">
                SERP Customizer
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Search Query Keyword
                </label>
                <input
                  type="text"
                  value={queryKeyword}
                  onChange={(e) => setQueryKeyword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Page Title (&lt;title&gt;)
                </label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={siteMetaDescription}
                  onChange={(e) => setSiteMetaDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>
            </div>

            {/* Generated Meta Tags Box */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Code className="w-3 h-3 text-indigo-500" />
                  Generated HTML Head Tags
                </span>
                <button
                  onClick={() => handleCopyTag(metaHtmlString, 'html_tags')}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedTag === 'html_tags' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTag === 'html_tags' ? 'Copied!' : 'Copy HTML'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 text-slate-300 p-3 rounded-2xl text-[10px] font-mono leading-relaxed overflow-x-auto border border-slate-800 max-h-40">
                {metaHtmlString}
              </pre>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default SeoPreviewHub;
