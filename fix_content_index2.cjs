const fs = require('fs');
let content = fs.readFileSync('src/data/contentIndex.ts', 'utf8');
content = content.replace("export { BUILTIN_QUIZZES };", "");
fs.writeFileSync('src/data/contentIndex.ts', content, 'utf8');
