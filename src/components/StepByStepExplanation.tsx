import React from 'react';

interface StepByStepExplanationProps {
  explanation: string;
  className?: string;
}

export default function StepByStepExplanation({ explanation, className = "space-y-4" }: StepByStepExplanationProps) {
  if (!explanation) return null;

  // 1. Split explanations logically
  let rawLines: string[] = [];
  if (explanation.includes('\n')) {
    rawLines = explanation.split('\n');
  } else {
    // If it's a single line, try splitting it by common step indicators
    // Replace step markers with newlines to split them easily
    let formatted = explanation
      .replace(/Step\s+(\d+):?/gi, '\nStep $1:')
      .replace(/(?:\b|(?<=\s))(\d+)\.\s+/g, '\n$1. ')
      .replace(/•\s+/g, '\n• ');

    // If it still hasn't split, split by sentences (period followed by uppercase letter)
    // but avoid splitting common abbreviations like e.g. or i.e. or decimals like 2.5
    if (!formatted.includes('\n')) {
      formatted = formatted.replace(/(?<!\b(?:e\.g|i\.e|etc|vs|p\.m|a\.m))\.\s+([A-Z0-9])/g, '.\n$1');
    }

    rawLines = formatted.split('\n');
  }

  // Filter out any empty lines and trim them
  const steps = rawLines
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return (
    <div className={`${className} animate-fadeIn`} id="step-by-step-explanation-container">
      {steps.map((step, idx) => {
        // Detect if step looks like a numbered step or bullet point
        const isStepIndicator = step.toLowerCase().startsWith('step') || /^\d+\./.test(step) || step.startsWith('•');
        
        // Strip the indicator if redundant to display nicely, or keep it
        let cleanStepText = step;
        let stepLabel = `${idx + 1}`;

        if (step.startsWith('•')) {
          cleanStepText = step.substring(1).trim();
          stepLabel = '•';
        }

        return (
          <div 
            key={idx} 
            className="flex items-start gap-3.5 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100/30 hover:bg-indigo-50/60 transition-colors"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600 font-black text-xs text-white shadow-sm mt-0.5">
              {stepLabel}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs md:text-sm font-semibold text-slate-700 leading-relaxed">
                {cleanStepText}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
