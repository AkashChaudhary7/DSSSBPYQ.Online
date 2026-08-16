const fs = require('fs');
let content = fs.readFileSync('src/components/FooterWithCompliance.tsx', 'utf8');

const target1 = '<button id="privacy-policy-link" onClick={() => setActivePolicy(\'privacy\')} className="hover:text-blue-300 transition-colors cursor-pointer bg-transparent border-0">Privacy Policy</button>';
const rep1 = '<a id="privacy-policy-link" href="/privacypolicy" className="hover:text-blue-300 transition-colors">Privacy Policy</a>';

const target2 = '<button id="terms-conditions-link" onClick={() => setActivePolicy(\'terms\')} className="hover:text-blue-300 transition-colors cursor-pointer bg-transparent border-0">Terms & Conditions</button>';
const rep2 = '<a id="terms-conditions-link" href="/terms" className="hover:text-blue-300 transition-colors">Terms & Conditions</a>';

content = content.replace(target1, rep1);
content = content.replace(target2, rep2);

fs.writeFileSync('src/components/FooterWithCompliance.tsx', content, 'utf8');
