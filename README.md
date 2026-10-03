# DSSSB PYQ & Mock Test Application

An advanced offline-first web application designed for DSSSB (Delhi Subordinate Services Selection Board) examination preparation, including TGT Computer Science and Common DSSSB Part A subjects (Quantitative Aptitude, Reasoning, General Awareness, English, and Hindi).

---

## 🚀 Quick Start for Developers

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Setup & Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Run local development server (runs on http://localhost:3000)
npm run dev

# 3. Type check & lint
npm run lint

# 4. Production build verification
npm run build
```

---

## 📁 Content Sync Workflow: Adding Mocks & Content directly via GitHub

You can add new mock tests, PYQ sets, or topic quizzes directly to your GitHub repository without needing to modify source code. The application uses dynamic on-demand content fetching.

### Step 1: Create or Update Mock Question JSON Files
Add your new mock question data as a JSON file under:
`public/content/mocks/<test_id>.json`

**Supported JSON Schema formats:**

#### Format A: Clean Array of Question Objects (Recommended)
```json
[
  {
    "id": 1,
    "question": "What is the time complexity of searching an element in a Balanced Binary Search Tree?",
    "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    "correctAnswer": 1,
    "explanation": "In a balanced BST, height is logarithmic (log n), so search operations take O(log n) time.",
    "section": "Part B - Computer Science",
    "topic": "Data Structures"
  },
  {
    "id": 2,
    "question": "Which of the following is an example of an Operating System kernel?",
    "options": ["Monolithic Kernel", "Microkernel", "Hybrid Kernel", "All of the above"],
    "correctAnswer": 3,
    "explanation": "Monolithic, Microkernel, and Hybrid are all recognized OS kernel architectures.",
    "section": "Part B - Computer Science",
    "topic": "Operating System"
  }
]
```

#### Format B: Wrapped Object with Questions Array
```json
{
  "testId": "dsssb_tgt_cs_mock_01",
  "title": "DSSSB TGT Computer Science Full Mock 01",
  "questions": [ ... ]
}
```

---

### Step 2: Register New Quiz in Metadata Registry
Open `public/content/quizzes-metadata.json` and append your new quiz entry to the JSON array:

```json
{
  "testId": "dsssb_tgt_cs_mock_01",
  "title": "DSSSB TGT Computer Science Full Mock 01",
  "category": "full",
  "subject": "TGT Computer Science",
  "topic": "Full Length Mock",
  "totalTimeMinutes": 120,
  "markingScheme": {
    "correct": 1,
    "negative": 0.25
  },
  "qCount": 200,
  "file": "/content/mocks/dsssb_tgt_cs_mock_01.json"
}
```

#### Category Taxonomy Guidelines:
- `"category": "full"` — Full-length 200-question mock tests (Part A + Part B)
- `"category": "part_a"` — Common DSSSB Part A Subject Tests (Reasoning, English, Math, GA, Hindi)
- `"category": "part_b"` — Specialization Subject Tests (e.g. TGT Computer Science, Teaching Methodology)

---

### Step 3: Push Changes directly to GitHub
```bash
git add public/content/
git commit -m "feat(content): add DSSSB TGT CS Mock Test 01"
git push origin main
```

Upon pushing to GitHub, any deployed Cloud Run instance or PWA app will instantly fetch the new metadata file on next app launch or refresh, with zero code rebuild required!

---

## ⚡ Application Architecture Summary

- **Frontend**: React 18 / Vite with Tailwind CSS
- **Offline / PWA**: Web Worker Service Worker (`/public/sw.js`) + Cache API for instant offline quiz loading
- **Database / Auth**: Firebase Firestore & Firebase Auth (`/src/lib/firebase.ts`)
- **Animations**: `motion/react` & `lucide-react` icons
- **State & Storage**: LocalStorage fallback with automatic online sync to Firestore
