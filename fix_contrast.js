import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts') || dirPath.endsWith('.css')) {
      callback(path.join(dir, f));
    }
  });
}

walkDir('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace text-slate-400 with text-slate-500, UNLESS it's preceded by dark:
  // We can use a regex with negative lookbehind if supported, but let's just do a manual replace
  // regex: /(?<!dark:)text-slate-400/g
  content = content.replace(/(?<!dark:)text-slate-400/g, 'text-slate-500');
  content = content.replace(/(?<!dark:)text-slate-300/g, 'text-slate-400');
  content = content.replace(/(?<!dark:)text-gray-400/g, 'text-gray-500');
  content = content.replace(/(?<!dark:)text-gray-300/g, 'text-gray-400');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});
