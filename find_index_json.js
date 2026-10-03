import fs from 'fs';
import path from 'path';

function searchFile(dir, fileName) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        searchFile(fullPath, fileName);
      }
    } else if (file === fileName) {
      console.log(`Found: ${fullPath}`);
    }
  }
}

searchFile('.', 'index.json');
