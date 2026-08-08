import React from 'react';

/**
 * Detects if an option string already starts with a prefix syntax like "A.", "1.", "(1)", "(A)", "1)", "A)", "Option 1:", "विकल्प 1:"
 */
export function hasOptionPrefix(opt: any): boolean {
  if (opt === null || opt === undefined) return false;
  const str = String(opt).trim();
  return /^(?:[A-Da-d0-9][\.\)]|\([A-Da-d0-9]+\)|Option\s*[A-D0-9]*[\:\.]?|विकल्प\s*[A-D0-9]*[\:\.]?)\s*/i.test(str);
}

/**
 * Returns raw option string trimmed preserving JSON syntax.
 */
export function cleanOptionText(opt: any): string {
  if (opt === null || opt === undefined) return '';
  let str = String(opt).trim();

  // Iteratively strip layered prefixes (e.g. "Option 1: 1. Text" -> "Text", "1. Text" -> "Text", "A. Text" -> "Text")
  let prev = '';
  while (str !== prev) {
    prev = str;
    str = str.replace(
      /^(?:Option\s*[A-D0-9]*[\:\.]?\s*|विकल्प\s*[A-D0-9]*[\:\.]?\s*|\d+[\.\)]\s*|\(\d+\)\s*|\([A-Da-d]\)\s*|[A-Da-d][\.\)]\s*|(?:i|ii|iii|iv|v|vi|vii|viii|ix|x)[\.\)]\s*)/i,
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
  const str = String(opt).trim();
  if (hasOptionPrefix(str)) {
    return str;
  }
  return `${String.fromCharCode(65 + index)}. ${str}`;
}

/**
 * Intelligent text parser & formatter for exam questions, passages, and solutions.
 * Breaks complex Hindi/English questions, quotes, pipes (|), colons (:),
 * and Viram (।) cleanly across multi-line blocks for optimal legibility.
 * Does NOT split text on commas, dashes, or fill-in-the-blanks (.......... / _____).
 */
export function formatStructuredText(text: string): string {
  if (!text) return '';

  let str = String(text);

  // 1. Normalize carriage returns
  str = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Break line after question mark (?) if followed by space & text
  str = str.replace(/\?(\s+)([A-Z0-9\u0900-\u097F\(\[\"\'])/g, '?\n$2');

  // 3. Break line after colons (:) if followed by space & list, quote, or instruction
  str = str.replace(/:(\s+)([A-Z0-9\u0900-\u097F\(\[\"\'])/g, ':\n$2');

  // 4. Break line after pipe (|) or double pipe (||)
  str = str.replace(/\|+/g, '|\n');

  // 5. Break line before numbered sub-items in question stem (e.g., "(1) ... (2) ...", "I. ... II. ...")
  str = str.replace(/\s+([0-9]+\.\s+)/g, '\n$1');
  str = str.replace(/\s+(\([0-9a-zA-Z]+\)\s+)/g, '\n$1');
  str = str.replace(/\s+([I|V|X]+\.\s+)/gi, '\n$1');

  // 6. Break line after Hindi Viram (।)
  str = str.replace(/।\s*([A-Z0-9\u0900-\u097F\(\[\"\'])/g, '।\n$1');

  // 7. Break line after single sentence-ending period (.)
  // Must NOT match multi-dot fill-in-the-blanks (..........) or common abbreviations.
  str = str.replace(
    /(?<![\.\w\d])(?<!\b(?:e\.g|i\.e|vs|Dr|Mr|Mrs|Ms|Prof|No|Fig|vol|p|pp|approx|est))\.(?!\.)\s+([A-Z\u0900-\u097F][a-zA-Z0-9\u0900-\u097F\s]{2,})/g,
    '.\n$1'
  );

  // 8. Clean up multi-line output
  const lines = str
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  return lines.join('\n');
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
  const formatted = formatStructuredText(text);

  if (!asParagraph) {
    return <span className={`whitespace-pre-wrap leading-relaxed ${className}`}>{formatted}</span>;
  }

  return (
    <div className={`whitespace-pre-wrap leading-relaxed space-y-1.5 ${className}`}>
      {formatted.split('\n').map((line, idx) => (
        <p key={idx} className="m-0">
          {line}
        </p>
      ))}
    </div>
  );
};
