const fs = require('fs');

function replaceDynamicImport(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("import AdBanner from './AdBanner';", "import React from 'react';\nconst AdBanner = React.lazy(() => import('./AdBanner'));");
  fs.writeFileSync(file, content, 'utf8');
}

['src/components/CommonDsssbHub.tsx', 'src/components/SyllabusTracker.tsx', 'src/components/TgtCsHub.tsx'].forEach(replaceDynamicImport);
