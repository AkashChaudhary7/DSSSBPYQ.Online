import fs from 'fs';
import path from 'path';

// Find all mock test .json files recursively (excluding config and system files)
function findJsonFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  const ignoreFiles = new Set([
    'package.json',
    'tsconfig.json',
    'manifest.json',
    'assetlinks.json',
    'metadata.json',
    'firebase-applet-config.json',
    'firebase-blueprint.json',
    'wrangler.json',
    'wrangler.jsonc',
    'wrangler.toml',
    'bun.lock'
  ]);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file === 'android' || file === '.git' || file === 'content' || file === 'assets' || file === '.aistudio' || file === '.well-known') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findJsonFiles(filePath, fileList);
    } else if (file.endsWith('.json') && !ignoreFiles.has(file)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFilePaths = findJsonFiles('.');

console.log(`Auditing and syncing ${allFilePaths.length} mock test files...`);

// Ensure public/content directory exists
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}
if (!fs.existsSync('public/content')) {
  fs.mkdirSync('public/content');
}

// Official 32 DOE Computer Science Topic Folders Definition
const COMPUTER_32_TOPICS = [
  { code: 'DOE-01', title: 'Mathematics - I, II, III, IV', folder: 'Mathematics - I, II, III, IV' },
  { code: 'DOE-02', title: 'Business Communication, Organization & Management', folder: 'Business Communication, Organization & Management' },
  { code: 'DOE-03', title: 'Computer Basics and P.C. Software', folder: 'Computer Basics and P.C. Software' },
  { code: 'DOE-04', title: 'Programming in C, C++ & Data Structures', folder: 'Programming in C, C++ & Data Structures' },
  { code: 'DOE-05', title: 'Fundamentals of Information Technology', folder: 'Fundamentals of Information Technology' },
  { code: 'DOE-06', title: 'Basis of Physics', folder: 'Basis of Physics' },
  { code: 'DOE-07', title: 'Digital Electronics', folder: 'Digital Electronics' },
  { code: 'DOE-08', title: 'Database Management System (DBMS)', folder: 'Database Management System (DBMS)' },
  { code: 'DOE-09', title: 'Computer Architecture', folder: 'Computer Architecture' },
  { code: 'DOE-10', title: 'Front End Designed Tools', folder: 'Front End Designed Tools' },
  { code: 'DOE-11', title: 'Financial Accounting', folder: 'Financial Accounting' },
  { code: 'DOE-12', title: 'Object/Computer Oriented Programming / Numerical Techniques', folder: 'Object-Computer Oriented Programming - Numerical Techniques' },
  { code: 'DOE-13', title: 'Software Engineering', folder: 'Software Engineering' },
  { code: 'DOE-14', title: 'Java Programming and Website Design', folder: 'Java Programming and Website Design' },
  { code: 'DOE-15', title: 'Operating Systems', folder: 'Operating Systems' },
  { code: 'DOE-16', title: 'Business Economics', folder: 'Business Economics' },
  { code: 'DOE-17', title: 'Computer Networks', folder: 'Computer Networks' },
  { code: 'DOE-18', title: '.NET Programming', folder: '.NET Programming' },
  { code: 'DOE-19', title: 'Linux Environment', folder: 'Linux Environment' },
  { code: 'DOE-20', title: 'E-Commerce', folder: 'E-Commerce' },
  { code: 'DOE-21', title: 'Design and Analysis of Algorithms (DAA)', folder: 'Design and Analysis of Algorithms (DAA)' },
  { code: 'DOE-22', title: 'Computer Network Security', folder: 'Computer Network Security' },
  { code: 'DOE-23', title: 'Management Information System (MIS)', folder: 'Management Information System (MIS)' },
  { code: 'DOE-24', title: 'Mobile Computing', folder: 'Mobile Computing' },
  { code: 'DOE-25', title: 'Computer Graphics & Multimedia Applications', folder: 'Computer Graphics & Multimedia Applications' },
  { code: 'DOE-26', title: 'Internet Programming', folder: 'Internet Programming' },
  { code: 'DOE-27', title: 'Knowledge Management & New Economy', folder: 'Knowledge Management & New Economy' },
  { code: 'DOE-28', title: 'Foundation Course in English', folder: 'Foundation Course in English' },
  { code: 'DOE-29', title: 'Problem Solving & Programming', folder: 'Problem Solving & Programming' },
  { code: 'DOE-30', title: 'Statistical Techniques', folder: 'Statistical Techniques' },
  { code: 'DOE-31', title: 'TCP / Protocols', folder: 'TCP - Protocols' },
  { code: 'DOE-32', title: 'Interpolation', folder: 'Interpolation' }
];

// Pre-create all 32 Computer Science Topic Folders under public/Computer/
for (const topicItem of COMPUTER_32_TOPICS) {
  const topicFolderPath = path.join('public', 'Computer', topicItem.folder);
  if (!fs.existsSync(topicFolderPath)) {
    fs.mkdirSync(topicFolderPath, { recursive: true });
  }
}

// Function to map a quiz's subject to its respective public subfolder
function getSubjectFolder(data, fileName, sourcePath = '') {
  let questions = [];
  if (Array.isArray(data)) {
    questions = data;
  } else if (data.questions && Array.isArray(data.questions)) {
    questions = data.questions;
  }

  const normalizedPath = sourcePath.replace(/\\/g, '/');
  const lowerPath = normalizedPath.toLowerCase();

  // Direct check if source path is already inside public/Computer/<subFolder>/
  const computerSubFolderMatch = normalizedPath.match(/public\/Computer\/([^/]+)/i);
  if (computerSubFolderMatch && computerSubFolderMatch[1]) {
    return `Computer/${computerSubFolderMatch[1]}`;
  }

  // Direct shorthand folder checks
  if (
    lowerPath.startsWith('cn/') ||
    lowerPath.includes('/cn/') || 
    lowerPath.includes('/computer_networks/') || 
    lowerPath.includes('/computer networks/') || 
    lowerPath.includes('computer network') ||
    lowerPath.includes('cn_mock') ||
    lowerPath.includes('cn mock')
  ) {
    return 'Computer/Computer Networks';
  }

  if (
    lowerPath.startsWith('os/') ||
    lowerPath.includes('/os/') || 
    lowerPath.includes('/operating_systems/') || 
    lowerPath.includes('/operating systems/') ||
    lowerPath.includes('os_mock') ||
    lowerPath.includes('os mock')
  ) {
    return 'Computer/Operating Systems';
  }

  if (
    lowerPath.startsWith('dbms/') ||
    lowerPath.includes('/dbms/') || 
    lowerPath.includes('/database/')
  ) {
    return 'Computer/Database Management System (DBMS)';
  }

  if (
    lowerPath.startsWith('ga/') ||
    lowerPath.includes('/ga/') ||
    lowerPath.startsWith('general_awareness/')
  ) {
    return 'General Awareness';
  }

  if (
    lowerPath.startsWith('math/') ||
    lowerPath.startsWith('maths/') ||
    lowerPath.startsWith('quant/') ||
    lowerPath.startsWith('quants/')
  ) {
    return 'Mathematics';
  }

  if (lowerPath.startsWith('reasoning/')) {
    return 'Reasoning';
  }

  if (lowerPath.startsWith('english/')) {
    return 'English';
  }

  if (lowerPath.startsWith('hindi/')) {
    return 'Hindi';
  }

  if (lowerPath.startsWith('teaching/') || lowerPath.startsWith('pedagogy/')) {
    return 'Teaching';
  }

  // Scan sections
  const sections = Array.from(new Set(
    questions.map(q => String(q.section || q.topic || '').trim())
  )).filter(Boolean);

  let searchStr = '';
  if (sections.length > 0) {
    searchStr = sections.join(' ');
  } else {
    searchStr = (data.subject || '') + ' ' + (data.topic || '');
  }
  
  // Add filename, path and title to search string
  searchStr += ' ' + fileName + ' ' + (data.test_title || data.title || '') + ' ' + lowerPath;
  const name = searchStr.toLowerCase();

  const qCount = questions.length;
  if (qCount >= 100 || name.includes('full mock') || name.includes('full cbt') || name.includes('full paper')) {
    if (qCount >= 200 || name.includes('200 marks') || name.includes('200 q') || name.includes('full cbt')) {
      return 'Full Mocks';
    }
    return 'Part A full Mocks';
  }

  // Part A Subjects Mapping
  if (name.includes('arithmetic') || name.includes('numerical') || name.includes('quant') || name.includes('math')) {
    return 'Mathematics';
  }
  if (name.includes('reasoning') || name.includes('intelligence')) {
    return 'Reasoning';
  }
  if (name.includes('awareness') || name.includes('knowledge') || name.includes('current affairs') || name.includes('general awareness') || name.includes('gk') || name.includes('ga')) {
    return 'General Awareness';
  }
  if (name.includes('english')) {
    return 'English';
  }
  if (name.includes('hindi')) {
    return 'Hindi';
  }
  if (name.includes('teaching') || name.includes('pedagogy') || name.includes('methodology')) {
    return 'Teaching';
  }

  // Computer Science - 32 Modules & Topics Syllabus Mapping
  if (name.includes('dbms') || name.includes('database') || name.includes('sql') || name.includes('er diagram') || name.includes('normalization') || name.includes('concurrency')) {
    return 'Computer/Database Management System (DBMS)';
  }
  if (name.includes('operating system') || name.includes('operating_system') || name.includes('os ') || name.includes('os_') || name.includes('process management') || name.includes('scheduling') || name.includes('deadlock') || name.includes('paging') || name.includes('virtual memory') || name.includes('question_part') || name.includes('questions_part') || name.includes('os mock') || name.includes('os_mock')) {
    return 'Computer/Operating Systems';
  }
  if (name.includes('discrete') || name.includes('set theory') || name.includes('matrix') || name.includes('determinant') || name.includes('linear algebra') || name.includes('vector')) {
    return 'Computer/Mathematics - I, II, III, IV';
  }
  if (name.includes('pc software') || name.includes('office suite') || name.includes('word') || name.includes('excel') || name.includes('powerpoint')) {
    return 'Computer/Computer Basics and P.C. Software';
  }
  if (name.includes('programming in c') || name.includes('programming in c++') || name.includes('stack') || name.includes('queue') || name.includes('linked list') || name.includes('tree') || name.includes('data structures') || name.includes('data structure')) {
    if (name.includes('algorithm') || name.includes('daa')) {
      return 'Computer/Design and Analysis of Algorithms (DAA)';
    }
    return 'Computer/Programming in C, C++ & Data Structures';
  }
  if (name.includes('it infrastructure') || name.includes('it fundamentals') || name.includes('information technology') || name.includes('generations of computer')) {
    return 'Computer/Fundamentals of Information Technology';
  }
  if (name.includes('physics') || name.includes('semiconductor') || name.includes('diode') || name.includes('transistor')) {
    return 'Computer/Basis of Physics';
  }
  if (name.includes('digital') || name.includes('boolean') || name.includes('k-map') || name.includes('logic gate') || name.includes('flip-flop') || name.includes('sequential circuit')) {
    return 'Computer/Digital Electronics';
  }
  if (name.includes('architecture') || name.includes('assembly') || name.includes('instruction') || name.includes('register') || name.includes('pipelining') || name.includes('microprocessor') || name.includes('coa') || name.includes('organization and architecture')) {
    return 'Computer/Computer Architecture';
  }
  if (name.includes('front end') || name.includes('web design') || name.includes('html') || name.includes('css') || name.includes('javascript') || name.includes('dom')) {
    if (name.includes('internet programming')) {
      return 'Computer/Internet Programming';
    }
    return 'Computer/Front End Designed Tools';
  }
  if (name.includes('accounting') || name.includes('journal') || name.includes('ledger') || name.includes('trial balance') || name.includes('balance sheet')) {
    return 'Computer/Financial Accounting';
  }
  if (name.includes('numerical techniques') || name.includes('bisection') || name.includes('newton') || name.includes('numerical analysis') || name.includes('root finding')) {
    return 'Computer/Object/Computer Oriented Programming / Numerical Techniques';
  }
  if (name.includes('software engineering') || name.includes('sdlc') || name.includes('waterfall') || name.includes('testing') || name.includes('metrics') || name.includes('cocomo') || name.includes('uml')) {
    return 'Computer/Software Engineering';
  }
  if (name.includes('java programming') || name.includes('java ') || name.includes('jvm') || name.includes('multithreading') || name.includes('servlet') || name.includes('jsp')) {
    return 'Computer/Java Programming and Website Design';
  }
  if (name.includes('economics') || name.includes('demand') || name.includes('supply') || name.includes('monopoly') || name.includes('market structure')) {
    return 'Computer/Business Economics';
  }
  if (name.includes('network') || name.includes('osi') || name.includes('tcp') || name.includes('protocol') || name.includes('ip addressing') || name.includes('subnetting') || name.includes('routing')) {
    if (name.includes('security') || name.includes('cryptography')) {
      return 'Computer/Computer Network Security';
    }
    return 'Computer/Computer Networks';
  }
  if (name.includes('.net') || name.includes('c#') || name.includes('asp.net') || name.includes('ado.net')) {
    return 'Computer/.NET Programming';
  }
  if (name.includes('linux') || name.includes('unix') || name.includes('shell') || name.includes('chmod')) {
    return 'Computer/Linux Environment';
  }
  if (name.includes('e-commerce') || name.includes('edi') || name.includes('payment gateway') || name.includes('b2b') || name.includes('b2c')) {
    return 'Computer/E-Commerce';
  }
  if (name.includes('algorithms') || name.includes('daa') || name.includes('asymptotic') || name.includes('dynamic programming') || name.includes('greedy')) {
    return 'Computer/Design and Analysis of Algorithms (DAA)';
  }
  if (name.includes('security') || name.includes('cryptography') || name.includes('rsa') || name.includes('firewall') || name.includes('hash')) {
    return 'Computer/Computer Network Security';
  }
  if (name.includes('mis') || name.includes('management information') || name.includes('decision support') || name.includes('erp')) {
    return 'Computer/Management Information System (MIS)';
  }
  if (name.includes('business communication') || name.includes('office automation') || name.includes('organization') || name.includes('management')) {
    return 'Computer/Business Communication, Organization & Management';
  }
  if (name.includes('mobile computing') || name.includes('cellular') || name.includes('gsm') || name.includes('wireless') || name.includes('android')) {
    return 'Computer/Mobile Computing';
  }
  if (name.includes('graphics') || name.includes('multimedia') || name.includes('raster') || name.includes('clipping') || name.includes('sutherland')) {
    return 'Computer/Computer Graphics & Multimedia Applications';
  }
  if (name.includes('internet programming') || name.includes('xml') || name.includes('dtd') || name.includes('xhtml')) {
    return 'Computer/Internet Programming';
  }
  if (name.includes('knowledge management') || name.includes('data mining') || name.includes('artificial intelligence') || name.includes('ai')) {
    return 'Computer/Knowledge Management & New Economy';
  }

  return 'Computer/Computer Basics and P.C. Software';
}

function extractMetadata(data, folder, fileName) {
  let questions = [];
  if (Array.isArray(data)) {
    questions = data;
  } else if (data.questions && Array.isArray(data.questions)) {
    questions = data.questions;
  }
  
  const qCount = questions.length;

  const baseName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const formattedFileNameTitle = baseName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  let title = data.test_title || data.title || formattedFileNameTitle || `Mock Test`;

  if (folder.includes('Operating') || folder.includes('OS') || fileName.toLowerCase().includes('os mock') || fileName.toLowerCase().includes('question_part')) {
    const numMatch = (fileName + ' ' + title).match(/(\d+)/);
    const mockNum = numMatch ? numMatch[1] : '1';
    title = `OS Mock ${mockNum}`;
  } else if (folder.includes('Computer Networks') || folder.includes('CN') || fileName.toLowerCase().includes('computer network') || fileName.toLowerCase().includes('cn_mock') || fileName.toLowerCase().includes('cn mock')) {
    const numMatch = (fileName + ' ' + title).match(/(\d+)/);
    const mockNum = numMatch ? numMatch[1] : '1';
    title = `Computer Networks Mock Test ${mockNum}`;
  }
  
  const sectionsInQuestions = Array.from(new Set(
    questions.map(q => String(q.section || q.topic || '').trim())
  )).filter(Boolean);

  const mappedSections = sectionsInQuestions.map(sec => {
    const name = sec.toLowerCase();
    if (name.includes('arithmetic') || name.includes('numerical') || name.includes('quant') || name.includes('math')) {
      return { category: 'part_a', subject: 'Quantitative Aptitude', topic: 'Arithmetic & Numerical Ability' };
    }
    if (name.includes('reasoning') || name.includes('intelligence')) {
      return { category: 'part_a', subject: 'General Intelligence & Reasoning', topic: 'Reasoning Ability' };
    }
    if (name.includes('awareness') || name.includes('knowledge') || name.includes('current affairs')) {
      return { category: 'part_a', subject: 'General Awareness', topic: 'General Awareness & Current Affairs' };
    }
    if (name.includes('english') || (name.includes('comprehension') && name.includes('english'))) {
      return { category: 'part_a', subject: 'General English', topic: 'English Language & Comprehension' };
    }
    if (name.includes('hindi') || (name.includes('comprehension') && name.includes('hindi'))) {
      return { category: 'part_a', subject: 'General Hindi', topic: 'Hindi Language & Comprehension' };
    }
    if (name.includes('teaching') || name.includes('pedagogy') || name.includes('methodology')) {
      return { category: 'part_b', subject: 'Teaching Methodology', topic: 'Pedagogy & Teaching Methodology' };
    }
    if (name.includes('operating') || name.includes('os')) {
      return { category: 'part_b', subject: 'Computer Science', topic: 'Operating System' };
    }
    if (name.includes('dbms') || name.includes('database')) {
      return { category: 'part_b', subject: 'Computer Science', topic: 'DBMS' };
    }
    if (name.includes('network') || name.includes('security')) {
      return { category: 'part_b', subject: 'Computer Science', topic: 'Computer Networks' };
    }
    if (name.includes('software') && name.includes('engineer')) {
      return { category: 'part_b', subject: 'Computer Science', topic: 'Software Engineering' };
    }
    return { category: 'part_b', subject: 'Computer Science', topic: 'General Practice' };
  });

  const uniqueSubjects = Array.from(new Set(mappedSections.map(m => m.subject)));

  let category = 'part_b';
  let subject = 'Computer Science';
  let topic = 'General Practice';
  let isPartA = false;
  let foldersMatched = false;

  if (folder.startsWith('Computer')) {
    category = 'part_b';
    subject = 'Computer Science';
    const subFolder = folder.replace(/^Computer\/?/, '').trim();
    if (subFolder) {
      const matchedTopic = COMPUTER_32_TOPICS.find(t => 
        t.folder.toLowerCase() === subFolder.toLowerCase() || 
        t.title.toLowerCase() === subFolder.toLowerCase()
      );
      topic = matchedTopic ? matchedTopic.title : subFolder;
    } else {
      const lowerTitle = title.toLowerCase();
      if (folder.includes('DBMS') || lowerTitle.includes('dbms')) topic = 'DBMS';
      else if (folder.includes('Operating') || lowerTitle.includes('operating')) topic = 'Operating System';
      else if (folder.includes('Network') || lowerTitle.includes('network')) topic = 'Computer Networks';
      else if (folder.includes('Software') || lowerTitle.includes('software')) topic = 'Software Engineering';
      else topic = 'Computer Science';
    }
    isPartA = false;
    foldersMatched = true;
  } else if (folder === 'General Awareness') {
    category = 'part_a';
    subject = 'General Awareness';
    topic = 'General Awareness & Current Affairs';
    isPartA = true;
    foldersMatched = true;
  } else if (folder === 'Mathematics') {
    category = 'part_a';
    subject = 'Quantitative Aptitude';
    topic = 'Arithmetic & Numerical Ability';
    isPartA = true;
    foldersMatched = true;
  } else if (folder === 'Reasoning') {
    category = 'part_a';
    subject = 'General Intelligence & Reasoning';
    topic = 'Reasoning Ability';
    isPartA = true;
    foldersMatched = true;
  } else if (folder === 'Teaching') {
    category = 'part_b';
    subject = 'Teaching Methodology';
    topic = 'Pedagogy & Teaching Methodology';
    isPartA = false;
    foldersMatched = true;
  } else if (folder === 'English') {
    category = 'part_a';
    subject = 'General English';
    topic = 'English Language & Comprehension';
    isPartA = true;
    foldersMatched = true;
  } else if (folder === 'Hindi') {
    category = 'part_a';
    subject = 'General Hindi';
    topic = 'Hindi Language & Comprehension';
    isPartA = true;
    foldersMatched = true;
  } else if (folder === 'Part A full Mocks') {
    category = 'full';
    subject = 'Part A Full Mock';
    topic = 'Part A Full Mock Series';
    isPartA = true;
    foldersMatched = true;
  } else if (folder === 'Full Mocks') {
    category = 'full';
    subject = 'Full Mock';
    topic = 'Full CBT Mock Series';
    isPartA = false;
    foldersMatched = true;
  }

  if (!foldersMatched) {
    if (uniqueSubjects.length > 1) {
      const onlyHasPartA = mappedSections.length > 0 && mappedSections.every(m => m.category === 'part_a');
      if (onlyHasPartA) {
        category = 'full';
        subject = 'Part A Full Paper';
        topic = 'Part A Full Paper';
        isPartA = true;
      } else {
        category = 'full';
        subject = 'Full Mock';
        topic = 'Full Mock & PYP';
        isPartA = false;
      }
    } else if (uniqueSubjects.length === 1) {
      const firstMap = mappedSections[0];
      category = firstMap.category;
      subject = firstMap.subject;
      topic = firstMap.topic;
      isPartA = (category === 'part_a');
    }
  }

  if (data.category === 'part_a' || data.category === 'part_b' || data.category === 'full') {
    category = data.category;
  }
  if (data.subject) {
    subject = data.subject;
  }
  if (data.topic) {
    topic = data.topic;
  }
  if (topic.toLowerCase() === 'computer network' || topic.toLowerCase() === 'networks' || topic.toLowerCase() === 'cn') {
    topic = 'Computer Networks';
  }
  if (typeof data.isPartA === 'boolean') {
    isPartA = data.isPartA;
  }

  const testId = data.testId || `custom_${category}_${baseName.toLowerCase().replace(/\s+/g, '_')}_${qCount}`;

  const totalTimeMinutes = typeof data.totalTimeMinutes === 'number' 
    ? data.totalTimeMinutes 
    : Math.max(10, Math.ceil(qCount * 1.2));

  const markingScheme = data.markingScheme && typeof data.markingScheme.correct === 'number' && typeof data.markingScheme.negative === 'number'
    ? data.markingScheme
    : { correct: 1, negative: 0.25 };

  return {
    testId,
    title,
    totalTimeMinutes,
    markingScheme,
    category,
    subject,
    topic,
    isPartA,
    qCount,
    file: `/${folder}/${fileName}`
  };
}

const compliantFiles = [];
const deletedFiles = [];

for (const sourcePath of allFilePaths) {
  try {
    let data = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    let questions = [];
    if (Array.isArray(data)) {
      questions = data;
      data = { questions: questions };
    } else if (data && Array.isArray(data.questions)) {
      questions = data.questions;
    }

    // Standardize every question object
    data.questions = questions.map((q, idx) => {
      const questionText = q.question || q.text || q.q_text || '';
      const rawOptions = q.options || q.choices || q.answers || [];
      const formattedOptions = rawOptions.map(o => String(o ?? '').trim());

      let rawAns = q.answer;
      if (rawAns === undefined || rawAns === null) rawAns = q.correct_answer;
      if (rawAns === undefined || rawAns === null) rawAns = q.correctAnswer;
      if (rawAns === undefined || rawAns === null) rawAns = q.ans;
      if (rawAns === undefined || rawAns === null) rawAns = q.correct;

      let answerIdx = 0;
      if (typeof rawAns === 'number') {
        answerIdx = rawAns;
      } else if (typeof rawAns === 'string') {
        const trimmed = rawAns.trim();
        const upper = trimmed.toUpperCase();
        if (upper === 'A' || upper === '1' || upper.startsWith('A)') || upper.startsWith('OPTION A')) answerIdx = 0;
        else if (upper === 'B' || upper === '2' || upper.startsWith('B)') || upper.startsWith('OPTION B')) answerIdx = 1;
        else if (upper === 'C' || upper === '3' || upper.startsWith('C)') || upper.startsWith('OPTION C')) answerIdx = 2;
        else if (upper === 'D' || upper === '4' || upper.startsWith('D)') || upper.startsWith('OPTION D')) answerIdx = 3;
        else {
          const parsed = parseInt(trimmed, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed < formattedOptions.length) {
            answerIdx = parsed;
          } else {
            const matchIdx = formattedOptions.findIndex(opt => opt.toLowerCase() === trimmed.toLowerCase());
            answerIdx = matchIdx !== -1 ? matchIdx : 0;
          }
        }
      }

      if (answerIdx < 0 || answerIdx >= formattedOptions.length) {
        answerIdx = 0;
      }

      return {
        id: q.id || (idx + 1),
        section: q.section || 'Computer Networks',
        question: questionText,
        options: formattedOptions,
        answer: answerIdx,
        correct_answer: ['A', 'B', 'C', 'D'][answerIdx] || 'A',
        explanation: q.explanation || q.desc || q.explanation_text || ''
      };
    });

    const qCount = data.questions.length;
    
    if (qCount > 0) {
      const folder = getSubjectFolder(data, path.basename(sourcePath), sourcePath);
      
      // Ensure specific public/<folder> directory exists
      const targetDir = path.join('public', folder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      let targetFileName = path.basename(sourcePath);
      if (folder.includes('Operating') || folder.includes('OS')) {
        const numMatch = targetFileName.match(/(\d+)/) || (data.test_title || data.title || '').match(/(\d+)/);
        if (numMatch) {
          targetFileName = `OS Mock ${numMatch[1]}.json`;
        } else {
          targetFileName = `OS Mock 1.json`;
        }
      } else if (folder.includes('Computer Networks') || folder.includes('CN')) {
        const numMatch = targetFileName.match(/(\d+)/) || (data.test_title || data.title || '').match(/(\d+)/);
        if (numMatch) {
          targetFileName = `Computer Networks Mock Test ${numMatch[1]}.json`;
        }
      }

      const destPath = path.join(targetDir, targetFileName);
      if (path.resolve(sourcePath) !== path.resolve(destPath)) {
        // Save formatted data if wrapped
        fs.writeFileSync(sourcePath, JSON.stringify(data, null, 2), 'utf8');
        fs.renameSync(sourcePath, destPath);
        console.log(`Moved compliant file ${path.basename(sourcePath)} to ${destPath}`);
      }
      
      const meta = extractMetadata(data, folder, targetFileName);
      compliantFiles.push(meta);
    } else {
      // Non-compliant! Delete the file
      fs.unlinkSync(sourcePath);
      deletedFiles.push({ file: sourcePath, qCount });
      console.log(`Deleted non-compliant file ${sourcePath} (had ${qCount} questions, expected > 0)`);
    }
  } catch (err) {
    console.error(`Error processing ${sourcePath}:`, err.message);
  }
}

// Build complete topics array with mock counts
const computerTopicsIndex = COMPUTER_32_TOPICS.map(topic => {
  const folderPath = path.join('public', 'Computer', topic.folder);
  let count = 0;
  if (fs.existsSync(folderPath)) {
    const filesInFolder = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
    count = filesInFolder.length;
  }
  return {
    code: topic.code,
    title: topic.title,
    folder: topic.folder,
    path: `/Computer/${topic.folder}`,
    mockCount: count
  };
});

// Write public/content/index.json
const indexData = {
  files: compliantFiles.map(c => c.file).sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, ''), 10);
    const numB = parseInt(b.replace(/[^0-9]/g, ''), 10);
    return numA - numB;
  }),
  computer_topics: computerTopicsIndex
};

fs.writeFileSync('public/content/index.json', JSON.stringify(indexData, null, 2), 'utf8');
console.log(`\nSuccessfully wrote public/content/index.json with ${compliantFiles.length} compliant files and 32 Computer Science topics.`);

// Write public/content/computer_32_topics.json
fs.writeFileSync('public/content/computer_32_topics.json', JSON.stringify(computerTopicsIndex, null, 2), 'utf8');
console.log(`Successfully wrote public/content/computer_32_topics.json with all 32 DOE Computer Science topic metadata.`);

// Write public/content/quizzes-metadata.json
fs.writeFileSync('public/content/quizzes-metadata.json', JSON.stringify(compliantFiles, null, 2), 'utf8');
console.log(`Successfully wrote public/content/quizzes-metadata.json with ${compliantFiles.length} compliant files.`);

// Also write src/data/generatedQuizzesMetadata.ts to bundle all 667 tests directly into static builds
const metadataTsContent = `import { Quiz } from '../types';

export const GENERATED_QUIZZES_METADATA: Quiz[] = ${JSON.stringify(compliantFiles.map(q => ({
  testId: q.testId,
  title: q.title,
  totalTimeMinutes: q.totalTimeMinutes || 60,
  markingScheme: q.markingScheme || { correct: 1, negative: 0.25 },
  category: q.category || 'part_b',
  subject: q.subject || 'Computer Science',
  topic: q.topic || 'General Practice',
  isPartA: q.isPartA ?? (q.category === 'part_a'),
  qCount: q.qCount || 50,
  file: q.file,
  questions: []
})), null, 2)};
`;
fs.writeFileSync('src/data/generatedQuizzesMetadata.ts', metadataTsContent, 'utf8');
console.log(`Successfully wrote src/data/generatedQuizzesMetadata.ts with ${compliantFiles.length} compliant files.`);

// Print beautiful subject and topic-wise summary to console
function printPrettySummary(compliant) {
  const summary = {};
  for (const item of compliant) {
    const categoryName = item.category === 'part_a' ? 'Part A (General)' : (item.category === 'part_b' ? 'Part B (Computer Science & Pedagogy)' : 'Full Length CBT Mocks');
    const subjectName = item.subject || 'Uncategorized';
    const topicName = item.topic || 'General Practice';
    
    if (!summary[categoryName]) {
      summary[categoryName] = {};
    }
    if (!summary[categoryName][subjectName]) {
      summary[categoryName][subjectName] = {};
    }
    if (!summary[categoryName][subjectName][topicName]) {
      summary[categoryName][subjectName][topicName] = 0;
    }
    summary[categoryName][subjectName][topicName]++;
  }

  console.log("\n" + "=".repeat(75));
  console.log("             BYTEPREP: TGT PGT CS - MOCK TESTS SYNC SUMMARY");
  console.log("=".repeat(75));
  
  for (const [category, subjects] of Object.entries(summary)) {
    console.log(`\n📂 Category: \x1b[36m\x1b[1m${category}\x1b[0m`);
    console.log("-".repeat(75));
    
    for (const [subject, topics] of Object.entries(subjects)) {
      console.log(`  🔹 Subject: \x1b[33m${subject}\x1b[0m`);
      
      let totalForSubject = 0;
      for (const [topic, count] of Object.entries(topics)) {
        console.log(`     ▪ \x1b[32m${topic.padEnd(45, '.')}\x1b[0m : \x1b[1m${count}\x1b[0m tests`);
        totalForSubject += count;
      }
      console.log(`     \x1b[90mTotal for ${subject}: ${totalForSubject} tests\x1b[0m`);
    }
  }
  console.log("\n" + "=".repeat(75) + "\n");
}

try {
  printPrettySummary(compliantFiles);
} catch (e) {
  console.warn("Failed to print pretty terminal summary:", e.message);
}

// Generate public/sitemap.xml
const todayStr = new Date().toISOString().split('T')[0];
const staticUrls = [
  { loc: 'https://dsssbpyq.online/', priority: '1.0', changefreq: 'daily' },
  { loc: 'https://dsssbpyq.online/computer-science', priority: '1.0', changefreq: 'daily' },
  { loc: 'https://dsssbpyq.online/general-ability', priority: '0.9', changefreq: 'daily' },
  { loc: 'https://dsssbpyq.online/teaching-methodology', priority: '0.9', changefreq: 'daily' },
  { loc: 'https://dsssbpyq.online/full-mocks', priority: '0.9', changefreq: 'daily' },
  { loc: 'https://dsssbpyq.online/booster', priority: '0.8', changefreq: 'daily' },
  { loc: 'https://dsssbpyq.online/mistakes', priority: '0.8', changefreq: 'daily' },
  { loc: 'https://dsssbpyq.online/syllabus', priority: '0.9', changefreq: 'daily' },
  { loc: 'https://dsssbpyq.online/about-us', priority: '0.6', changefreq: 'monthly' },
  { loc: 'https://dsssbpyq.online/contact-us', priority: '0.6', changefreq: 'monthly' },
  { loc: 'https://dsssbpyq.online/privacypolicy', priority: '0.5', changefreq: 'monthly' },
  { loc: 'https://dsssbpyq.online/terms', priority: '0.5', changefreq: 'monthly' },
  { loc: 'https://dsssbpyq.online/disclaimer', priority: '0.5', changefreq: 'monthly' }
];

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// Add static URLs
for (const url of staticUrls) {
  sitemapXml += `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${todayStr}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>\n`;
}

// Add dynamic mock test URLs sorted by testId
const sortedCompliant = [...compliantFiles].sort((a, b) => a.testId.localeCompare(b.testId));
for (const item of sortedCompliant) {
  sitemapXml += `  <url>\n    <loc>https://dsssbpyq.online/?testId=${encodeURIComponent(item.testId)}</loc>\n    <lastmod>${todayStr}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
}

sitemapXml += `</urlset>\n`;

fs.writeFileSync('public/sitemap.xml', sitemapXml, 'utf8');
console.log(`Successfully wrote public/sitemap.xml with ${staticUrls.length + compliantFiles.length} total URLs.`);

// Clean up empty directories under public/ (e.g. old folders like ga, quants, teaching_methodology, etc.)
function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  const stat = fs.statSync(dir);
  if (!stat.isDirectory()) return;

  let files = fs.readdirSync(dir);
  if (files.length > 0) {
    for (const file of files) {
      removeEmptyDirs(path.join(dir, file));
    }
    // Re-read after cleaning children
    files = fs.readdirSync(dir);
  }

  if (files.length === 0 && dir !== 'public' && dir !== 'public/content' && dir !== 'public/Computer' && !dir.startsWith('public/Computer/') && !dir.startsWith('public\\Computer\\')) {
    fs.rmdirSync(dir);
    console.log(`Removed empty directory: ${dir}`);
  }
}

console.log('Cleaning up empty folders...');
removeEmptyDirs('public');

// Copy index.html to public/404.html for Cloudflare Pages SPA routing
if (fs.existsSync('index.html')) {
  fs.copyFileSync('index.html', 'public/404.html');
  console.log('Successfully generated public/404.html for SPA route fallback.');
}

console.log('Cleanup finished!');
