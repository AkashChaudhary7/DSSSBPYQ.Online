import fs from 'fs';
import path from 'path';

const files = fs.readdirSync('.').filter(f => f.startsWith('mock_test_') && f.endsWith('.json'));

console.log(`Found ${files.length} mock test files.`);

const compliant20 = [];
const compliant100 = [];
const nonCompliant = [];

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const qCount = data.questions ? data.questions.length : 0;
    const title = data.test_title || data.title || 'Untitled';
    
    if (qCount === 20) {
      compliant20.push({ file, title, qCount });
    } else if (qCount === 100) {
      compliant100.push({ file, title, qCount });
    } else {
      nonCompliant.push({ file, title, qCount });
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
}

console.log('\n--- COMPLIANT SUBJECT MOCKS (20 QUESTIONS) ---');
console.log(`Total: ${compliant20.length}`);
compliant20.forEach(c => console.log(`  ${c.file}: "${c.title}" (${c.qCount} questions)`));

console.log('\n--- COMPLIANT FULL MOCKS (100 QUESTIONS) ---');
console.log(`Total: ${compliant100.length}`);
compliant100.forEach(c => console.log(`  ${c.file}: "${c.title}" (${c.qCount} questions)`));

console.log('\n--- NON-COMPLIANT MOCKS (TO BE REMOVED) ---');
console.log(`Total: ${nonCompliant.length}`);
nonCompliant.forEach(c => console.log(`  ${c.file}: "${c.title}" (${c.qCount} questions)`));
