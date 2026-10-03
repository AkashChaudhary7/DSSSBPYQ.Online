import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (newPage: number) => void;
  itemLabel?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage = 20,
  onPageChange,
  itemLabel = 'Mocks',
  className = ''
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  if (totalItems <= itemsPerPage && totalPages <= 1) {
    return (
      <div className={`flex items-center justify-between text-xs text-slate-500 font-bold px-2 py-3 ${className}`}>
        <span>Showing all {totalItems} {itemLabel}</span>
      </div>
    );
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(totalItems, currentPage * itemsPerPage);

  // Generate page numbers array (sliding window)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-sm ${className}`}>
      
      {/* Item Range Details */}
      <div className="text-xs font-bold text-slate-600 dark:text-slate-400 text-center sm:text-left">
        Showing <strong className="text-slate-900 dark:text-white">{startItem}–{endItem}</strong> of <strong className="text-slate-900 dark:text-white">{totalItems}</strong> {itemLabel}
        <span className="hidden md:inline text-slate-400"> • (Page {currentPage} of {totalPages})</span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Previous Button */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-indigo-50 hover:enabled:border-indigo-300 dark:hover:enabled:bg-indigo-950 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Prev</span>
        </button>

        {/* Page Number Buttons */}
        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`dots-${idx}`} className="px-2 text-slate-400 font-bold text-xs select-none">
                …
              </span>
            );
          }
          const pageNum = p as number;
          const isActive = pageNum === currentPage;
          return (
            <button
              key={`page-${pageNum}`}
              onClick={() => handlePageClick(pageNum)}
              className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs scale-105'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-indigo-50 hover:enabled:border-indigo-300 dark:hover:enabled:bg-indigo-950 cursor-pointer"
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};

export default Pagination;
