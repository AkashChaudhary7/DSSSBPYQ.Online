import { Quiz } from '../types';

/**
 * DSSSB TGT Computer Science - Structured Content Index File
 * Includes high-yield built-in mock tests for immediate practice & offline capability
 */

export const PART_A_SUBJECTS = [
  { id: 'General Intelligence & Reasoning', name: 'Reasoning & Intelligence', icon: 'Brain' },
  { id: 'General Awareness', name: 'General Awareness', icon: 'Globe' },
  { id: 'Quantitative Aptitude', name: 'Quantitative Aptitude', icon: 'Calculator' },
  { id: 'General English', name: 'General English', icon: 'BookOpen' },
  { id: 'General Hindi', name: 'General Hindi', icon: 'Languages' },
  { id: 'Full Mock & PYP', name: 'Full Mock & PYP (200 Marks)', icon: 'Trophy' }
] as const;

export const PART_B_TOPICS = [
  { id: 'Operating System', name: 'Operating Systems (OS)', icon: 'Cpu' },
  { id: 'DBMS', name: 'Database Management Systems (DBMS)', icon: 'Database' },
  { id: 'Computer Networks', name: 'Computer Networks & Security', icon: 'Wifi' },
  { id: 'Software Engineering', name: 'Software Engineering & SDLC', icon: 'Code' },
  { id: 'Teaching Methodology', name: 'Pedagogy & Teaching Methodology', icon: 'GraduationCap' }
] as const;

export const FULL_MOCK_CATEGORIES = [
  { id: 'mock', name: 'Mock Test', description: 'Simulated 120 Mins / 200 Marks CBT Exam' },
  { id: 'pyp', name: 'PYP (Previous Year Papers)', description: 'Official DSSSB TGT CS Question Papers' }
] as const;

export const BUILTIN_QUIZZES: Quiz[] = [
  // 1. Part A - Reasoning
  {
    testId: 'part_a_reasoning_1',
    title: 'General Intelligence & Reasoning Official Practice Set 1',
    totalTimeMinutes: 20,
    markingScheme: { correct: 1, negative: 0.25 },
    category: 'part_a',
    subject: 'General Intelligence & Reasoning',
    topic: 'Analogy, Series & Logic',
    testType: 'mock',
    isPartA: true,
    questions: [
      {
        id: 1,
        section: 'General Intelligence & Reasoning',
        question: 'Select the related word from the given alternatives: Doctor : Hospital :: Teacher : ?',
        options: ['Office', 'School', 'Student', 'Classroom'],
        answer: 1,
        explanation: 'A doctor works in a hospital; similarly, a teacher works in a school.'
      },
      {
        id: 2,
        section: 'General Intelligence & Reasoning',
        question: 'If COMPUTER is coded as RFUVQNPC in a certain language, how is MEDICINE coded in that language?',
        options: ['EOJDJEFM', 'EOJDEJFM', 'MFEJDJOE', 'EOJDJEFN'],
        answer: 0,
        explanation: 'Reverse the order of letters and shift each letter (+1). COMPUTER -> RETUPMOC -> RFUVQNPC. MEDICINE -> ENICIDEM -> EOJDJEFM.'
      },
      {
        id: 3,
        section: 'General Intelligence & Reasoning',
        question: 'Find the missing number in the given series: 2, 6, 12, 20, 30, ?',
        options: ['36', '40', '42', '48'],
        answer: 2,
        explanation: 'Pattern: +4, +6, +8, +10, +12. 30 + 12 = 42 (or n^2 + n for n = 1,2,3,4,5,6).'
      },
      {
        id: 4,
        section: 'General Intelligence & Reasoning',
        question: 'Statements: All books are pens. Some pens are pencils. Conclusions: I. Some books are pencils. II. Some pens are books.',
        options: ['Only conclusion I follows', 'Only conclusion II follows', 'Both I and II follow', 'Neither I nor II follows'],
        answer: 1,
        explanation: 'From "All books are pens", it directly converts to "Some pens are books" (Conclusion II is valid). Conclusion I does not necessarily follow.'
      },
      {
        id: 5,
        section: 'General Intelligence & Reasoning',
        question: 'Pointing to a photograph, a man said "I have no brother or sister, but that man\'s father is my father\'s son." Whose photo was it?',
        options: ['His nephew', 'His father', 'His son', 'Himself'],
        answer: 2,
        explanation: '"My father\'s son" = the man himself (since he has no brother/sister). So "that man\'s father is myself" => the photo is of his son.'
      }
    ]
  },

  // 2. Part A - General Awareness
  {
    testId: 'part_a_ga_1',
    title: 'General Awareness & Delhi GK Practice Set 1',
    totalTimeMinutes: 20,
    markingScheme: { correct: 1, negative: 0.25 },
    category: 'part_a',
    subject: 'General Awareness',
    topic: 'Polity, History & Delhi GK',
    testType: 'mock',
    isPartA: true,
    questions: [
      {
        id: 1,
        section: 'General Awareness',
        question: 'Which Articles of the Indian Constitution deal with the Directive Principles of State Policy (DPSP)?',
        options: ['Articles 12 to 35', 'Articles 36 to 51', 'Articles 52 to 78', 'Articles 368'],
        answer: 1,
        explanation: 'DPSP is contained in Part IV (Articles 36 to 51) of the Indian Constitution, borrowed from the Irish Constitution.'
      },
      {
        id: 2,
        section: 'General Awareness',
        question: 'The famous Red Fort (Lal Qila) in Delhi was constructed during the reign of which Mughal Emperor?',
        options: ['Akbar', 'Jahangir', 'Shah Jahan', 'Aurangzeb'],
        answer: 2,
        explanation: 'Shah Jahan commissioned the construction of the Red Fort in 1638 when he decided to shift his capital from Agra to Delhi.'
      },
      {
        id: 3,
        section: 'General Awareness',
        question: 'Which instrument is scientifically used to measure atmospheric pressure?',
        options: ['Thermometer', 'Barometer', 'Anemometer', 'Hygrometer'],
        answer: 1,
        explanation: 'A barometer measures atmospheric pressure, invented by Evangelista Torricelli.'
      },
      {
        id: 4,
        section: 'General Awareness',
        question: 'On which river is the Bhakra Nangal Dam constructed?',
        options: ['Yamuna', 'Sutlej', 'Ganga', 'Jhelum'],
        answer: 1,
        explanation: 'The Bhakra Nangal Dam is a concrete gravity dam built across the Sutlej River in Himachal Pradesh.'
      },
      {
        id: 5,
        section: 'General Awareness',
        question: 'Who is recognized as the chief architect of the Indian Constitution?',
        options: ['Dr. B. R. Ambedkar', 'Dr. Rajendra Prasad', 'Jawaharlal Nehru', 'Sardar Vallabhbhai Patel'],
        answer: 0,
        explanation: 'Dr. B. R. Ambedkar served as the Chairman of the Drafting Committee of the Constituent Assembly.'
      }
    ]
  },

  // 3. Part A - Quantitative Aptitude
  {
    testId: 'part_a_quant_1',
    title: 'Arithmetical & Numerical Ability Official Set 1',
    totalTimeMinutes: 20,
    markingScheme: { correct: 1, negative: 0.25 },
    category: 'part_a',
    subject: 'Quantitative Aptitude',
    topic: 'Time & Distance, Profit & Loss, Averages',
    testType: 'mock',
    isPartA: true,
    questions: [
      {
        id: 1,
        section: 'Quantitative Aptitude',
        question: 'A train 150 meters long crosses a telegraph pole in 10 seconds. What is the speed of the train in km/h?',
        options: ['36 km/h', '45 km/h', '54 km/h', '60 km/h'],
        answer: 2,
        explanation: 'Speed = Distance / Time = 150 / 10 = 15 m/s. Converting to km/h: 15 * (18/5) = 54 km/h.'
      },
      {
        id: 2,
        section: 'Quantitative Aptitude',
        question: 'If the cost price of 12 articles is equal to the selling price of 10 articles, what is the profit percentage?',
        options: ['15%', '20%', '25%', '30%'],
        answer: 1,
        explanation: '12 CP = 10 SP => SP/CP = 12/10 = 6/5. Profit = (6-5)/5 * 100 = 1/5 * 100 = 20%.'
      },
      {
        id: 3,
        section: 'Quantitative Aptitude',
        question: 'The average of 5 consecutive odd numbers is 27. What is the highest number in the set?',
        options: ['29', '31', '33', '35'],
        answer: 1,
        explanation: 'The middle (3rd) number is 27. The numbers are 23, 25, 27, 29, 31. Highest is 31.'
      },
      {
        id: 4,
        section: 'Quantitative Aptitude',
        question: 'A can complete a piece of work in 12 days and B can finish it in 24 days. How many days will they take together?',
        options: ['6 days', '8 days', '9 days', '10 days'],
        answer: 1,
        explanation: 'Combined 1 day work = 1/12 + 1/24 = 3/24 = 1/8. Total time = 8 days.'
      },
      {
        id: 5,
        section: 'Quantitative Aptitude',
        question: 'Find the compound interest on ₹10,000 at 10% per annum for 2 years compounded annually.',
        options: ['₹2,000', '₹2,100', '₹2,200', '₹2,500'],
        answer: 1,
        explanation: 'Amount = 10000 * (1.1)^2 = 10000 * 1.21 = 12,100. CI = 12,100 - 10,000 = ₹2,100.'
      }
    ]
  },

  // 4. Part A - General English
  {
    testId: 'part_a_english_1',
    title: 'General English Grammar & Vocabulary Practice Set 1',
    totalTimeMinutes: 20,
    markingScheme: { correct: 1, negative: 0.25 },
    category: 'part_a',
    subject: 'General English',
    topic: 'Vocabulary, Grammar & Idioms',
    testType: 'mock',
    isPartA: true,
    questions: [
      {
        id: 1,
        section: 'General English',
        question: 'Select the word that is most nearly SYNONYMOUS with "AMELIORATE":',
        options: ['Worsen', 'Improve', 'Postpone', 'Ignore'],
        answer: 1,
        explanation: 'Ameliorate means to make something bad or unsatisfactory better or to improve it.'
      },
      {
        id: 2,
        section: 'General English',
        question: 'Choose the correct meaning of the idiom "To spill the beans":',
        options: ['To waste food', 'To reveal a secret prematurely', 'To perform a trick', 'To cook a meal'],
        answer: 1,
        explanation: 'To spill the beans means to reveal secret information unintentionally or prematurely.'
      },
      {
        id: 3,
        section: 'General English',
        question: 'Select the correctly spelt word:',
        options: ['Accomodate', 'Accommodate', 'Acommodate', 'Accommodete'],
        answer: 1,
        explanation: 'The correct spelling is A-C-C-O-M-M-O-D-A-T-E (double c and double m).'
      },
      {
        id: 4,
        section: 'General English',
        question: 'Fill in the blank with the appropriate subject-verb agreement: "Neither he nor his friends _____ present at the workshop."',
        options: ['was', 'were', 'is', 'are'],
        answer: 1,
        explanation: 'When subjects are joined by "neither... nor", the verb agrees with the subject closest to it ("his friends" -> plural "were").'
      },
      {
        id: 5,
        section: 'General English',
        question: 'Convert to Passive Voice: "The teacher answered the student\'s question."',
        options: [
          'The student\'s question was answered by the teacher.',
          'The student\'s question is answered by the teacher.',
          'The teacher was answering the question.',
          'The question had been answered by the teacher.'
        ],
        answer: 0,
        explanation: 'Simple Past Active ("answered") changes to Simple Past Passive ("was answered").'
      }
    ]
  },

  // 5. Part A - General Hindi
  {
    testId: 'part_a_hindi_1',
    title: 'General Hindi Language & Grammar Practice Set 1',
    totalTimeMinutes: 20,
    markingScheme: { correct: 1, negative: 0.25 },
    category: 'part_a',
    subject: 'General Hindi',
    topic: 'Vyakaran, Sandhi & Muhavare',
    testType: 'mock',
    isPartA: true,
    questions: [
      {
        id: 1,
        section: 'General Hindi',
        question: "'सूर्योदय' शब्द का सही संधि-विच्छेद क्या है?",
        options: ['सूर्य + दय', 'सूर्य + उदय', 'सू + उदय', 'सूर्या + उदय'],
        answer: 1,
        explanation: "'सूर्योदय' = सूर्य + उदय (गुण स्वर संधि: अ + उ = ओ)."
      },
      {
        id: 2,
        section: 'General Hindi',
        question: "'अंधे की लकड़ी' मुहावरे का सही और सटीक अर्थ क्या है?",
        options: ['एकमात्र सहारा', 'अंधा व्यक्ति होना', 'लकड़ी का सहारा लेना', 'बहुत कमजोर होना'],
        answer: 0,
        explanation: "'अंधे की लकड़ी' का अर्थ होता है 'एकमात्र सहारा'।"
      },
      {
        id: 3,
        section: 'General Hindi',
        question: "'लंबोदर' शब्द किस समास का प्रसिद्ध उदाहरण है?",
        options: ['तत्पुरुष समास', 'द्वंद्व समास', 'बहुव्रीहि समास', 'अव्ययीभाव समास'],
        answer: 2,
        explanation: "'लंबोदर' (लंबा है उदर जिसका - अर्थात श्री गणेश) अन्य पद की प्रधानता दर्शाने के कारण बहुव्रीहि समास है।"
      },
      {
        id: 4,
        section: 'General Hindi',
        question: 'निम्नलिखित में से शुद्ध वर्तनी वाले शब्द का चयन कीजिए:',
        options: ['उज्ज्वल', 'उज्वल', 'उज्जवल', 'उज़्वल'],
        answer: 0,
        explanation: "शुद्ध वर्तनी 'उज्ज्वल' (उ + ज + ज + व + ल) है जिसमें दोनों 'ज' आधे होते हैं।"
      },
      {
        id: 5,
        section: 'General Hindi',
        question: "निम्नलिखित में से कौन-सा शब्द 'जल' का पर्यायवाची नहीं है?",
        options: ['नीर', 'तोय', 'वारि', 'अनल'],
        answer: 3,
        explanation: "'अनल' का अर्थ अग्नि/आग होता है, जबकि नीर, तोय और वारि जल के पर्यायवाची हैं।"
      }
    ]
  },

  // 6. Part B - Operating Systems
  {
    testId: 'part_b_os_1',
    title: 'Operating Systems (OS) Core Concepts Practice Set 1',
    totalTimeMinutes: 20,
    markingScheme: { correct: 1, negative: 0.25 },
    category: 'part_b',
    subject: 'TGT CS',
    topic: 'Operating System',
    testType: 'mock',
    isPartA: false,
    questions: [
      {
        id: 1,
        section: 'Operating System',
        question: 'Which CPU scheduling algorithm may lead to starvation for long processes if short processes continuously arrive?',
        options: ['First Come First Served (FCFS)', 'Round Robin (RR)', 'Shortest Job First (SJF)', 'Priority Scheduling without aging'],
        answer: 3,
        explanation: 'Priority scheduling without aging causes lower-priority processes to starve indefinitely if higher priority processes arrive.'
      },
      {
        id: 2,
        section: 'Operating System',
        question: 'Which condition is NOT one of Coffman\'s four necessary conditions for a Deadlock to occur?',
        options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
        answer: 2,
        explanation: 'No Preemption is the necessary condition. If preemption IS allowed, deadlock cannot occur.'
      },
      {
        id: 3,
        section: 'Operating System',
        question: 'In page replacement algorithms, Belady\'s Anomaly can occur in which algorithm?',
        options: ['Least Recently Used (LRU)', 'First In First Out (FIFO)', 'Optimal Page Replacement', 'Least Frequently Used (LFU)'],
        answer: 1,
        explanation: 'Belady\'s Anomaly (where increasing the number of page frames results in more page faults) occurs in FIFO.'
      },
      {
        id: 4,
        section: 'Operating System',
        question: 'What is the primary role of Virtual Memory in modern operating systems?',
        options: [
          'Increase the speed of the physical RAM',
          'Allow execution of processes whose memory requirement exceeds physical RAM size',
          'Store permanent system restore checkpoints',
          'Accelerate 3D graphics processing'
        ],
        answer: 1,
        explanation: 'Virtual memory creates an illusion of a large main memory by swapping pages between RAM and disk.'
      },
      {
        id: 5,
        section: 'Operating System',
        question: 'Which system call creates a duplicate child process in POSIX-compliant UNIX/Linux systems?',
        options: ['exec()', 'fork()', 'exit()', 'wait()'],
        answer: 1,
        explanation: 'The fork() system call creates an exact duplicate child process returning 0 to the child and the child PID to the parent.'
      }
    ]
  },

  // 7. Part B - DBMS
  {
    testId: 'part_b_dbms_1',
    title: 'DBMS & SQL High-Yield Practice Set 1',
    totalTimeMinutes: 20,
    markingScheme: { correct: 1, negative: 0.25 },
    category: 'part_b',
    subject: 'TGT CS',
    topic: 'DBMS',
    testType: 'mock',
    isPartA: false,
    questions: [
      {
        id: 1,
        section: 'DBMS',
        question: 'Which Normal Form specifically guarantees the elimination of all transitive dependencies?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        answer: 2,
        explanation: '3NF requires 2NF compliance and ensures that no non-prime attribute is transitively dependent on a candidate key.'
      },
      {
        id: 2,
        section: 'DBMS',
        question: 'In SQL, which DDL command removes all rows from a table quickly without logging individual row deletions?',
        options: ['DELETE', 'DROP', 'TRUNCATE', 'ALTER'],
        answer: 2,
        explanation: 'TRUNCATE is a DDL command that deallocates data pages of the table, making it much faster than DELETE.'
      },
      {
        id: 3,
        section: 'DBMS',
        question: 'Which ACID property guarantees that either all operations of a database transaction complete successfully or none do?',
        options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
        answer: 0,
        explanation: 'Atomicity enforces "All or Nothing" execution of transaction operations.'
      },
      {
        id: 4,
        section: 'DBMS',
        question: 'What is a Foreign Key in Relational Database Management Systems?',
        options: [
          'A key imported from a foreign database instance',
          'A key that uniquely identifies a row in its own table',
          'A column in one table that references the Primary Key of another table',
          'An encrypted key used for secure network transfer'
        ],
        answer: 2,
        explanation: 'A Foreign Key enforces referential integrity between child and parent tables by pointing to the parent\'s primary key.'
      },
      {
        id: 5,
        section: 'DBMS',
        question: 'Which relational algebra operation selects specified columns from a relation?',
        options: ['Selection (σ)', 'Projection (π)', 'Cartesian Product (×)', 'Join (⋈)'],
        answer: 1,
        explanation: 'Projection (π) filters columns, whereas Selection (σ) filters rows.'
      }
    ]
  },

  // 8. Part B - Teaching Methodology
  {
    testId: 'part_b_pedagogy_1',
    title: 'Pedagogy & CS Teaching Methodology Practice Set 1',
    totalTimeMinutes: 20,
    markingScheme: { correct: 1, negative: 0.25 },
    category: 'part_b',
    subject: 'Teaching Methodology',
    topic: 'Teaching Methodology',
    testType: 'mock',
    isPartA: false,
    questions: [
      {
        id: 1,
        section: 'Teaching Methodology',
        question: 'According to NEP 2020, what is the new 5+3+3+4 school curricular structure replacing the 10+2 system?',
        options: ['Foundational, Preparatory, Middle, Secondary', 'Primary, Middle, High, Senior', 'Early, Elementary, Junior, Senior', 'Basic, Intermediate, Advanced, Major'],
        answer: 0,
        explanation: 'NEP 2020 restructures school education into Foundational (5 yrs), Preparatory (3 yrs), Middle (3 yrs), and Secondary (4 yrs).'
      },
      {
        id: 2,
        section: 'Teaching Methodology',
        question: 'Which domain of Bloom\'s Taxonomy focuses on feelings, attitudes, values, and emotional development?',
        options: ['Cognitive Domain', 'Affective Domain', 'Psychomotor Domain', 'Conative Domain'],
        answer: 1,
        explanation: 'The Affective Domain deals with values, enthusiasm, motivation, and attitudes.'
      },
      {
        id: 3,
        section: 'Teaching Methodology',
        question: 'What is the principal purpose of Formative Assessment in modern classroom teaching?',
        options: [
          'To assign final grades at term end',
          'To provide continuous diagnostic feedback to guide learning during instruction',
          'To rank students publicly',
          'To select students for scholarships'
        ],
        answer: 1,
        explanation: 'Formative assessment is "assessment for learning" aiming to identify gaps and guide instructional adjustments.'
      },
      {
        id: 4,
        section: 'Teaching Methodology',
        question: 'In Computer Science education, what does Constructivist Learning Theory advocate?',
        options: [
          'Memorizing code syntax through repetitive drills',
          'Active knowledge construction through problem-solving and hands-on coding projects',
          'Listening passively to teacher lectures',
          'Solely relying on paper-based multiple choice testing'
        ],
        answer: 1,
        explanation: 'Constructivism states that learners construct knowledge actively through real-world problem solving and hands-on coding.'
      },
      {
        id: 5,
        section: 'Teaching Methodology',
        question: 'What is the primary function of a well-designed Lesson Plan for a teacher?',
        options: [
          'A mandatory administrative formality',
          'A detailed roadmap outlining learning objectives, activities, timing, and assessment strategies',
          'A substitute for prescribed school textbooks',
          'A document to print and share on school notice boards'
        ],
        answer: 1,
        explanation: 'A lesson plan provides systematic structure, clear goals, time allocation, and pedagogical strategies for effective learning.'
      }
    ]
  },

  // Computer Networks Mock Tests
  {
    testId: 'custom_part_b_computer_networks_mock_test_1_34',
    title: 'Computer Networks Mock Test 1',
    totalTimeMinutes: 41,
    markingScheme: { correct: 1, negative: 0.25 },
    category: 'part_b',
    subject: 'Computer Science',
    topic: 'Computer Networks',
    file: '/Computer/Computer Networks/Computer Networks Mock Test 1.json',
    isPartA: false,
    qCount: 34,
    questions: []
  },
  {
    testId: 'custom_part_b_computer_networks_mock_test_2_20',
    title: 'Computer Networks Mock Test 2',
    totalTimeMinutes: 24,
    markingScheme: { correct: 1, negative: 0.25 },
    category: 'part_b',
    subject: 'Computer Science',
    topic: 'Computer Networks',
    file: '/Computer/Computer Networks/Computer Networks Mock Test 2.json',
    isPartA: false,
    qCount: 20,
    questions: []
  },
  {
    testId: 'custom_part_b_computer_networks_mock_test_3_20',
    title: 'Computer Networks Mock Test 3',
    totalTimeMinutes: 24,
    markingScheme: { correct: 1, negative: 0.25 },
    category: 'part_b',
    subject: 'Computer Science',
    topic: 'Computer Networks',
    file: '/Computer/Computer Networks/Computer Networks Mock Test 3.json',
    isPartA: false,
    qCount: 20,
    questions: []
  },
  {
    testId: 'custom_part_b_computer_networks_mock_test_4_20',
    title: 'Computer Networks Mock Test 4',
    totalTimeMinutes: 24,
    markingScheme: { correct: 1, negative: 0.25 },
    category: 'part_b',
    subject: 'Computer Science',
    topic: 'Computer Networks',
    file: '/Computer/Computer Networks/Computer Networks Mock Test 4.json',
    isPartA: false,
    qCount: 20,
    questions: []
  },

  // 9. Full Length Mock Test (200 Marks Pattern Simulator)
  {
    testId: 'full_mock_tgt_cs_1',
    title: 'DSSSB TGT CS Official Pattern Full Mock Test 1 (200 Marks Pattern)',
    totalTimeMinutes: 120,
    markingScheme: { correct: 1, negative: 0.25 },
    category: 'full',
    subject: 'Full Mock & PYP',
    topic: 'DSSSB TGT CS Full Paper',
    testType: 'mock',
    isPartA: false,
    questions: [
      {
        id: 1,
        section: 'General Intelligence & Reasoning',
        question: 'Find the odd one out: (A) Apple (B) Mango (C) Potato (D) Orange',
        options: ['Apple', 'Mango', 'Potato', 'Orange'],
        answer: 2,
        explanation: 'Potato is a vegetable/tuber; Apple, Mango, and Orange are fruits.'
      },
      {
        id: 2,
        section: 'General Awareness',
        question: 'Which city is the capital of Delhi NCT?',
        options: ['New Delhi', 'Old Delhi', 'Noida', 'Gurugram'],
        answer: 0,
        explanation: 'New Delhi is the official capital of India and the National Capital Territory of Delhi.'
      },
      {
        id: 3,
        section: 'Quantitative Aptitude',
        question: 'What is 15% of 200?',
        options: ['20', '25', '30', '35'],
        answer: 2,
        explanation: '15/100 * 200 = 30.'
      },
      {
        id: 4,
        section: 'General English',
        question: 'Antonym of "ANCIENT":',
        options: ['Old', 'Modern', 'Historic', 'Traditional'],
        answer: 1,
        explanation: 'Ancient means very old; its opposite is Modern.'
      },
      {
        id: 5,
        section: 'General Hindi',
        question: "'कवि' का स्त्रीलिंग रूप क्या है?",
        options: ['कवियत्री', 'कवयित्री', 'कवीयत्री', 'कविइत्री'],
        answer: 1,
        explanation: "'कवि' का शुद्ध स्त्रीलिंग 'कवयित्री' होता है।"
      },
      {
        id: 6,
        section: 'Operating System',
        question: 'What is the main task of the OS Kernel?',
        options: [
          'Manage system resources (CPU, Memory, Devices) and provide hardware abstraction',
          'Render web browser pages',
          'Edit document files',
          'Manage social media accounts'
        ],
        answer: 0,
        explanation: 'The Kernel is the core component of an OS managing system resources and interfacing hardware with applications.'
      },
      {
        id: 7,
        section: 'DBMS',
        question: 'SQL statement used to fetch data from a database relation:',
        options: ['GET', 'SELECT', 'EXTRACT', 'OPEN'],
        answer: 1,
        explanation: 'The SELECT command is used to query and retrieve records from tables.'
      },
      {
        id: 8,
        section: 'Computer Networks',
        question: 'Which protocol automatically assigns IP addresses to devices on a network?',
        options: ['DNS', 'DHCP', 'FTP', 'SMTP'],
        answer: 1,
        explanation: 'Dynamic Host Configuration Protocol (DHCP) automatically assigns IP configuration parameters.'
      },
      {
        id: 9,
        section: 'Data Structures',
        question: 'Which data structure follows LIFO (Last In First Out) principle?',
        options: ['Queue', 'Stack', 'Array', 'Linked List'],
        answer: 1,
        explanation: 'A Stack operates on LIFO (Last In First Out) order.'
      },
      {
        id: 10,
        section: 'Teaching Methodology',
        question: 'Which teaching strategy encourages active peer learning and collaboration in ICT labs?',
        options: ['Pair Programming / Peer Learning', 'Solitary Punishment', 'Dictation', 'Passive Listening'],
        answer: 0,
        explanation: 'Pair programming and peer collaboration enhance active problem-solving and engagement.'
      }
    ]
  }
];



