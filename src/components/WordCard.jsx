import { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';

/**
 * WordCard — swipe card using pointer events + CSS transforms
 * Three directions: left=不认识, right=认识, down=模糊
 * Show meaning on first down-swipe. Animate card exit.
 *
 * @param {{ word: string, phonetic?: string, meaning: string, example?: string, exampleSource?: string, current?: number, total: number, onSwipe: (result: 'known'|'fuzzy'|'unknown') => void }} props
 */
const WordCard = forwardRef(function WordCard(
  {
    word = '',
    phonetic = '',
    meaning = '',
    example = '',
    exampleSource = '',
    current = 0,
    total = 0,
    onSwipe,
  },
  ref
) {
  const [showMeaning, setShowMeaning] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [swipeDir, setSwipeDir] = useState('');
  const [animating, setAnimating] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const startPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  // Reset state when word changes
  useEffect(() => {
    setShowMeaning(false);
    setOffsetX(0);
    setOffsetY(0);
    setRotate(0);
    setSwipeDir('');
    setAnimating(false);
    setHasInteracted(false);
  }, [word]);

  useImperativeHandle(ref, () => ({
    show: () => setShowMeaning(true),
    reset: () => {
      setShowMeaning(false);
      setOffsetX(0);
      setOffsetY(0);
      setRotate(0);
      setSwipeDir('');
      setAnimating(false);
      setHasInteracted(false);
    },
  }));

  const finishCard = useCallback(
    (result, direction) => {
      setAnimating(true);
      setSwipeDir(direction);
      setHasInteracted(true);

      setTimeout(() => {
        onSwipe?.(result);
      }, 300);
    },
    [onSwipe]
  );

  const onPointerDown = useCallback((e) => {
    if (animating) return;
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    setAnimating(false);
    setSwipeDir('');
    // Capture pointer to track movement outside element
    e.target.setPointerCapture?.(e.pointerId);
  }, [animating]);

  const onPointerMove = useCallback(
    (e) => {
      if (!isDragging.current || animating) return;
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      const r = dx * 0.05;

      let dir = '';
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
        dir = dx > 0 ? 'right' : 'left';
      } else if (Math.abs(dy) > Math.abs(dx) && dy > 40) {
        dir = 'down';
      }

      setOffsetX(dx);
      setOffsetY(dy);
      setRotate(r);
      setSwipeDir(dir);
    },
    [animating]
  );

  const onPointerUp = useCallback(
    (e) => {
      if (!isDragging.current || animating) {
        isDragging.current = false;
        return;
      }
      isDragging.current = false;

      const dx = offsetX;
      const dy = offsetY;
      const threshold = 80;

      // Down swipe → show meaning (first priority, small movement triggers)
      if (dy > 40 && Math.abs(dx) < 60 && !showMeaning) {
        setShowMeaning(true);
        setOffsetX(0);
        setOffsetY(0);
        setRotate(0);
        setSwipeDir('');
        return;
      }

      // Left swipe → unknown
      if (dx < -threshold) {
        finishCard('unknown', 'left');
        return;
      }

      // Right swipe → known
      if (dx > threshold) {
        finishCard('known', 'right');
        return;
      }

      // Down swipe → fuzzy (only after meaning is visible)
      if (dy > threshold && showMeaning) {
        finishCard('fuzzy', 'down');
        return;
      }

      // Snap back
      setOffsetX(0);
      setOffsetY(0);
      setRotate(0);
      setSwipeDir('');
    },
    [offsetX, offsetY, showMeaning, animating, finishCard]
  );

  const cardTransform = animating
    ? ''
    : `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${rotate}deg)`;

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* Card */}
      <div
        className={`relative w-full max-w-[320px] h-[380px] bg-surface rounded-3xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden touch-none
          ${!animating ? 'transition-transform duration-150 ease-out' : ''}
          ${animating && swipeDir === 'left' ? 'opacity-0 translate-x-[-120%] -rotate-[15deg] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]' : ''}
          ${animating && swipeDir === 'right' ? 'opacity-0 translate-x-[120%] rotate-[15deg] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]' : ''}
          ${animating && swipeDir === 'down' ? 'opacity-0 translate-y-[120%] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]' : ''}
        `}
        style={{
          transform: cardTransform,
          cursor: 'grab',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Left hint */}
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${
            swipeDir === 'left' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="text-base font-semibold text-danger">不认识</span>
        </div>

        {/* Right hint */}
        <div
          className={`absolute right-4 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${
            swipeDir === 'right' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="text-base font-semibold text-success">认识</span>
        </div>

        {/* Down hint */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-opacity duration-200 ${
            swipeDir === 'down' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="text-base font-semibold text-warning">模糊</span>
        </div>

        {/* Card content */}
        <div className="flex flex-col items-center justify-center h-full px-8 text-center">
          <span className="text-4xl font-bold text-text-primary mb-1 tracking-wide">{word}</span>
          {phonetic && (
            <span className="text-base text-text-secondary mb-4">{phonetic}</span>
          )}

          {showMeaning ? (
            <>
              <span className="text-lg font-medium text-text-primary">{meaning}</span>
              {example && (
                <div className="mt-4 px-4 py-3 bg-accent-soft rounded-lg max-w-full">
                  <p className="text-[13px] text-text-secondary italic leading-relaxed">
                    &ldquo;{example}&rdquo;
                  </p>
                  {exampleSource && (
                    <p className="text-[11px] text-text-tertiary mt-1">
                      — {exampleSource}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="mt-8">
              <span className="text-sm text-text-tertiary">↓ 下滑看释义</span>
            </div>
          )}
        </div>
      </div>

      {/* Gesture guide */}
      {!hasInteracted && (
        <div className="flex justify-around w-full max-w-[320px] mt-4 opacity-60">
          <span className="text-xs text-text-secondary">◀ 不认识</span>
          <span className="text-xs text-text-secondary">模糊 ▼</span>
          <span className="text-xs text-text-secondary">认识 ▶</span>
        </div>
      )}

      {/* Progress */}
      {total > 0 && (
        <div className="mt-2">
          <span className="text-xs text-text-tertiary">{current}/{total}</span>
        </div>
      )}
    </div>
  );
});

export default WordCard;
