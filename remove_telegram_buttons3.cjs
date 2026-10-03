const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/\/\/ Telegram Mandatory Join Modal State[\s\S]*?const \[showTelegramModal, setShowTelegramModal\] = useState<boolean>\(\(\) => \{[\s\S]*?try \{[\s\S]*?return localStorage\.getItem\('dsssb_joined_telegram'\) !== 'true';[\s\S]*?\} catch \(_\) \{[\s\S]*?return true;[\s\S]*?\}[\s\S]*?\}\);\n/g, '');

content = content.replace(/\{\/\* Mandatory Telegram Channel Join Popup Modal \*\/\}[\s\S]*?\{\/\* Footer \*\/}/g, '{/* Footer */}');

fs.writeFileSync('src/App.tsx', content, 'utf8');
