const fs = require('fs');

let content = fs.readFileSync('sync_and_generate.js', 'utf8');

// Add assetlinks.json to the ignoreFiles Set
content = content.replace("'manifest.json',", "'manifest.json',\n    'assetlinks.json',");
// Also ignore .well-known directory
content = content.replace("file === '.aistudio'", "file === '.aistudio' || file === '.well-known'");

fs.writeFileSync('sync_and_generate.js', content, 'utf8');
