export interface SubjectVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  youtubeId?: string;
  url: string;
  tag: string;
}

export interface SubjectNote {
  id: string;
  title: string;
  pages: number;
  type: 'formula_sheet' | 'handwritten_notes' | 'quick_summary' | 'cheat_sheet';
  summary: string;
  downloadUrl?: string;
  viewContent?: string;
}

export interface SubjectDetailData {
  id: string;
  title: string;
  code?: string;
  category: 'part_a' | 'part_b_cs' | 'pedagogy';
  iconType: 'calculator' | 'brain' | 'code' | 'books' | 'computer' | 'shield' | 'trophy' | 'target' | 'sparkles' | 'lightning';
  accentGradient: string;
  badge: string;
  overview: string;
  syllabusTopics: string[];
  videos: SubjectVideo[];
  notes: SubjectNote[];
}

export const SUBJECT_RESOURCES: Record<string, SubjectDetailData> = {
  // --- PART A SUBJECTS ---
  'maths': {
    id: 'maths',
    title: 'Arithmetical & Numerical Ability (Maths)',
    code: 'PART-A-MATH',
    category: 'part_a',
    iconType: 'calculator',
    accentGradient: 'from-amber-500 via-orange-500 to-rose-600',
    badge: '20 Marks • Part A',
    overview: 'High-speed arithmetical concepts, BODMAS simplification, percentages, Profit & Loss, SI/CI, Time-Speed-Distance, and Data Interpretation.',
    syllabusTopics: [
      'Simplification & BODMAS Shortcuts',
      'Fractions, Decimals, L.C.M. & H.C.F.',
      'Ratio & Proportion, Percentage Increases',
      'Average, Profit & Loss, Discount Math',
      'Simple Interest & Compound Interest Tricks',
      'Time & Work, Pipes & Cisterns',
      'Time, Speed & Distance, Trains & Boats',
      'Mensuration (2D & 3D Area/Volume)',
      'Data Interpretation (Bar Graphs, Pie Charts, Tables)'
    ],
    videos: [
      {
        id: 'math_v1',
        title: 'DSSSB Complete Maths Marathon - All 20 Marks Chapters',
        channel: 'BytePrep CS & Teaching Prep',
        duration: '3h 45m',
        url: 'https://www.youtube.com/results?search_query=dsssb+maths+complete+marathon',
        tag: 'Full Marathon'
      },
      {
        id: 'math_v2',
        title: 'Simplification, Fractions & Number System Speed Tricks',
        channel: 'DSSSB Topper Series',
        duration: '1h 20m',
        url: 'https://www.youtube.com/results?search_query=dsssb+simplification+tricks',
        tag: 'Speed Tricks'
      },
      {
        id: 'math_v3',
        title: 'Profit & Loss, SI-CI and Percentage Masterclass',
        channel: 'Maths Aptitude Academy',
        duration: '2h 10m',
        url: 'https://www.youtube.com/results?search_query=dsssb+profit+loss+percentage',
        tag: 'Concept Class'
      },
      {
        id: 'math_v4',
        title: 'Data Interpretation (DI) Full Practice for DSSSB',
        channel: 'Aptitude Pro',
        duration: '1h 15m',
        url: 'https://www.youtube.com/results?search_query=dsssb+data+interpretation+maths',
        tag: 'PYQ Drill'
      }
    ],
    notes: [
      {
        id: 'math_n1',
        title: 'DSSSB Maths Golden Formula Sheet & Shortcut Handbook',
        pages: 14,
        type: 'formula_sheet',
        summary: 'All formulas of Mensuration 2D/3D, CI-SI differences, Work-Time units, and shortcut fraction-to-percentage conversion tables.'
      },
      {
        id: 'math_n2',
        title: 'Top 100 Most Repeated Arithmetical PYQs with Step Solutions',
        pages: 28,
        type: 'quick_summary',
        summary: 'Collection of the most frequent question models from DSSSB 2021-2024 papers with 15-second shortcut techniques.'
      }
    ]
  },

  'reasoning': {
    id: 'reasoning',
    title: 'General Intelligence & Reasoning Ability',
    code: 'PART-A-REAS',
    category: 'part_a',
    iconType: 'brain',
    accentGradient: 'from-purple-500 via-indigo-600 to-blue-700',
    badge: '20 Marks • Part A',
    overview: 'Logical deduction, coding-decoding, blood relations, syllogisms, series completion, non-verbal matrices, and direction sense test.',
    syllabusTopics: [
      'Analogies, Similarities and Classification',
      'Arithmetical Reasoning & Coding-Decoding',
      'Blood Relations & Family Tree Deduction',
      'Direction Sense Test & Degree Rotations',
      'Number & Alphabetical Series Completion',
      'Syllogism & Venn Diagram Logic',
      'Seating Arrangement & Linear/Circular Order',
      'Non-Verbal: Paper Folding, Mirror Images, Matrix'
    ],
    videos: [
      {
        id: 'reas_v1',
        title: 'Complete Reasoning 20/20 Marks Strategy & Marathon',
        channel: 'BytePrep CS',
        duration: '2h 50m',
        url: 'https://www.youtube.com/results?search_query=dsssb+reasoning+full+marathon',
        tag: 'Full Syllabus'
      },
      {
        id: 'reas_v2',
        title: 'Syllogisms 100-50 & Venn Diagram Method without Pen',
        channel: 'Logical Reasoning Hub',
        duration: '55m',
        url: 'https://www.youtube.com/results?search_query=dsssb+syllogism+reasoning',
        tag: 'Shortcuts'
      },
      {
        id: 'reas_v3',
        title: 'Blood Relations & Direction Test PYQs Breakdown',
        channel: 'Reasoning Master',
        duration: '1h 10m',
        url: 'https://www.youtube.com/results?search_query=dsssb+blood+relation+reasoning',
        tag: 'PYQ Practice'
      }
    ],
    notes: [
      {
        id: 'reas_n1',
        title: 'Reasoning Quick Rules & Code Pattern Cheat Sheet',
        pages: 10,
        type: 'cheat_sheet',
        summary: 'Alphabet position values (EJOTY), reverse letters (AZ, BY, CX), angle rotations, and syllogism truth tables.'
      },
      {
        id: 'reas_n2',
        title: 'Top 75 Non-Verbal & Pattern Completion Master Notes',
        pages: 18,
        type: 'handwritten_notes',
        summary: 'Step-by-step visual patterns, dice rotation logic, and mirror/water image standard guidelines.'
      }
    ]
  },

  'gk': {
    id: 'gk',
    title: 'General Awareness & Delhi GK',
    code: 'PART-A-GK',
    category: 'part_a',
    iconType: 'sparkles',
    accentGradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    badge: '20 Marks • Part A',
    overview: 'Indian Polity & Constitution, Modern History & Freedom Movement, Geography, Science, National Organizations & Delhi Governance.',
    syllabusTopics: [
      'Indian Constitution, Articles, Fundamental Rights & Duties',
      'Modern Indian History & Freedom Struggle 1857-1947',
      'Physical Geography, Rivers, Minerals & National Parks',
      'Indian Economy, Five-Year Plans & Union Budget',
      'Everyday Science (Physics, Chemistry, Biology in daily life)',
      'Delhi GK, Heritage, Administration & NCT Acts',
      'Current Affairs, Summits, Awards & Sports'
    ],
    videos: [
      {
        id: 'gk_v1',
        title: 'Indian Polity Top 100 Articles & Amendments for DSSSB',
        channel: 'BytePrep CS',
        duration: '2h 15m',
        url: 'https://www.youtube.com/results?search_query=dsssb+polity+marathon',
        tag: 'Polity'
      },
      {
        id: 'gk_v2',
        title: 'Delhi GK & History Full Revision Masterclass',
        channel: 'Delhi Exam Prep',
        duration: '1h 30m',
        url: 'https://www.youtube.com/results?search_query=dsssb+delhi+gk+complete',
        tag: 'Delhi GK'
      },
      {
        id: 'gk_v3',
        title: 'Modern History & Freedom Movement Important Events',
        channel: 'GK Gyan',
        duration: '1h 45m',
        url: 'https://www.youtube.com/results?search_query=dsssb+history+modern+india',
        tag: 'History'
      }
    ],
    notes: [
      {
        id: 'gk_n1',
        title: 'Indian Constitution & Important Articles Fast Recap Sheet',
        pages: 12,
        type: 'formula_sheet',
        summary: 'All important Articles (14-32, 51A, 352-360), Constitutional bodies, and Parliamentary schedules.'
      },
      {
        id: 'gk_n2',
        title: 'Comprehensive Delhi Administration, History & Monuments Notes',
        pages: 16,
        type: 'quick_summary',
        summary: 'Lieutenant Governor powers, NCT Delhi Act, historical dynasties of Delhi, and metro/civic landmarks.'
      }
    ]
  },

  'english': {
    id: 'english',
    title: 'General English Language & Comprehension',
    code: 'PART-A-ENG',
    category: 'part_a',
    iconType: 'books',
    accentGradient: 'from-blue-500 via-sky-600 to-indigo-700',
    badge: '20 Marks • Part A',
    overview: 'Reading comprehension, grammatical rules, error spotting, vocabulary, idioms, phrases, synonyms-antonyms and one-word substitutions.',
    syllabusTopics: [
      'Reading Comprehension Passages & Inference',
      'Subject-Verb Agreement & Sentence Structure',
      'Tenses, Active-Passive Voice & Direct-Indirect Speech',
      'Prepositions, Conjunctions & Modals',
      'Spotting Errors & Sentence Improvement',
      'Synonyms, Antonyms & Contextual Vocabulary',
      'Idioms, Phrases & One Word Substitutions'
    ],
    videos: [
      {
        id: 'eng_v1',
        title: 'Complete English Grammar 120 Rules for DSSSB Part A',
        channel: 'English Guru',
        duration: '3h 10m',
        url: 'https://www.youtube.com/results?search_query=dsssb+english+grammar+rules',
        tag: '120 Rules'
      },
      {
        id: 'eng_v2',
        title: 'Top 300 Idioms & Phrases Repeated in DSSSB PYQs',
        channel: 'BytePrep CS',
        duration: '1h 40m',
        url: 'https://www.youtube.com/results?search_query=dsssb+english+idioms+phrases',
        tag: 'Vocabulary'
      }
    ],
    notes: [
      {
        id: 'eng_n1',
        title: 'Golden 100 Rules of English Grammar with DSSSB PYQ Examples',
        pages: 20,
        type: 'handwritten_notes',
        summary: 'Clear rules for Subject-Verb Agreement, Conditionals, Inversion, Gerund vs Infinitive, and Question Tags.'
      },
      {
        id: 'eng_n2',
        title: 'High-Frequency Idioms, Phrasal Verbs & One-Word Vocab Sheet',
        pages: 15,
        type: 'cheat_sheet',
        summary: 'Alphabetical compilation of 250+ most asked idioms, phrasal verbs, and confusing word pairs.'
      }
    ]
  },

  'hindi': {
    id: 'hindi',
    title: 'General Hindi Language & Comprehension',
    code: 'PART-A-HIN',
    category: 'part_a',
    iconType: 'books',
    accentGradient: 'from-red-500 via-rose-600 to-pink-700',
    badge: '20 Marks • Part A',
    overview: 'अपठित गद्यांश, संधि, समास, उपसर्ग-प्रत्यय, संज्ञा से अव्यय, पर्यायवाची, विलोम, मुहावरे एवं वाक्य शुद्धि।',
    syllabusTopics: [
      'अपठित गद्यांश एवं सारांश प्रश्न',
      'वर्ण विचार, स्वर, व्यंजन एवं उच्चारण स्थान',
      'संधि (स्वर, व्यंजन, विसर्ग संधि नियम)',
      'समास (अव्ययीभाव, तत्पुरुष, द्वंद्व, बहुव्रीहि आदि)',
      'उपसर्ग, प्रत्यय एवं शब्द निर्माण',
      'पर्यायवाची, विलोम एवं अनेकार्थक शब्द',
      'मुहावरे, लोकोक्तियाँ एवं कहावतें',
      'वाक्य शुद्धि, लिंग, वचन एवं कारक'
    ],
    videos: [
      {
        id: 'hin_v1',
        title: 'DSSSB संपूर्ण हिंदी व्याकरण महा मैराथन (20/20 अंक)',
        channel: 'Hindi Academy',
        duration: '3h 30m',
        url: 'https://www.youtube.com/results?search_query=dsssb+hindi+grammar+marathon',
        tag: 'संपूर्ण हिंदी'
      },
      {
        id: 'hin_v2',
        title: 'संधि एवं समास पहचानने की अचूक ट्रिक',
        channel: 'BytePrep CS',
        duration: '1h 15m',
        url: 'https://www.youtube.com/results?search_query=dsssb+sandhi+samay+hindi+tricks',
        tag: 'ट्रिक्स'
      }
    ],
    notes: [
      {
        id: 'hin_n1',
        title: 'हिंदी व्याकरण सूत्र पुस्तिका - संधि, समास एवं कारक चार्ट',
        pages: 16,
        type: 'formula_sheet',
        summary: 'स्वर व व्यंजन संधि के नियम, समास विग्रह तालिका, और कारक विभक्तियों का त्वरित पुनरावलोकन।'
      },
      {
        id: 'hin_n2',
        title: 'DSSSB में पूछे गए 300 महत्वपूर्ण मुहावरे, विलोम व पर्यायवाची',
        pages: 22,
        type: 'quick_summary',
        summary: 'विगत वर्षों (2018-2024) में बार-बार पूछे जाने वाले कठिन शब्दों व लोकोक्तियों का संकलन।'
      }
    ]
  },

  // --- COMPUTER SCIENCE CORE TOPICS (DOE-01 to DOE-32) ---
  'os': {
    id: 'os',
    title: 'Operating Systems (DOE-15)',
    code: 'DOE-15',
    category: 'part_b_cs',
    iconType: 'computer',
    accentGradient: 'from-indigo-600 via-blue-600 to-cyan-600',
    badge: 'Core Subject • Part B',
    overview: 'Process lifecycle, CPU Scheduling (FCFS, SJF, SRTF, RR, Priority), Deadlocks (Banker’s Algorithm), Memory Management (Paging, Segmentation, TLB, Page Replacement) and Disk Scheduling.',
    syllabusTopics: [
      'Processes, Threads & Process State Transitions',
      'CPU Scheduling Algorithms & Gantt Chart Calculations',
      'Process Synchronization: Semaphores, Critical Section & Monitors',
      'Deadlock Prevention, Avoidance (Banker\'s Algorithm) & Detection',
      'Memory Management: Paging, Segmentation & Inverted Page Tables',
      'Virtual Memory & Page Replacement (FIFO, LRU, Optimal)',
      'Disk Scheduling: FCFS, SSTF, SCAN, C-SCAN, LOOK',
      'File Systems & Directory Structures'
    ],
    videos: [
      {
        id: 'os_v1',
        title: 'Operating Systems Complete Playlist for DSSSB TGT/PGT CS',
        channel: 'Knowledge Gate / Gate Smashers',
        duration: '6h 30m',
        url: 'https://www.youtube.com/results?search_query=gate+smashers+operating+system+playlist',
        tag: 'Full Playlist'
      },
      {
        id: 'os_v2',
        title: 'CPU Scheduling & Banker\'s Algorithm Numericals Marathon',
        channel: 'BytePrep CS',
        duration: '2h 10m',
        url: 'https://www.youtube.com/results?search_query=dsssb+operating+systems+numericals',
        tag: 'Numericals'
      },
      {
        id: 'os_v3',
        title: 'Page Replacement Algorithms (FIFO, LRU, OPT) Step-by-Step',
        channel: 'CS Concepts',
        duration: '45m',
        url: 'https://www.youtube.com/results?search_query=page+replacement+algorithms+gate+smashers',
        tag: 'Virtual Memory'
      }
    ],
    notes: [
      {
        id: 'os_n1',
        title: 'Operating Systems High-Yield Numerical Formulas & Cheat Sheet',
        pages: 18,
        type: 'formula_sheet',
        summary: 'Effective Memory Access Time (EMAT) formulas, Disk Arm movements, Page fault rates, and Scheduling formulas.'
      },
      {
        id: 'os_n2',
        title: 'Deadlocks & Process Synchronization Master Revision Notes',
        pages: 24,
        type: 'handwritten_notes',
        summary: 'Complete Peterson\'s solution, Semaphore implementation, Banker\'s safety state determination with matrices.'
      }
    ]
  },

  'dbms': {
    id: 'dbms',
    title: 'Database Management System - DBMS (DOE-08)',
    code: 'DOE-08',
    category: 'part_b_cs',
    iconType: 'shield',
    accentGradient: 'from-blue-600 via-indigo-600 to-violet-700',
    badge: 'Core Subject • Part B',
    overview: 'Relational model, SQL (DDL, DML, DCL, Joins, Aggregates), Normalization (1NF, 2NF, 3NF, BCNF), ER Diagrams, Transactions & ACID properties, Concurrency Control (2PL, Timestamp).',
    syllabusTopics: [
      'Database Architecture (3-Schema Architecture) & Data Independence',
      'ER Modeling, Entities, Attributes & Cardinality Ratios',
      'Relational Model & Relational Algebra Operations',
      'SQL Queries: Joins, Nested Subqueries, GROUP BY, HAVING',
      'Functional Dependencies, Minimal Cover & Keys (Super, Candidate, Primary)',
      'Normalization: 1NF, 2NF, 3NF, BCNF & Lossless Join Decompositions',
      'Transactions, ACID Properties & Serializability (Conflict & View)',
      'Concurrency Control: 2-Phase Locking (2PL), Deadlock Handling, Indexing (B-Tree/B+ Tree)'
    ],
    videos: [
      {
        id: 'dbms_v1',
        title: 'DBMS Complete Course - Normalization to SQL for DSSSB',
        channel: 'Gate Smashers',
        duration: '7h 15m',
        url: 'https://www.youtube.com/results?search_query=gate+smashers+dbms+playlist',
        tag: 'Full Course'
      },
      {
        id: 'dbms_v2',
        title: 'Finding Candidate Keys & Normal Forms in 10 Seconds',
        channel: 'BytePrep CS',
        duration: '1h 15m',
        url: 'https://www.youtube.com/results?search_query=normalization+tricks+candidate+keys+dbms',
        tag: 'Normalization'
      },
      {
        id: 'dbms_v3',
        title: 'SQL Masterclass: Joins, Subqueries & Aggregate Queries',
        channel: 'Tech Edu',
        duration: '2h 00m',
        url: 'https://www.youtube.com/results?search_query=sql+queries+for+competitive+exams',
        tag: 'SQL'
      }
    ],
    notes: [
      {
        id: 'dbms_n1',
        title: 'DBMS Normalization & Candidate Key Identification Sheet',
        pages: 15,
        type: 'cheat_sheet',
        summary: 'Shortcut rules to identify 1NF, 2NF, 3NF, BCNF, lossless join test, and dependency preservation table.'
      },
      {
        id: 'dbms_n2',
        title: 'SQL Query Handbook & Relational Algebra Symbols',
        pages: 22,
        type: 'formula_sheet',
        summary: 'Cross product, theta join, natural join, projection, selection symbols, SQL commands, and transaction schedules.'
      }
    ]
  },

  'cn': {
    id: 'cn',
    title: 'Computer Networks (DOE-17 & DOE-31)',
    code: 'DOE-17',
    category: 'part_b_cs',
    iconType: 'lightning',
    accentGradient: 'from-cyan-600 via-teal-600 to-blue-700',
    badge: 'Core Subject • Part B',
    overview: 'OSI & TCP/IP Models, IP Addressing (IPv4, IPv6, Subnetting, CIDR), Data Link Protocols (Framing, Flow/Error Control, CRC), Routing Protocols (Distance Vector, Link State), TCP/UDP, DNS, HTTP, DHCP.',
    syllabusTopics: [
      'OSI 7-Layer Model vs TCP/IP Protocol Suite Duties',
      'Data Link Layer: Sliding Window Protocols (Stop & Wait, GBN, SR), CRC Polynomials',
      'Medium Access Control: CSMA/CD, CSMA/CA, Pure & Slotted ALOHA Efficiency',
      'IP Addressing: Classful & Classless (CIDR), Subnet Masking & FLSM/VLSM',
      'Network Layer Routing: Bellman-Ford, Dijkstra, OSPF, BGP, RIP',
      'Transport Layer: TCP Header (3-Way Handshake, Flow/Congestion Control) vs UDP',
      'Application Layer: DNS, DHCP, HTTP/HTTPS, FTP, SMTP, POP3, IMAP',
      'Network Security: Cryptography, RSA, Firewalls, IPSec'
    ],
    videos: [
      {
        id: 'cn_v1',
        title: 'Computer Networks Full Syllabus Revision for DSSSB CS',
        channel: 'Knowledge Gate',
        duration: '8h 00m',
        url: 'https://www.youtube.com/results?search_query=gate+smashers+computer+networks+playlist',
        tag: 'Full Syllabus'
      },
      {
        id: 'cn_v2',
        title: 'IP Addressing, Subnetting & CIDR Numericals Masterclass',
        channel: 'BytePrep CS',
        duration: '2h 15m',
        url: 'https://www.youtube.com/results?search_query=subnetting+tricks+computer+networks',
        tag: 'Subnetting'
      },
      {
        id: 'cn_v3',
        title: 'Sliding Window Protocol Efficiency & CRC Calculations',
        channel: 'Gate CS Tutorials',
        duration: '1h 30m',
        url: 'https://www.youtube.com/results?search_query=sliding+window+protocol+gate+smashers',
        tag: 'Flow Control'
      }
    ],
    notes: [
      {
        id: 'cn_n1',
        title: 'Computer Networks Formulas & Protocol Port Numbers Cheat Sheet',
        pages: 16,
        type: 'formula_sheet',
        summary: 'Bandwidth-Delay product formulas, window size calculations, port numbers (21, 22, 25, 53, 80, 443, etc.), and header sizes.'
      },
      {
        id: 'cn_n2',
        title: 'Complete Subnetting & IP Address Table Guide',
        pages: 14,
        type: 'cheat_sheet',
        summary: 'CIDR prefix /24 to /30 subnets, usable host formulas, network address / broadcast address calculations.'
      }
    ]
  },

  'dsa': {
    id: 'dsa',
    title: 'Programming in C, C++ & Data Structures (DOE-04)',
    code: 'DOE-04',
    category: 'part_b_cs',
    iconType: 'code',
    accentGradient: 'from-emerald-600 via-teal-600 to-indigo-700',
    badge: 'Core Subject • Part B',
    overview: 'C & C++ syntax, Pointers, Arrays, Stacks, Queues, Linked Lists, Binary Trees, BST, AVL Trees, Heap, Graphs (BFS/DFS), Sorting & Searching algorithms and Time Complexity.',
    syllabusTopics: [
      'C & C++ Core: Data Types, Pointers, Pointer Arithmetic, Dynamic Memory (malloc/calloc)',
      'Object Oriented Programming: Classes, Objects, Inheritance, Polymorphism, Virtual Functions',
      'Linear Data Structures: Arrays, Stacks (Infix to Postfix), Queues (Circular, Deque)',
      'Linked Lists: Singly, Doubly, Circular Linked List operations',
      'Non-Linear: Binary Trees, Traversal (Pre, In, Post, Level), BST Search/Insert/Delete',
      'Height Balanced Trees: AVL Rotations, B-Trees & Binary Heap Operations',
      'Graph Representations: Adjacency Matrix/List, BFS, DFS, Topological Sort',
      'Sorting & Searching: Binary Search, QuickSort, MergeSort, HeapSort, Big-O Complexity'
    ],
    videos: [
      {
        id: 'dsa_v1',
        title: 'Complete Data Structures & Algorithms Revision for DSSSB',
        channel: 'Abdul Bari / Gate Smashers',
        duration: '9h 00m',
        url: 'https://www.youtube.com/results?search_query=data+structures+abdul+bari+playlist',
        tag: 'Full Course'
      },
      {
        id: 'dsa_v2',
        title: 'C & C++ Pointer Arithmetic & Output Questions Practice',
        channel: 'BytePrep CS',
        duration: '2h 00m',
        url: 'https://www.youtube.com/results?search_query=c+programming+pointer+questions+gate',
        tag: 'Pointers'
      },
      {
        id: 'dsa_v3',
        title: 'Tree Traversals & AVL Rotations Complete Tutorial',
        channel: 'Knowledge Gate',
        duration: '1h 45m',
        url: 'https://www.youtube.com/results?search_query=avl+tree+rotations+gate+smashers',
        tag: 'Trees'
      }
    ],
    notes: [
      {
        id: 'dsa_n1',
        title: 'Time & Space Complexity Summary Table for All DSA Algorithms',
        pages: 12,
        type: 'formula_sheet',
        summary: 'Best, average, worst case complexities of all sorting (Quick, Merge, Heap, Bubble) and searching algorithms.'
      },
      {
        id: 'dsa_n2',
        title: 'C & C++ OOP Concepts, Operator Precedence & Pointers Handbook',
        pages: 20,
        type: 'handwritten_notes',
        summary: 'Complete syntax reference, constructor-destructor rules, virtual table mechanism, and pointer expressions.'
      }
    ]
  },

  'coa': {
    id: 'coa',
    title: 'Computer Architecture & Digital Electronics (DOE-07 & 09)',
    code: 'DOE-09',
    category: 'part_b_cs',
    iconType: 'computer',
    accentGradient: 'from-amber-600 via-orange-600 to-red-700',
    badge: 'Core Subject • Part B',
    overview: 'Boolean Algebra, K-Maps, Combinational & Sequential Circuits, CPU Design, Register Transfer Language, Addressing Modes, Instruction Pipelining, Cache Memory Mapping (Direct, Set-Associative, Fully Associative).',
    syllabusTopics: [
      'Boolean Logic, SOP/POS, Karnaugh Maps (K-Maps) up to 4-5 Variables',
      'Combinational Circuits: Adders, Subtractors, Multiplexers, Encoders/Decoders',
      'Sequential Circuits: Flip-Flops (SR, JK, D, T), Counters (Synchronous/Asynchronous)',
      'CPU Organization, ALU, Control Unit (Hardwired vs Microprogrammed)',
      'Addressing Modes: Immediate, Direct, Indirect, Register Indirect, Indexed, Relative',
      'Instruction Pipelining, Speedup, Throughput & Pipeline Hazards',
      'Cache Memory Mapping: Direct Mapped, Fully Associative, K-Way Set Associative',
      'Microprocessor 8085 / 8086 Architecture, Pin Diagrams & Interrupts'
    ],
    videos: [
      {
        id: 'coa_v1',
        title: 'Computer Organization & Architecture Full Course',
        channel: 'Gate Smashers',
        duration: '7h 45m',
        url: 'https://www.youtube.com/results?search_query=gate+smashers+computer+organization+architecture',
        tag: 'Full COA'
      },
      {
        id: 'coa_v2',
        title: 'Cache Memory Mapping Numericals Step-by-Step',
        channel: 'BytePrep CS',
        duration: '1h 50m',
        url: 'https://www.youtube.com/results?search_query=cache+mapping+gate+smashers+coa',
        tag: 'Cache Memory'
      },
      {
        id: 'coa_v3',
        title: 'Pipeline Hazards & Speedup Calculation Tricks',
        channel: 'Knowledge Gate',
        duration: '1h 15m',
        url: 'https://www.youtube.com/results?search_query=instruction+pipelining+coa+numericals',
        tag: 'Pipelining'
      }
    ],
    notes: [
      {
        id: 'coa_n1',
        title: 'COA Cache & Pipelining Numerical Formulas Handbook',
        pages: 14,
        type: 'formula_sheet',
        summary: 'Formulas for Cache Tag/Index/Offset bits, CPI, Speedup (S = k / (1 + (k-1)stall)), and average memory access time.'
      },
      {
        id: 'coa_n2',
        title: 'Digital Logic Gates, Flip-Flops & K-Map Solution Guide',
        pages: 18,
        type: 'cheat_sheet',
        summary: 'Excitation tables of JK/D/T flip-flops, master-slave configuration, and boolean theorems.'
      }
    ]
  },

  'software_engg': {
    id: 'software_engg',
    title: 'Software Engineering & Web Design (DOE-10, 13, 26)',
    code: 'DOE-13',
    category: 'part_b_cs',
    iconType: 'target',
    accentGradient: 'from-teal-600 via-emerald-600 to-indigo-700',
    badge: 'Core Subject • Part B',
    overview: 'SDLC Models (Waterfall, Spiral, Agile, RAD), Software Testing (White Box, Black Box, Cyclomatic Complexity), COCOMO Cost Estimation, UML Diagrams, HTML5, CSS3, JavaScript & XML.',
    syllabusTopics: [
      'Software Development Life Cycle (SDLC) Models & Agile / Scrum Framework',
      'Requirement Engineering & SRS Document Characteristics',
      'Software Design: Coupling & Cohesion (High Cohesion, Low Coupling)',
      'Software Metrics & COCOMO Cost Estimation Model Calculations',
      'Software Testing: Black Box (BVA, ECP) vs White Box (Basis Path, Cyclomatic Complexity)',
      'UML Diagrams: Class, Use Case, Sequence, State Machine & Activity Diagrams',
      'Web Design: HTML5 Semantic Tags, CSS3 Flexbox/Grid, JavaScript DOM & Events',
      'XML, DTD, XML Schema & JSON Data Parsing'
    ],
    videos: [
      {
        id: 'se_v1',
        title: 'Software Engineering Complete Syllabus for DSSSB TGT/PGT CS',
        channel: 'Gate Smashers',
        duration: '5h 30m',
        url: 'https://www.youtube.com/results?search_query=gate+smashers+software+engineering+playlist',
        tag: 'Full Course'
      },
      {
        id: 'se_v2',
        title: 'Cyclomatic Complexity & COCOMO Model Numericals',
        channel: 'BytePrep CS',
        duration: '1h 10m',
        url: 'https://www.youtube.com/results?search_query=cyclomatic+complexity+software+engineering',
        tag: 'Numericals'
      }
    ],
    notes: [
      {
        id: 'se_n1',
        title: 'Software Engineering Types of Cohesion & Coupling Table',
        pages: 12,
        type: 'cheat_sheet',
        summary: 'Ranking of Cohesion (Functional down to Coincidental) and Coupling (Data up to Content), with examples.'
      },
      {
        id: 'se_n2',
        title: 'HTML5, CSS & JavaScript Quick Reference Sheets',
        pages: 16,
        type: 'handwritten_notes',
        summary: 'Complete HTML tags, CSS selectors, box model, JS events, and XML parser functions.'
      }
    ]
  },

  'pedagogy': {
    id: 'pedagogy',
    title: 'Teaching Methodology & Pedagogy (Part B)',
    code: 'PART-B-PED',
    category: 'pedagogy',
    iconType: 'sparkles',
    accentGradient: 'from-pink-500 via-rose-600 to-indigo-700',
    badge: '20 Marks • Part B',
    overview: 'Educational psychology, Piaget, Vygotsky, Kohlberg stages, constructivist teaching methods, Bloom\'s taxonomy, CCE, inclusive education, ICT tools & NEP 2020.',
    syllabusTopics: [
      'Child Development & Growth: Physical, Cognitive & Socio-Emotional Stages',
      'Learning Theories: Piaget (Cognitive), Vygotsky (ZPD/Scaffolding), Kohlberg (Moral)',
      'Pedagogical Approaches: Constructivism, Experiential Learning & Project Method',
      'Bloom\'s Taxonomy of Educational Objectives (Cognitive, Affective, Psychomotor)',
      'Assessment & Evaluation: Formative, Summative, Diagnostic & CCE System',
      'Inclusive Education, Rights of Persons with Disabilities & Handling Diverse Classrooms',
      'ICT in Education, Smart Classrooms, Digital Pedagogy & NEP 2020 Guidelines'
    ],
    videos: [
      {
        id: 'ped_v1',
        title: 'DSSSB Teaching Methodology & Pedagogy Complete 20/20 Marks Class',
        channel: 'Let\'s LEARN / Himanshi Singh',
        duration: '4h 20m',
        url: 'https://www.youtube.com/results?search_query=dsssb+pedagogy+himanshi+singh+complete',
        tag: 'Complete Pedagogy'
      },
      {
        id: 'ped_v2',
        title: 'Piaget, Vygotsky, Kohlberg & Bloom\'s Taxonomy Master Class',
        channel: 'BytePrep CS',
        duration: '2h 00m',
        url: 'https://www.youtube.com/results?search_query=piaget+vygotsky+kohlberg+cdp',
        tag: 'Theories'
      }
    ],
    notes: [
      {
        id: 'ped_n1',
        title: 'Pedagogy & Child Development Theories Quick Comparison Table',
        pages: 18,
        type: 'cheat_sheet',
        summary: 'Stages of Piaget (Sensorimotor to Formal), Vygotsky terms, Kohlberg 3 levels 6 stages, and Bloom revised taxonomy.'
      },
      {
        id: 'ped_n2',
        title: 'NEP 2020 & Inclusive Education High-Yield Notes',
        pages: 14,
        type: 'handwritten_notes',
        summary: '5+3+3+4 structure, foundational literacy, assessment reforms, and RPwD Act guidelines.'
      }
    ]
  }
};

export function getSubjectDetail(subjectId: string): SubjectDetailData {
  if (SUBJECT_RESOURCES[subjectId]) {
    return SUBJECT_RESOURCES[subjectId];
  }

  // Fallback for any other CS topic
  return {
    id: subjectId,
    title: subjectId.toUpperCase().replace(/-/g, ' '),
    code: 'CS-TOPIC',
    category: 'part_b_cs',
    iconType: 'computer',
    accentGradient: 'from-indigo-600 via-purple-600 to-blue-700',
    badge: 'Part B Subject',
    overview: `Topic-wise CBT practice and previous year questions for ${subjectId.toUpperCase().replace(/-/g, ' ')}.`,
    syllabusTopics: [
      'Core Theoretical Concepts & Fundamentals',
      'Standard Formulas, Theorems & Architecture',
      'Previous Year Questions & Analytical Models',
      'Advanced Applications & Practice Problems'
    ],
    videos: [
      {
        id: `${subjectId}_v1`,
        title: `${subjectId.toUpperCase()} Complete Concepts for DSSSB CS`,
        channel: 'BytePrep CS & Engineering Hub',
        duration: '2h 30m',
        url: `https://www.youtube.com/results?search_query=dsssb+computer+science+${encodeURIComponent(subjectId)}`,
        tag: 'Full Class'
      }
    ],
    notes: [
      {
        id: `${subjectId}_n1`,
        title: `${subjectId.toUpperCase()} High-Yield Key Points & Quick Formula Notes`,
        pages: 12,
        type: 'quick_summary',
        summary: `Summary of key definitions, properties, and repeated examination questions for ${subjectId}.`
      }
    ]
  };
}
