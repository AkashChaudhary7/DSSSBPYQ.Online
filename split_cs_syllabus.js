import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Universal CS Syllabus Topic Splitter & Normalizer
 * Automatically detects ANY uploaded CS JSON file in root (or subfolder),
 * normalizes option formats, answer indices, question fields,
 * categorizes into the correct public/Computer/<Topic> folder,
 * splits into 50-question mock tests,
 * and triggers sync_and_generate.js to update sitemap & index.json.
 */

// List of system files to ignore when looking for uploaded JSON files
const IGNORE_JSON_FILES = new Set([
  'package.json',
  'tsconfig.json',
  'manifest.json',
  'metadata.json',
  'firebase-applet-config.json',
  'firebase-blueprint.json',
  'bun.lock',
  'index.json',
  'quizzes-metadata.json'
]);

// CS Syllabus Topic Name Mapper
function determineCsTopicFolder(filename, firstQuestion = {}) {
  const name = (filename + ' ' + (firstQuestion.section || firstQuestion.topic || '')).toLowerCase();

  if (name.includes('operating_system') || name.includes('operating system') || name.includes('os_') || name.includes(' os ') || name.includes('process_management') || name.includes('deadlock') || name.includes('scheduling') || name.includes('question_part') || name.includes('questions_part') || name.includes('os mock')) {
    return 'Operating Systems';
  }
  if (name.includes('dbms') || name.includes('database') || name.includes('sql') || name.includes('rdbms') || name.includes('normalization')) {
    return 'Database Management System (DBMS)';
  }
  if (name.includes('network security') || name.includes('security') || name.includes('cryptography') || name.includes('cyber')) {
    return 'Computer Network Security';
  }
  if (name.includes('network') || name.includes('cn_') || name.includes('osi') || name.includes('tcp') || name.includes('ip_address')) {
    return 'Computer Networks';
  }
  if (name.includes('algorithm') || name.includes('daa') || name.includes('sorting') || name.includes('searching')) {
    return 'Design and Analysis of Algorithms (DAA)';
  }
  if (name.includes('data_structure') || name.includes('data structure') || name.includes('ds_') || name.includes('c_programming') || name.includes('c++') || name.includes('cpp')) {
    return 'Programming in C, C++ & Data Structures';
  }
  if (name.includes('digital') || name.includes('boolean') || name.includes('logic_gate') || name.includes('flip_flop') || name.includes('kmap')) {
    return 'Digital Electronics';
  }
  if (name.includes('architecture') || name.includes('coa') || name.includes('microprocessor') || name.includes('assembly')) {
    return 'Computer Architecture';
  }
  if (name.includes('software_engineering') || name.includes('software engineering') || name.includes('sdlc') || name.includes('testing')) {
    return 'Software Engineering';
  }
  if (name.includes('python')) {
    return 'Python Programming & Basics';
  }
  if (name.includes('java')) {
    return 'Java Programming and Website Design';
  }
  if (name.includes('web') || name.includes('html') || name.includes('css') || name.includes('javascript') || name.includes('frontend')) {
    return 'Front End Designed Tools';
  }
  if (name.includes('linux') || name.includes('unix') || name.includes('shell')) {
    return 'Linux Environment';
  }
  if (name.includes('discrete') || name.includes('matrix') || name.includes('linear_algebra')) {
    return 'Mathematics - I, II, III, IV';
  }
  if (name.includes('pc_software') || name.includes('office') || name.includes('word') || name.includes('excel')) {
    return 'Computer Basics and P.C. Software';
  }
  if (name.includes('fundamentals') || name.includes('basics_of_computer') || name.includes('it_')) {
    return 'Fundamentals of Information Technology';
  }
  if (name.includes('graphics') || name.includes('multimedia')) {
    return 'Computer Graphics & Multimedia Applications';
  }
  if (name.includes('e-commerce') || name.includes('ecommerce')) {
    return 'E-Commerce';
  }

  // Fallback cleanly formatted topic name based on filename
  const baseName = path.basename(filename, '.json')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  return baseName;
}

function normalizeOptions(opts) {
  if (Array.isArray(opts)) {
    return opts.map(o => String(o).trim());
  }
  if (opts && typeof opts === 'object') {
    const keys = Object.keys(opts).sort();
    const result = [];
    for (const key of keys) {
      result.push(String(opts[key]).trim());
    }
    if (result.length > 0) return result;
  }
  return ['Option A', 'Option B', 'Option C', 'Option D'];
}

function normalizeAnswer(ans, options) {
  if (typeof ans === 'number') {
    // If 1-indexed (1, 2, 3, 4)
    if (ans >= 1 && ans <= 4 && options.length === 4) {
      return ans - 1;
    }
    return ans;
  }

  if (typeof ans === 'string') {
    const trimmed = ans.trim().toUpperCase();
    if (trimmed === 'A' || trimmed === '1') return 0;
    if (trimmed === 'B' || trimmed === '2') return 1;
    if (trimmed === 'C' || trimmed === '3') return 2;
    if (trimmed === 'D' || trimmed === '4') return 3;

    if (trimmed.startsWith('A') || trimmed.startsWith('A)')) return 0;
    if (trimmed.startsWith('B') || trimmed.startsWith('B)')) return 1;
    if (trimmed.startsWith('C') || trimmed.startsWith('C)')) return 2;
    if (trimmed.startsWith('D') || trimmed.startsWith('D)')) return 3;

    // Check literal option match
    const optIndex = options.findIndex(o => o.toLowerCase() === trimmed.toLowerCase());
    if (optIndex !== -1) {
      return optIndex;
    }
  }

  return 0;
}

function findCandidateJsonFiles(dir = '.') {
  const candidates = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (file.endsWith('.json') && !IGNORE_JSON_FILES.has(file)) {
      const filePath = path.join(dir, file);
      try {
        const stats = fs.statSync(filePath);
        // Look for JSON files larger than 500 bytes
        if (stats.size > 500) {
          candidates.push(filePath);
        }
      } catch (_) {}
    }
  }
  return candidates;
}

function processJsonFile(filePath) {
  console.log(`\n==================================================`);
  console.log(`Processing file: "${filePath}"`);
  console.log(`==================================================`);

  let rawData;
  try {
    rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Failed to parse JSON from ${filePath}:`, err.message);
    return;
  }

  let questions = [];
  if (Array.isArray(rawData)) {
    questions = rawData;
  } else if (rawData.questions && Array.isArray(rawData.questions)) {
    questions = rawData.questions;
  } else if (rawData.data && Array.isArray(rawData.data)) {
    questions = rawData.data;
  } else if (typeof rawData === 'object') {
    for (const key of Object.keys(rawData)) {
      if (Array.isArray(rawData[key])) {
        questions = rawData[key];
        break;
      }
    }
  }

  if (questions.length === 0) {
    console.log(`No valid questions array found in "${filePath}". Skipping.`);
    return;
  }

  const topicName = determineCsTopicFolder(path.basename(filePath), questions[0] || {});
  console.log(`Topic Folder Identified: "public/Computer/${topicName}"`);
  console.log(`Total questions in file: ${questions.length}`);

  const targetDir = path.join('public', 'Computer', topicName);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  } else {
    // Clear existing mock test files in topic folder to prevent orphaned or stale mock tests
    const existingFiles = fs.readdirSync(targetDir);
    for (const f of existingFiles) {
      if (f.endsWith('.json')) {
        try {
          fs.unlinkSync(path.join(targetDir, f));
        } catch (_) {}
      }
    }
  }

  const questionsPerMock = 50;
  const mockCount = Math.ceil(questions.length / questionsPerMock);

  for (let mockIdx = 0; mockIdx < mockCount; mockIdx++) {
    const startIdx = mockIdx * questionsPerMock;
    const endIdx = Math.min(startIdx + questionsPerMock, questions.length);
    const slice = questions.slice(startIdx, endIdx);

    const mockQuestions = slice.map((q, idx) => {
      const rawQ = q.question || q.q || q.text || q.questionText || `Question ${idx + 1}`;
      const opts = normalizeOptions(q.options || q.opts || q.choices || q.answers);
      const ans = normalizeAnswer(q.answer || q.correct_answer || q.correct || q.ans || 0, opts);
      const exp = q.explanation || q.exp || q.reason || q.solution || `Correct Answer: Option ${String.fromCharCode(65 + ans)}.`;

      return {
        id: idx + 1,
        section: "Computer Science",
        question: rawQ,
        question_image: q.question_image || null,
        options: opts,
        option_images: q.option_images || [],
        answer: ans,
        explanation: exp,
        explanation_image: q.explanation_image || null
      };
    });

    const testNum = mockIdx + 1;
    const isOS = topicName === 'Operating Systems';
    const testTitle = isOS ? `OS Mock ${testNum}` : `${topicName} Mock Test ${testNum}`;
    const quizData = {
      test_title: testTitle,
      total_questions: mockQuestions.length,
      category: "part_b",
      subject: "Computer Science",
      topic: isOS ? "Operating System" : topicName,
      isPartA: false,
      questions: mockQuestions
    };

    const outFileName = isOS ? `OS Mock ${testNum}.json` : `${topicName} Mock Test ${testNum}.json`;
    const outFilePath = path.join(targetDir, outFileName);
    fs.writeFileSync(outFilePath, JSON.stringify(quizData, null, 2), 'utf8');
    console.log(`  ✓ Generated: "${outFilePath}" (${mockQuestions.length} questions)`);
  }

  console.log(`Created ${mockCount} mock test files for "${topicName}".`);
}

function main() {
  console.log('🚀 Universal CS Syllabus Mock Test Splitter Starting...');
  const files = findCandidateJsonFiles('.');

  if (files.length === 0) {
    console.log('No uploaded candidate JSON files found in root directory.');
    console.log('Place your syllabus JSON file (e.g. Operating_system.json, DBMS.json, Python.json, etc.) in the root folder and re-run.');
    return;
  }

  console.log(`Found ${files.length} candidate file(s) to process:`, files);
  for (const file of files) {
    processJsonFile(file);
  }

  console.log('\n🔄 Running sync_and_generate.js to sync index & generate sitemap...');
  try {
    execSync('node sync_and_generate.js', { stdio: 'inherit' });
    console.log('\n✨ All CS syllabus mock tests synced and ready!');
  } catch (err) {
    console.error('Error running sync_and_generate.js:', err.message);
  }
}

main();
