const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// Replace the async font loading hack with a regular stylesheet link
const oldFontStr = `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
    <noscript>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet" />
    </noscript>`;
    
const newFontStr = `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet" />`;

content = content.replace(oldFontStr, newFontStr);

fs.writeFileSync('index.html', content, 'utf8');
