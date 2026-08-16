const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// There is one in the header navbar (line 1999)
content = content.replace(/<a\s+href="https:\/\/t\.me[^>]+>[\s\S]*?<span>Join Telegram<\/span>\s*<\/a>/g, '');

// There is one under PYPs (line 2948)
content = content.replace(/<a\s+href="https:\/\/t\.me[^>]+>[\s\S]*?Join Telegram for Updates <ChevronRight className="w-3\.5 h-3\.5" \/>\s*<\/a>/g, '');

// Removing the rest of the modal just to be safe
content = content.replace(/\{\/\* Mandatory Telegram Channel Join Popup Modal \*\/\}[\s\S]*?\{\/\* Footer \*\/}/g, '{/* Footer */}');

fs.writeFileSync('src/App.tsx', content, 'utf8');
