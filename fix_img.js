const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/<img\s+src="\/logo\.svg"/, '<img src="/logo.svg" loading="lazy" decoding="async"');
fs.writeFileSync('src/App.tsx', content, 'utf8');
