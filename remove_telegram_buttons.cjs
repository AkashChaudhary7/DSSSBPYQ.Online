const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// There are three instances of:
// onClick={() => {
//   try { localStorage.setItem('dsssb_joined_telegram', 'true'); } catch (_) {}
// }}

// Let's replace the whole parent <div> containing the anchor tag if possible, or just the <a> tags.
// Looking at the grep, it looks like there's a div wrapping the a tag.

const buttonBlockRegex = /<div className="bg-sky-50\/80 border border-dashed border-sky-300 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-4 shadow-sm">[\s\S]*?Join Telegram Channel <ChevronRight className="w-3\.5 h-3\.5" \/>[\s\S]*?<\/a>\s*<\/div>/g;

content = content.replace(buttonBlockRegex, '<div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-8 text-center max-w-lg mx-auto shadow-sm text-slate-500">More mock tests coming soon.</div>');

const joinUpdatesRegex = /<div className="bg-sky-50\/80 border border-dashed border-sky-300 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-4 shadow-sm">[\s\S]*?Join Telegram for Updates <ChevronRight className="w-3\.5 h-3\.5" \/>[\s\S]*?<\/a>\s*<\/div>\s*<\/div>/g;
content = content.replace(joinUpdatesRegex, '<div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-8 text-center max-w-lg mx-auto shadow-sm text-slate-500">More mock tests coming soon.</div>');

fs.writeFileSync('src/App.tsx', content, 'utf8');
