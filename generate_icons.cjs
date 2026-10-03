const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// SVG Logo matching the user's provided logo image:
// - White circular badge canvas with soft drop shadow
// - Dark navy Mortarboard (Graduation Cap) with orange tassel on top-left of star
// - 5-pointed star with rounded corners and vibrant blue gradient double stroke
// - Golden/Yellow checkmark inside the star with 3D gradient highlight
// - Bold "DSSSBpyq" brand text below

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Shadow -->
    <filter id="circle-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.12"/>
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.08"/>
    </filter>

    <!-- Star Blue Gradient -->
    <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="45%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#1e3a8a" />
    </linearGradient>

    <!-- Star Outer Glow/Double Border Gradient -->
    <linearGradient id="starOuterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>

    <!-- Checkmark Gold Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="25%" stop-color="#facc15" />
      <stop offset="70%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>

    <!-- Checkmark Bevel Highlight -->
    <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.65" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
    </linearGradient>

    <!-- Cap Gradient -->
    <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2a3859" />
      <stop offset="100%" stop-color="#111827" />
    </linearGradient>

    <!-- Tassel Gradient -->
    <linearGradient id="tasselGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>

    <filter id="inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feComponentTransfer in="SourceAlpha">
        <feFuncA type="linear" slope="0.7"/>
      </feComponentTransfer>
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feOffset dx="0" dy="3"/>
      <feComposite operator="out" in2="SourceAlpha" result="inverse"/>
      <feFlood flood-color="#000" flood-opacity="0.25" result="color"/>
      <feComposite operator="in" in2="inverse" result="shadow"/>
      <feComposite operator="over" in2="SourceGraphic"/>
    </filter>
  </defs>

  <!-- Base White Circular Canvas Badge -->
  <circle cx="256" cy="256" r="236" fill="#ffffff" filter="url(#circle-shadow)" />

  <g transform="translate(0, -10)">
    <!-- OUTER STAR DOUBLE STROKE -->
    <path d="M 256,92 
             L 288,162 
             L 364,168 
             L 306,218 
             L 323,292 
             L 256,252 
             L 189,292 
             L 206,218 
             L 148,168 
             L 224,162 
             Z"
          fill="none" 
          stroke="url(#starOuterGrad)" 
          stroke-width="32" 
          stroke-linejoin="round" 
          stroke-linecap="round" />

    <!-- INNER STAR HOLLOW/CORE FILL -->
    <path d="M 256,102 
             L 285,166 
             L 354,171 
             L 301,217 
             L 317,285 
             L 256,249 
             L 195,285 
             L 211,217 
             L 158,171 
             L 227,166 
             Z"
          fill="#ffffff" 
          stroke="url(#starGrad)" 
          stroke-width="18" 
          stroke-linejoin="round" 
          stroke-linecap="round" />

    <!-- GOLDEN CHECKMARK -->
    <path d="M 200,240 
             L 242,282 
             L 375,135" 
          fill="none" 
          stroke="url(#goldGrad)" 
          stroke-width="36" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          filter="url(#inner-shadow)" />

    <!-- Checkmark Highlight -->
    <path d="M 200,238 
             L 242,280 
             L 375,133" 
          fill="none" 
          stroke="url(#goldHighlight)" 
          stroke-width="14" 
          stroke-linecap="round" 
          stroke-linejoin="round" />

    <!-- GRADUATION CAP (Mortarboard) -->
    <g transform="translate(68, 86) rotate(-10)">
      <!-- Cap Base -->
      <path d="M 52,56 C 52,68 84,78 120,78 C 156,78 188,68 188,56 L 175,82 C 160,94 130,100 120,100 C 110,100 80,94 65,82 Z" fill="#1e293b" />
      
      <!-- Top Diamond Board -->
      <polygon points="120,16 215,52 120,88 25,52" fill="url(#capGrad)" stroke="#334155" stroke-width="2" />
      <polygon points="120,20 205,52 120,84 35,52" fill="none" stroke="#475569" stroke-width="1.5" opacity="0.6" />

      <!-- Center Button -->
      <circle cx="120" cy="52" r="6" fill="#f59e0b" />

      <!-- Tassel String -->
      <path d="M 120,52 C 95,50 65,60 55,88 C 50,102 46,118 45,132" fill="none" stroke="url(#tasselGrad)" stroke-width="3.5" stroke-linecap="round" />

      <!-- Tassel Ring -->
      <rect x="40" y="118" width="10" height="4" rx="2" fill="#d97706" />

      <!-- Tassel Fringe -->
      <path d="M 45,122 L 32,150 M 45,122 L 38,154 M 45,122 L 45,156 M 45,122 L 52,154 M 45,122 L 58,150" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" />
    </g>
  </g>

  <!-- BRAND TEXT "DSSSBpyq" -->
  <text x="256" y="440" 
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
        font-size="52" 
        font-weight="800" 
        fill="#111827" 
        text-anchor="middle" 
        letter-spacing="-1">
    DSSSB<tspan fill="#1e3a8a">pyq</tspan>
  </text>
</svg>`;

async function main() {
  console.log('Writing public/logo.svg...');
  fs.writeFileSync(path.join(__dirname, 'public/logo.svg'), svgContent, 'utf8');

  // Generate pwa-192.png
  console.log('Generating public/pwa-192.png...');
  await sharp(Buffer.from(svgContent))
    .resize(192, 192)
    .png({ compressionLevel: 9, quality: 90, palette: true })
    .toFile(path.join(__dirname, 'public/pwa-192.png'));

  // Generate pwa-512.png
  console.log('Generating public/pwa-512.png...');
  await sharp(Buffer.from(svgContent))
    .resize(512, 512)
    .png({ compressionLevel: 9, quality: 90, palette: true })
    .toFile(path.join(__dirname, 'public/pwa-512.png'));

  // Generate apple-touch-icon.png (180x180)
  console.log('Generating public/apple-touch-icon.png...');
  await sharp(Buffer.from(svgContent))
    .resize(180, 180)
    .png({ compressionLevel: 9, quality: 90, palette: true })
    .toFile(path.join(__dirname, 'public/apple-touch-icon.png'));

  // Generate favicon.png (64x64)
  console.log('Generating public/favicon.png...');
  await sharp(Buffer.from(svgContent))
    .resize(64, 64)
    .png({ compressionLevel: 9, quality: 90, palette: true })
    .toFile(path.join(__dirname, 'public/favicon.png'));

  console.log('Successfully generated and compressed all logo assets!');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
