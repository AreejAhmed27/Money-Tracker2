import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Trash2 } from 'lucide-react';

interface SwipeableRowProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  isDark?: boolean;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onEdit,
  onDelete,
  isDark = false,
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const rowId = useRef(Math.random().toString(36).substring(2, 9)).current;

  const targetOffset = onEdit && onDelete ? -96 : -56;

  // Listen for other row open events to auto-close this row
  useEffect(() => {
    const handleOtherRowOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== rowId) {
        setOffsetX(0);
      }
    };

    window.addEventListener('swipe-row-open', handleOtherRowOpen);
    return () => {
      window.removeEventListener('swipe-row-open', handleOtherRowOpen);
    };
  }, [rowId]);

  const notifyOpen = () => {
    window.dispatchEvent(new CustomEvent('swipe-row-open', { detail: rowId }));
  };

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;

    if (diff < -10) {
      notifyOpen();
    }

    if (diff < 0) {
      setOffsetX(Math.max(diff, targetOffset - 15));
    } else if (offsetX < 0 && diff > 0) {
      setOffsetX(Math.min(targetOffset + diff, 0));
    }
  };

  const handleTouchEnd = () => {
    if (offsetX < -30) {
      setOffsetX(targetOffset);
      notifyOpen();
    } else {
      setOffsetX(0);
    }
    startX.current = null;
    setIsDragging(false);
  };

  // Mouse Drag Handlers for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || startX.current === null) return;
    const currentX = e.clientX;
    const diff = currentX - startX.current;

    if (diff < -10) {
      notifyOpen();
    }

    if (diff < 0) {
      setOffsetX(Math.max(diff, targetOffset - 15));
    } else if (offsetX < 0 && diff > 0) {
      setOffsetX(Math.min(targetOffset + diff, 0));
    }
  };

  const handleMouseUp = () => {
    if (offsetX < -30) {
      setOffsetX(targetOffset);
      notifyOpen();
    } else {
      setOffsetX(0);
    }
    startX.current = null;
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  const closeSwipe = () => {
    setOffsetX(0);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl my-1.5 select-none">
      {/* Hidden Action Buttons behind (Revealed ONLY when front panel slides left) */}
      <div
        className={`absolute inset-y-0 right-0 flex items-center justify-end px-3 gap-2 z-20 rounded-2xl transition-opacity duration-150 ${
          offsetX < -10 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {onEdit && (
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeSwipe();
              onEdit();
            }}
            className="w-9 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-md transition cursor-pointer active:scale-90 shrink-0"
            title="Edit"
            aria-label="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeSwipe();
              onDelete();
            }}
            className="w-9 h-9 bg-rose-600 hover:bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-md transition cursor-pointer active:scale-90 shrink-0"
            title="Delete"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Front Solid Sliding Panel */}
      <div
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          if (offsetX < 0) {
            closeSwipe();
          }
        }}
        className={`relative z-10 w-full rounded-2xl transition-transform duration-200 ease-out ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        {children}
      </div>
    </div>
  );
};
