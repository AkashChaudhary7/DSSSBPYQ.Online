const fs = require('fs');

const syllabusPath = 'src/components/SyllabusTracker.tsx';
let syllabusContent = fs.readFileSync(syllabusPath, 'utf8');

// The array ends with \n];
const startIdx = syllabusContent.indexOf('export const DSSSB_EXAMS: ExamInfo[] = [');
const endIdx = syllabusContent.indexOf('\n];', startIdx);

if (startIdx > -1 && endIdx > -1) {
  const match = syllabusContent.substring(startIdx, endIdx + 3);
  
  // need ExamInfo interface too
  const typeStart = syllabusContent.indexOf('export interface ExamInfo {');
  const typeEnd = syllabusContent.indexOf('}', typeStart);
  let typeStr = '';
  if (typeStart > -1 && typeEnd > -1) {
    typeStr = syllabusContent.substring(typeStart, typeEnd + 1);
  }
  
  const fileContent = "import { LucideIcon } from 'lucide-react';\n\n" + typeStr + "\n\n" + match;
  fs.writeFileSync('src/data/dsssbExams.ts', fileContent, 'utf8');
  
  let newContent = syllabusContent.replace(typeStr, '');
  newContent = newContent.replace(match, "import { DSSSB_EXAMS, ExamInfo } from '../data/dsssbExams';");
  fs.writeFileSync(syllabusPath, newContent, 'utf8');
  console.log("Moved DSSSB_EXAMS");
}

const appPath = 'src/App.tsx';
let appContent = fs.readFileSync(appPath, 'utf8');
appContent = appContent.replace("import { DSSSB_EXAMS } from './components/SyllabusTracker';", "import { DSSSB_EXAMS } from './data/dsssbExams';");
fs.writeFileSync(appPath, appContent, 'utf8');
