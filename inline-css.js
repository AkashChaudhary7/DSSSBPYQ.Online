import fs from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'dist');
const htmlFile = path.join(distDir, 'index.html');
const cssFiles = fs.readdirSync(path.join(distDir, 'assets')).filter(f => f.endsWith('.css'));

if (cssFiles.length > 0) {
  let html = fs.readFileSync(htmlFile, 'utf8');
  let injectedStyle = '';
  
  for (const cssFile of cssFiles) {
    const cssPath = path.join(distDir, 'assets', cssFile);
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    injectedStyle += `<style id="inlined-css-${cssFile}">${cssContent}</style>`;
    // Try matching different Vite CSS link formats
    const linkRegex = new RegExp(`<link[^>]*href="/assets/${cssFile}"[^>]*>`, 'g');
    html = html.replace(linkRegex, '');
  }
  
  html = html.replace('</head>', `${injectedStyle}</head>`);
  fs.writeFileSync(htmlFile, html, 'utf8');
  console.log('Successfully inlined ' + cssFiles.length + ' CSS file(s).');
}
