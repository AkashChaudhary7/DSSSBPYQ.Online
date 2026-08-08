const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The remaining code is:
// {showTelegramModal && (
//   <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
//     ...
//   </div>
// )}

content = content.replace(/\{\/\* Mandatory Telegram Channel Join Popup Modal \*\/\}[\s\S]*?\{showTelegramModal && \([\s\S]*?<div className="fixed inset-0 z-50 bg-slate-950\/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">[\s\S]*?<h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">\s*Join Our Telegram Channel[\s\S]*?<\/div>\s*\)\}/g, '');

fs.writeFileSync('src/App.tsx', content, 'utf8');
