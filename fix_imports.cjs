const fs = require('fs');

function replaceDynamicImport(file) {
  let content = fs.readFileSync(file, 'utf8');
  // It's possible React is already imported, so let's check
  if (!content.includes("const AdBanner = React.lazy")) {
    content = content.replace("import AdBanner from './AdBanner';", "const AdBanner = React.lazy(() => import('./AdBanner'));");
  }
  fs.writeFileSync(file, content, 'utf8');
}

['src/components/CommonDsssbHub.tsx', 'src/components/SyllabusTracker.tsx', 'src/components/TgtCsHub.tsx'].forEach(replaceDynamicImport);
