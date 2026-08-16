import React from 'react';
import { Info, Code, FileText } from 'lucide-react';

/**
 * Normalizes encoding artifacts, HTML entities, Mojibake, zero-width characters,
 * and non-standard bullet symbols commonly found in raw JSON imports.
 */
export function normalizeStringArtifacts(raw: any): string {
  if (raw === null || raw === undefined) return '';
  let str = String(raw);

  if (!str) return '';

  // 1. Fix literal escaped newlines/tabs from raw stringified JSON
  str = str.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');

  // 2. Remove Zero-width characters, BOM, and replacement characters
  str = str.replace(/[\u200B-\u200D\uFEFF\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

  // 3. Normalize Non-breaking spaces and special spaces
  str = str.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ');

  // 4. Resolve HTML entities
  str = str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&ndash;|&mdash;/gi, '–');

  // 5. Fix common UTF-8 Mojibake / double-encoding corruption patterns
  str = str
    .replace(/â€¢/g, '•')
    .replace(/â€“|â€”/g, '–')
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/â€/g, '"')
    .replace(/Â/g, '')
    .replace(/ï»¿/g, '');

  // 6. Convert erratic or non-standard bullet characters to standard bullet symbol "•"
  // e.g. Wingdings bullet '', solid dots '●', squares '▪', '◼', '◆', '➢', ''
  str = str.replace(/[\uF0A7\uF0B7\u25CF\u25AA\u25FE\u25C6\u27A1\u27A2]/g, '•');

  // 7. Normalize smart quotes and dashes to standard ASCII / Unicode
  str = str
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '–');

  // 8. Normalize Windows CRLF to standard LF
  str = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 9. Normalize horizontal whitespace per line (preserve single spaces, trim trailing line spaces)
  str = str
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n');

  // 10. Collapse 3+ consecutive newlines to clean double newline
  str = str.replace(/\n{3,}/g, '\n\n');

  return str.trim();
}

/**
 * Robust Regex parser to standardize question stems, ensuring proper line breaks,
 * consistent list indentations, and clean sub-statement formatting.
 */
export function standardizeQuestionString(rawText: string): string {
  if (!rawText) return '';

  // Step 1: Base artifact normalization
  let str = normalizeStringArtifacts(rawText);

  // Step 2: Strip leading question prefix noise e.g., "[Test 1 - Q1]", "[Q.1]", "Q1.", "Question 1:"
  str = str.replace(/^\[(?:Test\s*\d+\s*[-–]\s*)?Q\s*\.?\s*\d+\]\s*/i, '');
  str = str.replace(/^\((?:Test\s*\d+\s*[-–]\s*)?Q\s*\.?\s*\d+\)\s*/i, '');
  str = str.replace(/^Q\s*\.?\s*\d+[\.\:\-\s]\s*/i, '');
  str = str.replace(/^Question\s*\.?\s*\d+[\.\:\-\s]\s*/i, '');

  // Step 3: Insert proper line breaks before inline Sub-Statements / Roman items if mashed on one line
  // e.g., "Consider: (i) statement 1 (ii) statement 2" -> "Consider:\n(i) statement 1\n(ii) statement 2"
  str = str.replace(/([^\n])\s*(\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|1|2|3|4|5)\)\s+[^\n]+)/gi, '$1\n$2');

  // Step 4: Insert line breaks before "Statement I:", "Statement 1:", "Statement II:", "Assertion (A):", "Reason (R):"
  str = str.replace(/([^\n])\s*(Statement\s*(?:I|II|III|IV|1|2|3|4|\(I\)|\(1\))\s*[\:\-])/gi, '$1\n\n$2');
  str = str.replace(/([^\n])\s*(कथन\s*(?:I|II|III|IV|1|2|3|4|\(I\)|\(1\))\s*[\:\-])/gi, '$1\n\n$2');
  str = str.replace(/([^\n])\s*(Assertion\s*(?:\(A\)|A)\s*[\:\-])/gi, '$1\n\n$2');
  str = str.replace(/([^\n])\s*(Reason\s*(?:\(R\)|R)\s*[\:\-])/gi, '$1\n\n$2');

  // Step 5: Format inline bullet lists on new lines
  str = str.replace(/([^\n])\s*(•\s+)/g, '$1\n$2');

  // Step 6: Format question closing prompts on new lines
  // e.g., "Which of the statements given above is/are correct?", "Select the correct answer using..."
  str = str.replace(/([^\n])\s*(((?:Which|Choose|Select|In light of|Find|Among)\s+the\s+(?:following|above|given)[\s\S]*?(?:correct|true|false|incorrect|statement|code|options?)\??)\s*)$/gi, '$1\n\n$2');

  // Step 7: Separate Note / Direction suffixes neatly
  str = str.replace(/\s*(\((?:Note|नोट)[\s\:][^\)]+\))\s*$/i, '\n\n$1');

  // Step 8: Fix attached punctuation like "?(Note:" -> "? (Note:"
  str = str.replace(/\?\(Note:/gi, '? (Note:');
  str = str.replace(/\?\(नोट:/gi, '? (नोट:');

  // Step 9: Re-clean whitespace and line breaks
  str = str
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');

  return str.trim();
}

/**
 * Strips leading question noise like "[Test 1 - Q1]", "[Q.1]", "Q1.", "1. " at the start of question stems.
 */
export function cleanQuestionStem(text: string): string {
  return standardizeQuestionString(text);
}

/**
 * Detects if an option string already starts with a prefix syntax like "A.", "1.", "(1)", "(A)", "1)", "A)", "Option 1:", "विकल्प 1:"
 */
export function hasOptionPrefix(opt: any): boolean {
  if (opt === null || opt === undefined) return false;
  const str = normalizeStringArtifacts(String(opt)).trim();
  return /^(?:[A-Da-d0-9][\.\)]|\([A-Da-d0-9]+\)|Option\s*[A-D0-9]*[\:\.]?|विकल्प\s*[A-D0-9]*[\:\.]?)\s*/i.test(str);
}

/**
 * Returns clean option text by stripping redundant prefixes (e.g. "A) ...", "(1) ...", "Option 1: ...")
 * while preserving numbers, math, formulas, and code syntax.
 */
export function cleanOptionText(opt: any): string {
  if (opt === null || opt === undefined) return '';
  let str = normalizeStringArtifacts(String(opt)).trim();

  // Strip layered prefixes like "Option 1: 1. Text" or "A. (1) Text"
  let prev = '';
  while (str !== prev) {
    prev = str;
    str = str.replace(
      /^(?:Option\s*[A-Da-d0-9]*[\:\.]?\s*|विकल्प\s*[A-Da-d0-9]*[\:\.]?\s*|\([A-Da-d0-9]+\)\s*|[A-Da-d][\.\)]\s*|(?:i|ii|iii|iv|v|vi|vii|viii|ix|x)[\.\)]\s*)/i,
      ''
    ).trim();
  }

  return str;
}

/**
 * Formats option for display preserving raw prefix if present, or adding default A./B./C./D. prefix if missing.
 */
export function getDisplayOptionText(opt: any, index: number): string {
  if (opt === null || opt === undefined) return '';
  const cleaned = cleanOptionText(opt);
  return `${String.fromCharCode(65 + index)}. ${cleaned}`;
}

/**
 * Checks if a block of text is likely code (C, C++, Java, Python, SQL, HTML, etc.)
 */
export function isCodeSnippet(text: string): boolean {
  if (!text) return false;
  const codeIndicators = [
    /#include\s*<.*?>/i,
    /\b(?:int|void|char|float|double|public\s+class|def\s+|function\s+|SELECT\s+.*?\s+FROM|UPDATE\s+|INSERT\s+INTO|CREATE\s+TABLE)\b/i,
    /;\s*\n/,
    /{\s*\n/,
    /\bprintf\s*\(|\bcout\s*<<|\bSystem\.out\.print|\bconsole\.log/i,
    /\bfor\s*\([^)]*?;[^)]*?;[^)]*?\)/i,
    /\bwhile\s*\([^)]*?\)\s*\{/i
  ];
  return codeIndicators.some(pattern => pattern.test(text));
}

/**
 * Standardized text formatter that preserves natural paragraphs, sentences,
 * and breaks only on genuine structural points (statements, notes, list items).
 */
export function formatStructuredText(text: string): string {
  if (!text) return '';
  return standardizeQuestionString(text);
}

export interface FormattedTextProps {
  text: string;
  className?: string;
  asParagraph?: boolean;
}

export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  className = '',
  asParagraph = true,
}) => {
  const cleaned = standardizeQuestionString(text);

  if (!asParagraph) {
    return <span className={`break-words leading-relaxed ${className}`}>{cleaned}</span>;
  }

  // If text has distinct lines or paragraphs
  const paragraphs = cleaned.split(/\n\n+/).filter(Boolean);

  if (paragraphs.length <= 1) {
    return <p className={`break-words leading-relaxed m-0 ${className}`}>{cleaned}</p>;
  }

  return (
    <div className={`space-y-2 leading-relaxed ${className}`}>
      {paragraphs.map((p, idx) => (
        <p key={idx} className="m-0 break-words whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
};

interface ParsedQuestionParts {
  direction?: string;
  mainStem: string;
  codeSnippet?: string;
  statements?: { label: string; text: string }[];
  matchingList?: { list1: { key: string; val: string }[]; list2: { key: string; val: string }[] };
  note?: string;
  footerPrompt?: string;
}

/**
 * Deep structural question parser for Testbook & DSSSB standard layout
 */
export function parseQuestionStructure(rawQuestion: string): ParsedQuestionParts {
  const cleaned = standardizeQuestionString(rawQuestion);
  const result: ParsedQuestionParts = {
    mainStem: cleaned
  };

  // 1. Extract Note (Note: ...)
  const noteMatch = cleaned.match(/\((?:Note|नोट)\s*[\:\-]?\s*([^\)]+)\)/i);
  let workingText = cleaned;
  if (noteMatch) {
    result.note = noteMatch[1].trim();
    workingText = workingText.replace(noteMatch[0], '').trim();
  }

  // 2. Extract Directions (e.g., "Directions (Q. 1 - 5): Read the passage...")
  const directionMatch = workingText.match(/^((?:Direction|Directions|निर्देश|Passage)\s*(?:\([^)]*\))?[\:\-]?\s*[\s\S]+?(?=\n\n|\n[A-Z0-9\u0900-\u097F]|\nQ\.|\n\d+\.|$))/i);
  if (directionMatch && directionMatch[1].length > 25 && workingText.length > directionMatch[1].length + 10) {
    result.direction = directionMatch[1].trim();
    workingText = workingText.slice(directionMatch[0].length).trim();
  }

  // 3. Extract Code Snippets if present
  if (isCodeSnippet(workingText)) {
    // Check if code is separated or inline
    const codeBlockMatch = workingText.match(/((?:#include[\s\S]*?}|int\s+main[\s\S]*?}|(?:public\s+class|def\s+|SELECT\s+)[\s\S]+?(?:\n\n|(?=What\s+is|Which\s+of|Find\s+the|Output|Predict)|$)))/i);
    if (codeBlockMatch) {
      result.codeSnippet = codeBlockMatch[1].trim();
      workingText = workingText.replace(codeBlockMatch[0], '').trim();
    }
  }

  // 4. Extract Statements (Statement I / Statement II, Assertion / Reason, (i), (ii), etc.)
  const statementPatterns = [
    // Statement I / Statement II
    /(?:(?:Statement|कथन)\s*(?:I|1|\(I\)|\(1\))\s*[\:\-]\s*([\s\S]+?))\s*(?:(?:Statement|कथन)\s*(?:II|2|\(II\)|\(2\))\s*[\:\-]\s*([\s\S]+?))(?=\s*(?:Which\s+of|उपर्युक्त|Choose|Select|$))/i,
    // Assertion (A) / Reason (R)
    /(?:(?:Assertion|अभिकथन)\s*(?:\(A\)|A)\s*[\:\-]\s*([\s\S]+?))\s*(?:(?:Reason|कारण)\s*(?:\(R\)|R)\s*[\:\-]\s*([\s\S]+?))(?=\s*(?:Which\s+of|उपर्युक्त|In\s+light|Choose|Select|$))/i
  ];

  for (const pat of statementPatterns) {
    const sMatch = workingText.match(pat);
    if (sMatch) {
      if (sMatch[0].toLowerCase().includes('assertion')) {
        result.statements = [
          { label: 'Assertion (A)', text: sMatch[1].trim() },
          { label: 'Reason (R)', text: sMatch[2].trim() }
        ];
      } else {
        result.statements = [
          { label: 'Statement I', text: sMatch[1].trim() },
          { label: 'Statement II', text: sMatch[2].trim() }
        ];
      }
      
      const parts = workingText.split(sMatch[0]);
      result.mainStem = parts[0].trim() || 'Consider the following statements:';
      result.footerPrompt = parts[1]?.trim() || '';
      return result;
    }
  }

  // 5. Extract numbered sub-statements: (i), (ii) or 1., 2. when introduced by "Consider the following"
  const romanStatementsMatch = workingText.match(/(?:Consider\s+the\s+following|निम्नलिखित\s+पर\s+विचार)[\s\S]*?(\((?:i|1)\)[\s\S]+?\((?:ii|2)\)[\s\S]+?)(?=(?:Which\s+of|उपर्युक्त|Choose|Select)|$)/i);
  if (romanStatementsMatch) {
    const rawItems = romanStatementsMatch[1];
    const items = rawItems.split(/(?=\((?:i|ii|iii|iv|v|1|2|3|4|5)\))/i).filter(Boolean);
    if (items.length >= 2) {
      result.statements = items.map((item, idx) => {
        const itemClean = item.replace(/^\((?:i|ii|iii|iv|v|1|2|3|4|5)\)\s*/i, '').trim();
        const romanLabels = ['(i)', '(ii)', '(iii)', '(iv)', '(v)'];
        return {
          label: romanLabels[idx] || `(${idx + 1})`,
          text: itemClean
        };
      });

      const splitIndex = workingText.indexOf(rawItems);
      result.mainStem = workingText.substring(0, splitIndex).trim();
      result.footerPrompt = workingText.substring(splitIndex + rawItems.length).trim();
      return result;
    }
  }

  result.mainStem = workingText;
  return result;
}

interface StandardizedQuestionProps {
  question: string;
  language?: 'English' | 'Hindi';
  className?: string;
}

/**
 * Standardized Testbook / NTA CBT Question Layout Component
 */
export const StandardizedQuestionView: React.FC<StandardizedQuestionProps> = ({
  question,
  language = 'English',
  className = ''
}) => {
  const parsed = parseQuestionStructure(question);

  return (
    <div className={`space-y-4 text-slate-800 text-sm md:text-[15px] font-normal leading-relaxed ${className}`}>
      {/* 1. Optional Direction / Passage Box */}
      {parsed.direction && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 md:p-4 text-xs md:text-sm text-amber-950 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 uppercase text-[10px] md:text-[11px] tracking-wider">
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            <span>Directions / Passage</span>
          </div>
          <div className="text-slate-800 font-medium whitespace-pre-line leading-relaxed pl-5 border-l-2 border-amber-300">
            {parsed.direction}
          </div>
        </div>
      )}

      {/* 2. Main Question Stem */}
      {parsed.mainStem && (
        <div className="font-semibold text-slate-900 text-sm md:text-base leading-relaxed tracking-normal">
          {language === 'Hindi' && !parsed.mainStem.includes('[प्रश्न]') ? (
            <span>{parsed.mainStem}</span>
          ) : (
            <span>{parsed.mainStem}</span>
          )}
        </div>
      )}

      {/* 3. Code Block (Syntax Formatted Monospace Box) */}
      {parsed.codeSnippet && (
        <div className="bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-sm my-3">
          <div className="bg-slate-800 px-3.5 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-300 border-b border-slate-700">
            <span className="flex items-center gap-1.5 font-bold">
              <Code className="w-3.5 h-3.5 text-emerald-400" />
              <span>Program Code Snippet</span>
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">C / C++ / Algorithm</span>
          </div>
          <pre className="p-3.5 md:p-4 text-xs md:text-sm font-mono overflow-x-auto whitespace-pre leading-relaxed text-emerald-300">
            <code>{parsed.codeSnippet}</code>
          </pre>
        </div>
      )}

      {/* 4. Structured Statements Box (Statement I / II, Assertion / Reason, Roman (i) / (ii)) */}
      {parsed.statements && parsed.statements.length > 0 && (
        <div className="space-y-2.5 my-3 bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 md:p-4">
          {parsed.statements.map((stmt, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm">
              <span className="font-bold text-blue-900 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md text-[11px] shrink-0 mt-0.5 shadow-2xs">
                {stmt.label}
              </span>
              <span className="text-slate-800 font-medium leading-relaxed flex-1">
                {stmt.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 5. Footer Prompt (e.g. "Which of the statements given above is/are correct?") */}
      {parsed.footerPrompt && (
        <div className="font-semibold text-slate-900 text-xs md:text-sm pt-1">
          {parsed.footerPrompt}
        </div>
      )}

      {/* 6. Informational Note Pill */}
      {parsed.note && (
        <div className="inline-flex items-start gap-1.5 bg-blue-50/80 border border-blue-200/70 text-blue-950 text-[11px] md:text-xs font-medium px-3 py-1.5 rounded-lg">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
          <span><strong className="font-bold">Note:</strong> {parsed.note}</span>
        </div>
      )}
    </div>
  );
};
