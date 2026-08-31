const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.build = "node sync_and_generate.js && vite build && node inline-css.js";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2), 'utf8');
