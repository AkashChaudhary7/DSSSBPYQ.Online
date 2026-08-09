import { Quiz } from '../types';
import { cleanOptionText } from './formatText';

interface PdfMetadata {
  totalQuestions: number;
  score: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  minutes: number;
  seconds: number;
}

export async function generateQuizPdf(quiz: Quiz, metadata: PdfMetadata): Promise<void> {
  const { totalQuestions, score, correctCount, incorrectCount, accuracy, minutes, seconds } = metadata;

  // Dynamically load large dependencies only when needed to optimize bundle size and LCP
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  // Create offscreen container
  const container = document.createElement('div');
  container.id = 'pdf-export-container';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // A4 width at 96 DPI
  container.style.backgroundColor = '#f1f5f9'; // Slate-100 background between pages
  container.style.fontFamily = "'Noto Sans Devanagari', 'Outfit', system-ui, -apple-system, sans-serif";
  container.style.color = '#0f172a';
  document.body.appendChild(container);

  try {
    const pageHeightPx = 1123; // A4 height at 96 DPI
    const paddingPx = 36;
    const maxContentHeight = pageHeightPx - (paddingPx * 2) - 80; // Leaving room for header and footer

    const pages: HTMLElement[] = [];

    const createNewPage = (pageNum: number): { pageEl: HTMLElement; contentEl: HTMLElement } => {
      const pageEl = document.createElement('div');
      pageEl.className = 'pdf-page';
      pageEl.style.width = '794px';
      pageEl.style.height = '1123px';
      pageEl.style.boxSizing = 'border-box';
      pageEl.style.padding = `${paddingPx}px`;
      pageEl.style.backgroundColor = '#ffffff';
      pageEl.style.position = 'relative';
      pageEl.style.display = 'flex';
      pageEl.style.flexDirection = 'column';
      pageEl.style.justifyContent = 'space-between';
      pageEl.style.fontFamily = "'Noto Sans Devanagari', 'Outfit', sans-serif";

      // Header
      const headerEl = document.createElement('div');
      headerEl.style.display = 'flex';
      headerEl.style.justifyContent = 'space-between';
      headerEl.style.alignItems = 'center';
      headerEl.style.borderBottom = '2px solid #e2e8f0';
      headerEl.style.paddingBottom = '8px';
      headerEl.style.marginBottom = '12px';

      headerEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="background: #2563eb; color: #ffffff; font-weight: 800; font-size: 11px; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px;">DSSSBPYQ.ONLINE</div>
          <span style="font-size: 10px; color: #64748b; font-weight: 600;">PREPARATION HUB & SOLUTION PAPER</span>
        </div>
        <div style="font-size: 9px; color: #94a3b8; font-weight: 500;">
          https://dsssbpyq.online
        </div>
      `;

      // Main Content Area
      const contentEl = document.createElement('div');
      contentEl.className = 'pdf-page-content';
      contentEl.style.flex = '1';
      contentEl.style.overflow = 'hidden';

      // Footer
      const footerEl = document.createElement('div');
      footerEl.className = 'pdf-page-footer';
      footerEl.style.borderTop = '1px solid #e2e8f0';
      footerEl.style.paddingTop = '8px';
      footerEl.style.marginTop = '12px';
      footerEl.style.display = 'flex';
      footerEl.style.justifyContent = 'space-between';
      footerEl.style.alignItems = 'center';
      footerEl.style.fontSize = '9px';
      footerEl.style.color = '#64748b';

      footerEl.innerHTML = `
        <div>Website: <b>https://dsssbpyq.online</b> &nbsp;|&nbsp; Telegram: <b>t.me/dsssbpyq_online</b></div>
        <div class="page-num-label" style="font-weight: 600; color: #334155;">Page ${pageNum}</div>
      `;

      pageEl.appendChild(headerEl);
      pageEl.appendChild(contentEl);
      pageEl.appendChild(footerEl);

      container.appendChild(pageEl);
      pages.push(pageEl);

      return { pageEl, contentEl };
    };

    // PAGE 1 INITIALIZATION
    let currentPageObj = createNewPage(1);
    let currentPageEl = currentPageObj.pageEl;
    let currentContentEl = currentPageObj.contentEl;

    // --- TITLE & METADATA CARD (ONLY ON PAGE 1) ---
    const topCard = document.createElement('div');
    topCard.style.marginBottom = '16px';
    topCard.style.borderRadius = '12px';
    topCard.style.overflow = 'hidden';
    topCard.style.border = '1px solid #cbd5e1';

    topCard.innerHTML = `
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 14px 18px; color: #ffffff;">
        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #93c5fd; font-weight: 700; margin-bottom: 2px;">DSSSB Mock Test Solution Export</div>
        <div style="font-size: 16px; font-weight: 800; line-height: 1.3;">${quiz.title}</div>
        <div style="font-size: 10px; color: #e0f2fe; margin-top: 4px; font-weight: 500;">Subject: ${quiz.subject} • Category: ${quiz.category.toUpperCase()}</div>
      </div>
      <div style="background: #f8fafc; padding: 12px 18px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; border-top: 1px solid #e2e8f0; font-size: 10px;">
        <div>
          <div style="color: #64748b; font-size: 9px; font-weight: 600;">TOTAL QUESTIONS</div>
          <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${totalQuestions}</div>
        </div>
        <div>
          <div style="color: #64748b; font-size: 9px; font-weight: 600;">YOUR SCORE</div>
          <div style="font-weight: 800; color: #2563eb; font-size: 13px;">${score} <span style="font-size: 9px; font-weight: 500; color: #64748b;">pts</span></div>
        </div>
        <div>
          <div style="color: #64748b; font-size: 9px; font-weight: 600;">ACCURACY</div>
          <div style="font-weight: 800; color: #059669; font-size: 13px;">${accuracy}%</div>
        </div>
        <div>
          <div style="color: #64748b; font-size: 9px; font-weight: 600;">TIME SPENT</div>
          <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${minutes}m ${seconds}s</div>
        </div>
      </div>
    `;

    currentContentEl.appendChild(topCard);

    // Section Header
    const sectionTitle = document.createElement('div');
    sectionTitle.style.fontSize = '12px';
    sectionTitle.style.fontWeight = '800';
    sectionTitle.style.color = '#1e293b';
    sectionTitle.style.paddingBottom = '6px';
    sectionTitle.style.marginBottom = '12px';
    sectionTitle.style.borderBottom = '1.5px dashed #cbd5e1';
    sectionTitle.innerText = 'QUESTION PAPER & DETAILED SOLUTIONS';
    currentContentEl.appendChild(sectionTitle);

    // PROCESS QUESTIONS
    for (let idx = 0; idx < quiz.questions.length; idx++) {
      const q = quiz.questions[idx];

      const qCard = document.createElement('div');
      qCard.style.marginBottom = '14px';
      qCard.style.padding = '10px 12px';
      qCard.style.borderRadius = '8px';
      qCard.style.backgroundColor = '#ffffff';
      qCard.style.border = '1px solid #e2e8f0';
      qCard.style.boxSizing = 'border-box';

      // Section Tag
      const sectionTag = `<span style="display: inline-block; background: #eff6ff; color: #1d4ed8; font-size: 8.5px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-bottom: 6px;">${q.section}</span>`;

      // Question Text with Unicode Hindi
      const qTitle = `<div style="font-size: 11px; font-weight: 700; color: #0f172a; line-height: 1.4; margin-bottom: 8px;">
        <span style="color: #2563eb; font-weight: 800;">Q${idx + 1}.</span> ${q.question}
      </div>`;

      // Options
      let optionsHtml = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">';
      q.options.forEach((opt, oIdx) => {
        const isCorrect = q.answer === oIdx;
        const optLetter = String.fromCharCode(65 + oIdx);
        const displayOpt = cleanOptionText(opt);

        if (isCorrect) {
          optionsHtml += `
            <div style="background: #f0fdf4; border: 1.5px solid #22c55e; border-radius: 6px; padding: 6px 8px; font-size: 9.5px; color: #15803d; font-weight: 700; display: flex; align-items: center; gap: 6px;">
              <span style="background: #22c55e; color: #ffffff; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; flex-shrink: 0;">${optLetter}</span>
              <span style="flex: 1;">${displayOpt}</span>
              <span style="font-size: 10px;">✓</span>
            </div>
          `;
        } else {
          optionsHtml += `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; font-size: 9.5px; color: #334155; font-weight: 500; display: flex; align-items: center; gap: 6px;">
              <span style="background: #e2e8f0; color: #475569; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; flex-shrink: 0; font-weight: 700;">${optLetter}</span>
              <span style="flex: 1;">${displayOpt}</span>
            </div>
          `;
        }
      });
      optionsHtml += '</div>';

      // Explanation Box
      const expHtml = `
        <div style="background: #f8fafc; border-left: 3px solid #3b82f6; border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; border-radius: 0 6px 6px 0; padding: 6px 10px; font-size: 9px; color: #475569; line-height: 1.4;">
          <strong style="color: #1e40af;">व्याख्या (Explanation):</strong> ${q.explanation}
        </div>
      `;

      qCard.innerHTML = sectionTag + qTitle + optionsHtml + expHtml;

      // Temporarily append to test height
      currentContentEl.appendChild(qCard);

      // Check height overflow
      if (currentContentEl.scrollHeight > maxContentHeight && currentContentEl.children.length > 1) {
        // Remove from current page and move to new page
        currentContentEl.removeChild(qCard);

        const newPageObj = createNewPage(pages.length + 1);
        currentPageEl = newPageObj.pageEl;
        currentContentEl = newPageObj.contentEl;

        currentContentEl.appendChild(qCard);
      }
    }

    // Update total page numbers in footers
    const totalPagesCount = pages.length;
    pages.forEach((p, pIdx) => {
      const pageNumEl = p.querySelector('.page-num-label');
      if (pageNumEl) {
        pageNumEl.textContent = `Page ${pIdx + 1} of ${totalPagesCount}`;
      }
    });

    // Wait a brief moment for fonts / layouts to stabilize
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Render each page container to PDF using html2canvas
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    for (let i = 0; i < pages.length; i++) {
      const pageNode = pages[i];
      const canvas = await html2canvas(pageNode, {
        scale: 2, // High resolution crisp text
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Completely remove all <style> elements from the cloned document.
          // This prevents html2canvas's CSS parser from crashing on Tailwind v4 oklch() color syntax.
          // Since our PDF elements are programmatically created with inline styling, they do not require application styles.
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach((style) => {
            style.remove();
          });

          // Remove all link stylesheets except Google Fonts to bypass any other stylesheet parsing issues
          const linkElements = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
          linkElements.forEach((link) => {
            const href = link.getAttribute('href') || '';
            if (!href.includes('fonts.googleapis.com')) {
              link.remove();
            }
          });

          // Sanitize inline styles just in case oklch or oklab color leaked anywhere
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const inlineStyle = el.getAttribute('style');
            if (inlineStyle) {
              let updatedStyle = inlineStyle;
              if (inlineStyle.includes('oklch')) {
                updatedStyle = updatedStyle.replace(/oklch\([^)]+\)/gi, '#2563eb');
              }
              if (inlineStyle.includes('oklab')) {
                updatedStyle = updatedStyle.replace(/oklab\([^)]+\)/gi, '#2563eb');
              }
              if (updatedStyle !== inlineStyle) {
                el.setAttribute('style', updatedStyle);
              }
            }
          });
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    }

    pdf.save(`DSSSBPYQ_ONLINE_${quiz.testId}_Solution_Paper.pdf`);
  } finally {
    // Clean up temporary DOM container
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
