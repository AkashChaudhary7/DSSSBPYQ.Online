import fs from 'fs';
import path from 'path';

function searchInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.toLowerCase().includes('tgt cs') || content.toLowerCase().includes('notification') || content.toLowerCase().includes('post') || content.includes('41/')) {
      console.log(`Matched in: ${filePath}`);
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes('tgt cs') || line.toLowerCase().includes('notification') || line.includes('41/')) {
          console.log(`  Line ${idx + 1}: ${line.trim().substring(0, 150)}`);
        }
      });
    }
  } catch (err) {}
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        traverse(fullPath);
      }
    } else {
      searchInFile(fullPath);
    }
  }
}

traverse('.');
