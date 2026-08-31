const fs = require('fs');

const syllabusPath = 'src/components/SyllabusTracker.tsx';
let syllabusContent = fs.readFileSync(syllabusPath, 'utf8');

const regex = /export interface SyllabusItem[\s\S]*?export const PART_A_SECTIONS: SyllabusSection\[\] = [\s\S]*?\];/;
const match = syllabusContent.match(regex);

if (match) {
  let examsContent = fs.readFileSync('src/data/dsssbExams.ts', 'utf8');
  examsContent = examsContent.replace("import { LucideIcon } from 'lucide-react';", "import { LucideIcon } from 'lucide-react';\n\n" + match[0]);
  fs.writeFileSync('src/data/dsssbExams.ts', examsContent, 'utf8');
  
  syllabusContent = syllabusContent.replace(match[0], '');
  syllabusContent = syllabusContent.replace("import { DSSSB_EXAMS, ExamInfo } from '../data/dsssbExams';", "import { DSSSB_EXAMS, ExamInfo, SyllabusSection, SyllabusItem } from '../data/dsssbExams';");
  fs.writeFileSync(syllabusPath, syllabusContent, 'utf8');
  console.log("Fixed types and PART_A_SECTIONS");
}
