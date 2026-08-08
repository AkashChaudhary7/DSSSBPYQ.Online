import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { SyllabusItem } from '../data/dsssbExams';
import { CircularProgressRing } from './SyllabusTracker';
import { Check, CheckSquare, Square, ExternalLink } from 'lucide-react';

interface VirtualizedTopicGridProps {
  items: SyllabusItem[];
  checkedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export const VirtualizedTopicGrid: React.FC<VirtualizedTopicGridProps> = memo(({
  items,
  checkedIds,
  onToggle
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(600);
  const [containerHeight, setContainerHeight] = useState(300);

  // Measure container dimensions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setContainerWidth(container.clientWidth || 600);
      setContainerHeight(container.clientHeight || 300);
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle scroll events with requestAnimationFrame for smooth scrolling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
    });
  };

  // Determine columns based on container width
  const cols = useMemo(() => {
    if (containerWidth < 500) return 2;
    if (containerWidth < 720) return 4;
    return 8;
  }, [containerWidth]);

  // Card height in px + gap
  const rowHeight = 110; 
  const gap = 8;
  const totalRows = Math.ceil(items.length / cols);
  const totalHeight = totalRows * rowHeight;

  // Calculate visible range with overscan
  const overscan = 2;
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(totalRows - 1, Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan);

  // Construct visible rows
  const visibleRows = useMemo(() => {
    const rows = [];
    for (let r = startRow; r <= endRow; r++) {
      const rowItems = [];
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (idx < items.length) {
          rowItems.push({ item: items[idx], idx });
        }
      }
      if (rowItems.length > 0) {
        rows.push({ rowIndex: r, rowItems });
      }
    }
    return rows;
  }, [items, cols, startRow, endRow]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="max-h-[300px] overflow-y-auto pr-1 scrollbar-thin relative rounded-2xl"
      style={{ willChange: 'transform' }}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative', width: '100%' }}>
        {visibleRows.map(({ rowIndex, rowItems }) => {
          const top = rowIndex * rowHeight;
          return (
            <div
              key={rowIndex}
              style={{
                position: 'absolute',
                top: `${top}px`,
                left: 0,
                right: 0,
                height: `${rowHeight - gap}px`,
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gap: `${gap}px`
              }}
            >
              {rowItems.map(({ item, idx }) => {
                if (!item || !item.id) return null;
                const isChecked = !!checkedIds[item.id];
                const topicNum = idx + 1;
                const shortTitle = item.title.replace(/^\d+\.\s*/, '');

                return (
                  <div
                    key={item.id}
                    onClick={() => onToggle(item.id)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-between text-center gap-1 select-none ${
                      isChecked
                        ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200 shadow-xs'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                    }`}
                    title={`${item.title} - Click to toggle completion`}
                  >
                    <div className="flex items-center justify-between w-full px-0.5 text-[9px] font-mono text-slate-400">
                      <span>M{topicNum < 10 ? `0${topicNum}` : topicNum}</span>
                      {isChecked && <Check className="w-3 h-3 text-emerald-400" />}
                    </div>

                    <CircularProgressRing 
                      percentage={isChecked ? 100 : 0} 
                      size={26} 
                      strokeWidth={3} 
                    />

                    <span className="text-[10px] font-bold leading-tight line-clamp-2">
                      {shortTitle}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
});

VirtualizedTopicGrid.displayName = 'VirtualizedTopicGrid';

interface VirtualizedTopicListProps {
  items: SyllabusItem[];
  checkedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
  onNavigateToView?: (view: 'part-a-view' | 'part-b-view' | 'adaptive-path' | 'dashboard' | 'syllabus', topicContext?: string) => void;
}

export const VirtualizedTopicList: React.FC<VirtualizedTopicListProps> = memo(({
  items,
  checkedIds,
  onToggle,
  onNavigateToView
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  // If item count is small (<= 8), render directly without virtualization container overhead
  const isSmallList = items.length <= 8;

  useEffect(() => {
    if (isSmallList) return;
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setContainerHeight(container.clientHeight || 400);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isSmallList]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSmallList) return;
    const target = e.currentTarget;
    requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
    });
  };

  const itemHeight = 82; // Estimated height for topic card
  const totalHeight = items.length * itemHeight;

  const overscan = 3;
  const startIndex = isSmallList ? 0 : Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = isSmallList ? items.length - 1 : Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);

  const visibleItems = useMemo(() => {
    const list = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (items[i]) {
        list.push({ item: items[i], index: i });
      }
    }
    return list;
  }, [items, startIndex, endIndex]);

  if (isSmallList) {
    return (
      <div className="divide-y divide-slate-100 p-2 sm:p-3">
        {items.map((item) => (
          <TopicListItem 
            key={item.id}
            item={item}
            isChecked={!!checkedIds[item.id]}
            onToggle={onToggle}
            onNavigateToView={onNavigateToView}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="max-h-[480px] overflow-y-auto pr-1 scrollbar-thin relative p-2 sm:p-3"
      style={{ willChange: 'transform' }}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative', width: '100%' }}>
        {visibleItems.map(({ item, index }) => {
          const top = index * itemHeight;
          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                top: `${top}px`,
                left: 0,
                right: 0,
                height: `${itemHeight - 6}px`
              }}
            >
              <TopicListItem 
                item={item}
                isChecked={!!checkedIds[item.id]}
                onToggle={onToggle}
                onNavigateToView={onNavigateToView}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

VirtualizedTopicList.displayName = 'VirtualizedTopicList';

interface TopicListItemProps {
  item: SyllabusItem;
  isChecked: boolean;
  onToggle: (id: string) => void;
  onNavigateToView?: (view: 'part-a-view' | 'part-b-view' | 'adaptive-path' | 'dashboard' | 'syllabus', topicContext?: string) => void;
}

const TopicListItem: React.FC<TopicListItemProps> = memo(({
  item,
  isChecked,
  onToggle,
  onNavigateToView
}) => {
  return (
    <div 
      onClick={() => onToggle(item.id)}
      className={`p-3.5 rounded-xl transition-all flex items-start justify-between gap-3 cursor-pointer group select-none h-full ${
        isChecked 
          ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border border-emerald-200/50' 
          : 'hover:bg-slate-50 border border-transparent'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.id);
          }}
          className={`mt-1 shrink-0 transition-all cursor-pointer ${
            isChecked ? 'text-emerald-600 scale-110' : 'text-slate-400 group-hover:text-slate-500'
          }`}
        >
          {isChecked ? (
            <CheckSquare className="w-5 h-5 fill-emerald-100" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>

        {/* Small Circular Progress Ring for Topic */}
        <div className="mt-0.5 shrink-0">
          <CircularProgressRing 
            percentage={isChecked ? 100 : 0} 
            size={28} 
            strokeWidth={3} 
          />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {item.code && (
              <span className="bg-slate-900 text-white font-mono text-[10px] font-black px-1.5 py-0.5 rounded">
                {item.code}
              </span>
            )}
            <h4 className={`text-xs sm:text-sm font-bold transition-colors line-clamp-1 ${
              isChecked ? 'text-slate-500 line-through' : 'text-slate-900'
            }`}>
              {item.title}
            </h4>

            {item.importance && (
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                item.importance === 'Core'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : item.importance === 'High'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-slate-100 text-slate-700'
              }`}>
                {item.importance}
              </span>
            )}
          </div>

          {item.description && (
            <p className={`text-xs leading-relaxed line-clamp-1 ${
              isChecked ? 'text-slate-500' : 'text-slate-600'
            }`}>
              {item.description}
            </p>
          )}
        </div>
      </div>

      {item.practiceTab && onNavigateToView && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToView(item.practiceTab!, item.title);
          }}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-extrabold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
        >
          Practice <ExternalLink className="w-3 h-3" />
        </button>
      )}
    </div>
  );
});

TopicListItem.displayName = 'TopicListItem';
