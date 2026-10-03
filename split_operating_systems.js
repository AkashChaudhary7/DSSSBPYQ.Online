import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function findAllUploadedFiles() {
  const ignoreList = new Set([
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

  const files = fs.readdirSync('.');
  const candidateFiles = [];

  for (const file of files) {
    if (file.endsWith('.json') && !ignoreList.has(file)) {
      try {
        const stats = fs.statSync(file);
        if (stats.size > 200) { // bigger than 200 bytes
          candidateFiles.push(file);
        }
      } catch (_) {}
    }
  }

  // Sort candidate files numerically if they have numbers
  candidateFiles.sort((a, b) => {
    const numA = (a.match(/\d+/) || [0])[0];
    const numB = (b.match(/\d+/) || [0])[0];
    return Number(numA) - Number(numB);
  });

  return candidateFiles;
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
    if (result.length > 0) {
      return result;
    }
  }
  return ['Option A', 'Option B', 'Option C', 'Option D'];
}

function normalizeAnswer(ans, options) {
  if (typeof ans === 'number') {
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

    // Check if it matches option prefix like "A)", "B)"
    if (trimmed.startsWith('A')) return 0;
    if (trimmed.startsWith('B')) return 1;
    if (trimmed.startsWith('C')) return 2;
    if (trimmed.startsWith('D')) return 3;

    // Check if it is the literal string value of one of the options
    const optIndex = options.findIndex(o => o.toLowerCase() === trimmed.toLowerCase());
    if (optIndex !== -1) {
      return optIndex;
    }
  }

  return 0;
}

function run() {
  console.log('--- Operating System Mock Test Splitter & Parser ---');
  const files = findAllUploadedFiles();

  if (files.length === 0) {
    console.log('No uploaded Operating System JSON file found in root directory.');
    console.log('Please upload your JSON file (e.g., "question_part1.json" or "Operating_system.json") to the root of the project.');
    console.log('Once uploaded, execute: node split_operating_systems.js');
    return;
  }

  console.log(`Found ${files.length} uploaded file(s): ${files.join(', ')}`);
  
  let allQuestions = [];
  for (const file of files) {
    try {
      const rawData = JSON.parse(fs.readFileSync(file, 'utf8'));
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
      if (questions.length > 0) {
        console.log(`Parsed ${questions.length} questions from ${file}.`);
        allQuestions.push(...questions);
      }
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
    }
  }

  if (allQuestions.length === 0) {
    console.error('Could not find any questions inside the uploaded JSON files.');
    return;
  }

  console.log(`Total questions gathered across all files: ${allQuestions.length}`);

  const questionsPerMock = 50;
  const mockCount = Math.ceil(allQuestions.length / questionsPerMock);
  console.log(`Splitting into ${mockCount} mock tests with up to ${questionsPerMock} questions each...`);

  // Target directory
  const targetDir = path.join('public', 'Computer', 'Operating Systems');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (let mockIdx = 0; mockIdx < mockCount; mockIdx++) {
    const startIdx = mockIdx * questionsPerMock;
    const endIdx = Math.min(startIdx + questionsPerMock, allQuestions.length);
    const mockQuestionsRaw = allQuestions.slice(startIdx, endIdx);

    const mockQuestions = mockQuestionsRaw.map((q, idx) => {
      const rawQuestion = q.question || q.q || q.text || q.questionText || `Question ${idx + 1}`;
      const rawOptions = normalizeOptions(q.options || q.opts || q.choices || q.answers);
      const rawAnswer = normalizeAnswer(q.answer || q.correct_answer || q.ans || q.correct || 0, rawOptions);
      const rawExplanation = q.explanation || q.exp || q.reason || q.solution || `Correct Answer: Option ${String.fromCharCode(65 + rawAnswer)}.`;

      return {
        id: idx + 1,
        section: "Computer Science",
        question: rawQuestion,
        question_image: q.question_image || null,
        options: rawOptions,
        option_images: q.option_images || [],
        answer: rawAnswer,
        explanation: rawExplanation,
        explanation_image: q.explanation_image || null
      };
    });

    const testNum = mockIdx + 1;
    const testTitle = `OS Mock ${testNum}`;
    const quizData = {
      test_title: testTitle,
      total_questions: mockQuestions.length,
      category: "part_b",
      subject: "Computer Science",
      topic: "Operating System",
      isPartA: false,
      questions: mockQuestions
    };

    const fileName = `OS Mock ${testNum}.json`;
    const filePath = path.join(targetDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(quizData, null, 2), 'utf8');
    console.log(`  ✓ Generated: "${filePath}" (${mockQuestions.length} questions)`);
  }

  console.log(`\nSuccessfully created ${mockCount} Operating System mock test files in "public/Computer/Operating Systems/"!`);

  // Run the sitemap and index compiler
  console.log('Running sync_and_generate.js to update index and sitemap...');
  try {
    execSync('node sync_and_generate.js', { stdio: 'inherit' });
  } catch (err) {
    console.error('Error executing sync_and_generate.js:', err.message);
  }

  console.log('\nAll set! The Operating System mock tests have been created and synced.');
}

run();
