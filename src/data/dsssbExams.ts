import { LucideIcon } from 'lucide-react';

export interface SyllabusItem {
  id: string;
  title: string;
  description?: string;
  code?: string;
  importance?: 'High' | 'Medium' | 'Core';
  practiceTab?: 'part-a-view' | 'part-b-view' | 'adaptive-path' | 'full-mock-view';
}

export interface SyllabusSection {
  id: string;
  category: string;
  title: string;
  items: SyllabusItem[];
}

// 1. COMMON PART A GENERAL SYLLABUS SECTIONS (Standard 100 Marks across TGT & PGT CS)
export const PART_A_SECTIONS: SyllabusSection[] = [
  {
    id: 'part_a_math',
    category: 'Part A',
    title: 'Arithmetical & Numerical Ability (Maths - 20 Marks)',
    items: [
      { id: 'pa_math_1', title: 'Simplification & Decimals', description: 'BODMAS, fractions, decimal numbers, and mental calculation shortcuts', importance: 'High', practiceTab: 'part-a-view' },
      { id: 'pa_math_2', title: 'Data Interpretation (DI)', description: 'Tables, bar charts, pie charts, line graphs, and caselets', importance: 'High', practiceTab: 'part-a-view' },
      { id: 'pa_math_3', title: 'Fractions, L.C.M. & H.C.F.', description: 'Prime factorization, divisibility rules, LCM/HCF applications', importance: 'Medium', practiceTab: 'part-a-view' },
      { id: 'pa_math_4', title: 'Ratio & Proportion, Percentage', description: 'Basic ratios, proportions, percentage increases and decreases', importance: 'Core', practiceTab: 'part-a-view' },
      { id: 'pa_math_5', title: 'Average, Profit & Loss, Discount', description: 'Weighted averages, CP, SP, MP, markup and discount formulas', importance: 'High', practiceTab: 'part-a-view' },
      { id: 'pa_math_6', title: 'Simple & Compound Interest', description: 'Formula applications, annual/half-yearly compounding, CI-SI differences', importance: 'Medium', practiceTab: 'part-a-view' },
      { id: 'pa_math_7', title: 'Mensuration, Time & Work, Time & Distance', description: '2D/3D shapes, speed-distance-time, pipe-cisterns, work efficiency', importance: 'Core', practiceTab: 'part-a-view' },
    ]
  },
  {
    id: 'part_a_reasoning',
    category: 'Part A',
    title: 'General Intelligence & Reasoning Ability (20 Marks)',
    items: [
      { id: 'pa_reas_1', title: 'Analogies, Similarities & Differences', description: 'Word, letter, and number analogies', importance: 'High', practiceTab: 'part-a-view' },
      { id: 'pa_reas_2', title: 'Spatial Visualization & Orientation', description: 'Paper folding, pattern completion, matrix reasoning', importance: 'Medium', practiceTab: 'part-a-view' },
      { id: 'pa_reas_3', title: 'Problem Solving, Analysis & Judgment', description: 'Logical reasoning, cause & effect, course of action', importance: 'Core', practiceTab: 'part-a-view' },
      { id: 'pa_reas_4', title: 'Decision Making & Visual Memory', description: 'Visual puzzles, odd one out, memory-based image identification', importance: 'Medium', practiceTab: 'part-a-view' },
      { id: 'pa_reas_5', title: 'Relationship Concepts & Blood Relations', description: 'Family trees, coded blood relations, direction sense test', importance: 'High', practiceTab: 'part-a-view' },
      { id: 'pa_reas_6', title: 'Arithmetical Reasoning & Coding-Decoding', description: 'Mathematical operators, letter/number coding, ranks and ordering', importance: 'Core', practiceTab: 'part-a-view' },
      { id: 'pa_reas_7', title: 'Number & Alphabet Series, Syllogism', description: 'Missing terms, Venn diagrams, statement-conclusions', importance: 'High', practiceTab: 'part-a-view' },
    ]
  },
  {
    id: 'part_a_gk',
    category: 'Part A',
    title: 'General Awareness & Delhi GK (20 Marks)',
    items: [
      { id: 'pa_gk_1', title: 'History & Indian Freedom Movement', description: 'Ancient, Medieval, Modern Indian History and National Movement', importance: 'High', practiceTab: 'part-a-view' },
      { id: 'pa_gk_2', title: 'Geography, Environment & Ecology', description: 'Physical geography of India, rivers, climate, national parks', importance: 'Medium', practiceTab: 'part-a-view' },
      { id: 'pa_gk_3', title: 'Indian Polity, Constitution & Governance', description: 'Preamble, Fundamental Rights, Articles, Parliament, Judiciary', importance: 'Core', practiceTab: 'part-a-view' },
      { id: 'pa_gk_4', title: 'Indian Economy & Union Budget Basics', description: 'Economic terms, inflation, GDP, Five-Year Plans, RBI policies', importance: 'Medium', practiceTab: 'part-a-view' },
      { id: 'pa_gk_5', title: 'Everyday Science & Scientific Discoveries', description: 'Physics, Chemistry, Biology in daily life, inventions', importance: 'Medium', practiceTab: 'part-a-view' },
      { id: 'pa_gk_6', title: 'National & International Current Affairs', description: 'Latest summit, awards, schemes, sports, appointments (Last 6-12 months)', importance: 'High', practiceTab: 'part-a-view' },
      { id: 'pa_gk_7', title: 'Delhi GK & Important National Organizations', description: 'Delhi history/administration, ISRO, DRDO, UNESCO, UNO', importance: 'High', practiceTab: 'part-a-view' },
    ]
  },
  {
    id: 'part_a_english',
    category: 'Part A',
    title: 'General English Language & Comprehension (20 Marks)',
    items: [
      { id: 'pa_eng_1', title: 'Reading Comprehension Passages', description: 'Unseen passages with factual, vocabulary, and inference questions', importance: 'High', practiceTab: 'part-a-view' },
      { id: 'pa_eng_2', title: 'Vocabulary, Synonyms & Antonyms', description: 'Direct vocabulary questions, contextual meaning, word forms', importance: 'Core', practiceTab: 'part-a-view' },
      { id: 'pa_eng_3', title: 'Grammar: Tenses, Articles & Prepositions', description: 'Rules of tenses, subject-verb agreement, active-passive, direct-indirect', importance: 'High', practiceTab: 'part-a-view' },
      { id: 'pa_eng_4', title: 'Spotting Errors & Sentence Correction', description: 'Error detection in sentences, grammatical corrections', importance: 'High', practiceTab: 'part-a-view' },
      { id: 'pa_eng_5', title: 'Idioms, Phrases & One Word Substitutions', description: 'Common English idioms, phrasal verbs, one-word expressions', importance: 'Medium', practiceTab: 'part-a-view' },
    ]
  },
  {
    id: 'part_a_hindi',
    category: 'Part A',
    title: 'General Hindi Language & Comprehension (20 Marks)',
    items: [
      { id: 'pa_hin_1', title: 'अपठित गद्यांश एवं प्रश्नोत्तर (Comprehension)', description: 'गद्यांश पर आधारित प्रश्न एवं शीर्षक', importance: 'High', practiceTab: 'part-a-view' },
      { id: 'pa_hin_2', title: 'हिंदी व्याकरण: संज्ञा, सर्वनाम, विशेषण, क्रिया', description: 'पद परिचय, भेद एवं व्यावहारिक प्रयोग', importance: 'Core', practiceTab: 'part-a-view' },
      { id: 'pa_hin_3', title: 'संधि, समास, उपसर्ग एवं प्रत्यय', description: 'स्वर/व्यंजन संधि, समास के भेद, उपसर्ग-प्रत्यय पहचान', importance: 'High', practiceTab: 'part-a-view' },
      { id: 'pa_hin_4', title: 'पर्यायवाची, विलोम एवं अनेकार्थी शब्द', description: 'शब्दावली एवं शब्द युग्म', importance: 'High', practiceTab: 'part-a-view' },
      { id: 'pa_hin_5', title: 'मुहावरे, लोकोक्तियाँ एवं वाक्य शुद्धि', description: 'अर्थ, वाक्य प्रयोग, लिंग, वचन एवं कारक अशुद्धि शोधन', importance: 'High', practiceTab: 'part-a-view' },
    ]
  }
];

export interface ExamInfo {
  slug: string;
  title: string;
  postCode: string;
  department: string;
  totalMarks: string;
  duration: string;
  badge?: string;
  color: string;
  bgGradient: string;
  iconName: string;
  overview: string;
  sections: SyllabusSection[];
}

export const DSSSB_EXAMS: ExamInfo[] = [
  {
    slug: 'tgt-computer-science',
    title: 'DSSSB TGT Computer Science',
    postCode: 'Post Code: 41/26, 804/24, 39/21, 91/20',
    department: 'Directorate of Education (DOE) / NDMC',
    totalMarks: '200 Marks (200 Questions)',
    duration: '120 Minutes (2 Hours)',
    badge: 'Latest 2026 Post Code 41/26',
    color: 'from-blue-600 to-indigo-700',
    bgGradient: 'bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900',
    iconName: 'Cpu',
    overview: 'Official 32 Computer Science Modules prescribed by DOE Delhi for Post Code 41/26 & 804/24, along with 100 Marks Part A General Paper and Teaching Methodology.',
    sections: [
      ...PART_A_SECTIONS,
      {
        id: 'part_b_doe_cs',
        category: 'Part B',
        title: 'Official DOE Syllabus: TGT Computer Science (32 Modules)',
        items: [
          { id: 'doe_1', code: 'DOE-01', title: '1. Mathematics - I, II, III, IV', description: 'Discrete Mathematics, Set Theory, Mathematical Logic, Relations, Functions, Matrix Theory, Determinants, Vectors & Linear Algebra', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'doe_2', code: 'DOE-02', title: '2. Business Communication, Organization & Management', description: 'Business writing, communication channels, organizational hierarchy, office automation, management principles', importance: 'Medium', practiceTab: 'part-b-view' },
          { id: 'doe_3', code: 'DOE-03', title: '3. Computer Basics and P.C. Software', description: 'Hardware components, operating system fundamentals, MS Office suite (Word, Excel, PowerPoint), PC maintenance', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'doe_4', code: 'DOE-04', title: '4. Programming in C, C++ & Data Structures', description: 'Control structures, Pointers, Arrays, Stacks, Queues, Linked Lists, Trees, Graphs, OOP Concepts, Inheritance, Polymorphism', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'doe_5', code: 'DOE-05', title: '5. Fundamentals of Information Technology', description: 'IT infrastructure, computer generations, input/output peripherals, memory hierarchy, binary/hexadecimal number systems', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'doe_6', code: 'DOE-06', title: '6. Basis of Physics', description: 'Semiconductor physics, basic electronic components, diodes, transistors, logic families (TTL, CMOS)', importance: 'Medium', practiceTab: 'part-b-view' },
          { id: 'doe_7', code: 'DOE-07', title: '7. Digital Electronics', description: 'Boolean algebra, K-Maps, logic gates, combinational circuits (Adder, MUX, DEMUX, Encoders), sequential circuits (Flip-Flops, Counters, Registers)', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'doe_8', code: 'DOE-08', title: '8. Database Management System (DBMS)', description: 'Relational model, SQL queries, ER diagrams, Normalization (1NF to 5NF), ACID properties, Transactions & Concurrency control', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'doe_9', code: 'DOE-09', title: '9. Computer Architecture', description: 'CPU organization, ALU, register sets, instruction pipelining, cache memory mapping, microprocessors 8085/8086, assembly language', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'doe_10', code: 'DOE-10', title: '10. Front End Designed Tools', description: 'HTML/HTML5 elements, CSS styling, Responsive Web Design, JavaScript basics, DOM manipulation, form validation', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'doe_11', code: 'DOE-11', title: '11. Financial Accounting', description: 'Basic accounting concepts, journal entries, ledger accounts, trial balance, profit & loss statement, balance sheet basics', importance: 'Medium', practiceTab: 'part-b-view' },
          { id: 'doe_12', code: 'DOE-12', title: '12. Object/Computer Oriented Programming / Numerical Techniques', description: 'Class & object abstractions, encapsulated design, error analysis, root finding methods (Bisection, Newton-Raphson)', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'doe_13', code: 'DOE-13', title: '13. Software Engineering', description: 'SDLC models (Waterfall, Spiral, Agile), SRS, software testing (Black box, White box), software metrics, COCOMO model, UML diagrams', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'doe_14', code: 'DOE-14', title: '14. Java Programming and Website Design', description: 'Java syntax, JVM architecture, multithreading, exception handling, collections framework, web design concepts', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'doe_15', code: 'DOE-15', title: '15. Operating Systems', description: 'Process management, CPU scheduling algorithms, Memory management (Paging, Segmentation, Virtual Memory), Deadlocks, File systems', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'doe_16', code: 'DOE-16', title: '16. Business Economics', description: 'Demand & supply analysis, cost functions, market structures (Perfect competition, Monopoly), economic decision making', importance: 'Medium', practiceTab: 'part-b-view' },
          { id: 'doe_17', code: 'DOE-17', title: '17. Computer Networks', description: 'OSI & TCP/IP models, Network topologies, IP addressing (IPv4, IPv6), Subnetting, Routing protocols, Flow & Error control', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'doe_18', code: 'DOE-18', title: '18. .NET Programming', description: '.NET Framework architecture, CLR, C# syntax, ADO.NET database connectivity, ASP.NET web forms & web services', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'doe_19', code: 'DOE-19', title: '19. Linux Environment', description: 'Linux architecture, file system layout, basic commands, permissions (chmod, chown), shell scripting, process management', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'doe_20', code: 'DOE-20', title: '20. E-Commerce', description: 'EDI architecture, electronic payment gateways, B2B, B2C, C2C models, e-commerce security protocols (SSL/TLS)', importance: 'Medium', practiceTab: 'part-b-view' },
          { id: 'doe_21', code: 'DOE-21', title: '21. Design and Analysis of Algorithms (DAA)', description: 'Asymptotic notation (Big-O, Omega, Theta), Divide & Conquer, Greedy method, Dynamic Programming, Graph algorithms (BFS, DFS, Dijkstra)', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'doe_22', code: 'DOE-22', title: '22. Computer Network Security', description: 'Cryptography (Symmetric/Asymmetric), RSA, DES, Hash functions, Firewalls, IPSec, Digital Signatures, Malicious software', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'doe_23', code: 'DOE-23', title: '23. Management Information System (MIS)', description: 'MIS architecture, Decision Support Systems (DSS), Executive Information Systems, ERP software, data warehousing basics', importance: 'Medium', practiceTab: 'part-b-view' },
          { id: 'doe_24', code: 'DOE-24', title: '24. Mobile Computing', description: 'Cellular network architectures, GSM, CDMA, Mobile IP, Wireless LANs (802.11), Mobile OS fundamentals (Android architecture)', importance: 'Medium', practiceTab: 'part-b-view' },
          { id: 'doe_25', code: 'DOE-25', title: '25. Computer Graphics & Multimedia Applications', description: 'Graphics hardware, raster scan display, 2D/3D transformations, Clipping algorithms (Sutherland-Hodgman), Curves & Surfaces, Solid modeling', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'doe_26', code: 'DOE-26', title: '26. Internet Programming', description: 'Web Server setup (PWS, IIS), CSS, Event Model, Filters & Transitions, Data Binding with Tabular Data Control, XML, DTDs with XHTML/CSS, XML Parsers (DOM/SAX)', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'doe_27', code: 'DOE-27', title: '27. Knowledge Management & New Economy', description: 'Knowledge lifecycle, data mining basics, artificial intelligence concepts, digital economy drivers', importance: 'Medium', practiceTab: 'part-b-view' },
          { id: 'doe_28', code: 'DOE-28', title: '28. Foundation Course in English', description: 'Technical communication, professional report writing, comprehension, grammar for technical documentation', importance: 'Medium', practiceTab: 'part-b-view' },
          { id: 'doe_29', code: 'DOE-29', title: '29. Problem Solving & Programming', description: 'Problem formulation, flowcharts, pseudocode, algorithmic logic, structured programming design', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'doe_30', code: 'DOE-30', title: '30. Statistical Techniques', description: 'Descriptive statistics, Mean, Median, Mode, Standard Deviation, Probability concepts, Binomial/Poisson/Normal distributions, Statistical inference', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'doe_31', code: 'DOE-31', title: '31. TCP / Protocols', description: 'TCP/IP Protocol Suite, TCP header, UDP, HTTP/HTTPS, FTP, DNS, DHCP, Socket programming, Port numbers', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'doe_32', code: 'DOE-32', title: '32. Interpolation', description: 'Numerical interpolation techniques, Finite differences, Newton forward/backward interpolation, Lagrange interpolation formulas', importance: 'Medium', practiceTab: 'part-b-view' },
        ]
      },
      {
        id: 'part_b_pedagogy',
        category: 'Part B',
        title: 'Teaching Methodology & Pedagogy (20 Marks)',
        items: [
          { id: 'ped_1', title: 'Child Development & Educational Psychology', description: 'Physical, cognitive, emotional development stages, Piaget, Vygotsky, Kohlberg theories', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'ped_2', title: 'Pedagogical Concerns & Learning Theories', description: 'Behaviorism, Constructivism, Experiential learning, Active learning techniques in CS', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'ped_3', title: 'Classroom Management & Inclusive Education', description: 'Classroom environment, handling diverse learners, special education needs, mainstreaming', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'ped_4', title: 'ICT in Education & Digital Learning Tools', description: 'Integration of ICT in teaching, smart classroom tools, e-learning platforms, open educational resources', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'ped_5', title: 'Teaching Aptitude, Evaluation & Assessment', description: 'Continuous & Comprehensive Evaluation (CCE), Formative vs Summative assessment, Bloom’s Taxonomy', importance: 'Core', practiceTab: 'part-b-view' },
        ]
      }
    ]
  },
  {
    slug: 'pgt-computer-science',
    title: 'DSSSB PGT Computer Science',
    postCode: 'Post Code: 102/26, 805/24, 29/22',
    department: 'Directorate of Education (Male / Female)',
    totalMarks: '300 Marks (300 Questions)',
    duration: '180 Minutes (3 Hours)',
    badge: 'Post Code 102/26',
    color: 'from-purple-600 to-indigo-800',
    bgGradient: 'bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950',
    iconName: 'GraduationCap',
    overview: 'Advanced Post-Graduate Level Computer Science paper covering Artificial Intelligence, Machine Learning, Automata Theory, Discrete Math, Web Security, Compiler Design + Part A & Pedagogy.',
    sections: [
      ...PART_A_SECTIONS,
      {
        id: 'pgt_cs_advanced',
        category: 'Part B',
        title: 'PGT Specialized Computer Science & AI Domains (200 Marks)',
        items: [
          { id: 'pgt_1', title: 'Theory of Computation & Automata Theory', description: 'DFA, NFA, Regular Expressions, Context-Free Grammars, Pushdown Automata, Turing Machines, Decidability', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'pgt_2', title: 'Compiler Design & Lexical Analysis', description: 'Lexical analysis, Syntax Analysis, Top-down & Bottom-up Parsers, Intermediate Code Generation, Code Optimization', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'pgt_3', title: 'Artificial Intelligence & Machine Learning Basics', description: 'Heuristic Search (A*, AO*), Game playing, Knowledge representation, Expert systems, Neural Networks, Supervised/Unsupervised ML', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'pgt_4', title: 'Advanced Data Structures & Graph Algorithms', description: 'AVLs, Red-Black Trees, B-Trees/B+ Trees, Heaps, Topological Sort, Shortest Path Algorithms (Dijkstra, Bellman-Ford, Floyd-Warshall)', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'pgt_5', title: 'Advanced Database Systems & NoSQL', description: 'Query Optimization, Indexing (B-Tree/Hash), Distributed Databases, CAP Theorem, NoSQL models (Document, Key-Value)', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'pgt_6', title: 'Information & Network Security Cryptography', description: 'Public Key Cryptography, Elliptic Curve Cryptography, SSL/TLS, Cyber Laws & Information Technology Act 2000', importance: 'High', practiceTab: 'part-b-view' },
          { id: 'pgt_7', title: 'Python Programming & Data Science Libraries', description: 'Python syntax, OOP, NumPy, Pandas, Matplotlib, File handling, Data cleaning & Visualization', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'pgt_8', title: 'Cloud Computing & Distributed Systems', description: 'IaaS, PaaS, SaaS, Virtualization, Docker containers, Distributed File Systems (HDFS), RPC mechanisms', importance: 'Medium', practiceTab: 'part-b-view' }
        ]
      },
      {
        id: 'part_b_pedagogy',
        category: 'Part B',
        title: 'Teaching Methodology & Pedagogy (20 Marks)',
        items: [
          { id: 'pgt_ped_1', title: 'Advanced Curriculum & Pedagogical Practices in CS', description: 'Project-based learning, computational thinking, flipped classroom models in secondary education', importance: 'Core', practiceTab: 'part-b-view' },
          { id: 'pgt_ped_2', title: 'Assessment & Educational Technology Standards', description: 'Rubrics for programming evaluation, NEP 2020 vocational integration, ICT standards', importance: 'High', practiceTab: 'part-b-view' }
        ]
      }
    ]
  }
];
