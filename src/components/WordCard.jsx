import { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';

/**
 * WordCard — swipe card using pointer events + CSS transforms
 * Three directions: left=不认识, right=认识, down=模糊
 * Uses refs (not state) for drag tracking to avoid stale closures.
 */
const WordCard = forwardRef(function WordCard(
  { word = '', phonetic = '', meaning = '', example = '', exampleSource = '', current = 0, total = 0, onSwipe },
  ref
) {
  const [showMeaning, setShowMeaning] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [swipeDir, setSwipeDir] = useState('');

  // Use refs for real-time values during drag (avoids stale closures)
  const offsetRef = useRef({ x: 0, y: 0 });
  const startRef = useRef({ x: 0, y: 0 });
  const showMeaningRef = useRef(false);

  // Reset when word changes
  useEffect(() => {
    setShowMeaning(false);
    setAnimating(false);
    setSwipeDir('');
    setHasInteracted(false);
    offsetRef.current = { x: 0, y: 0 };
    startRef.current = { x: 0, y: 0 };
    showMeaningRef.current = false;
  }, [word]);

  useImperativeHandle(ref, () => ({
    show: () => setShowMeaning(true),
    reset: () => {
      setShowMeaning(false);
      setAnimating(false);
      setSwipeDir('');
      setHasInteracted(false);
      offsetRef.current = { x: 0, y: 0 };
      showMeaningRef.current = false;
    },
  }));

  const finishCard = useCallback((result, direction) => {
    setAnimating(true);
    setSwipeDir(direction);
    setHasInteracted(true);
    setTimeout(() => onSwipe?.(result), 300);
  }, [onSwipe]);

  const onPointerDown = useCallback((e) => {
    if (animating) return;
    // e.target may be a child — capture on the card element
    const card = e.currentTarget;
    card.setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
  }, [animating]);

  const onPointerMove = useCallback((e) => {
    if (animating) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    offsetRef.current = { x: dx, y: dy };

    // Update the card transform directly via DOM for smooth 60fps drag
    const card = e.currentTarget;
    const rotate = dx * 0.05;
    card.style.transform = `translateX(${dx}px) translateY(${dy}px) rotate(${rotate}deg)`;
    card.style.transition = 'none';

    // Update swipe direction hint (visual only, via state)
    let dir = '';
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) dir = dx > 0 ? 'right' : 'left';
    else if (Math.abs(dy) > Math.abs(dx) && dy > 40) dir = 'down';
    setSwipeDir(dir);
  }, [animating]);

  const onPointerUp = useCallback((e) => {
    if (animating) return;
    const card = e.currentTarget;
    const dx = offsetRef.current.x;
    const dy = offsetRef.current.y;
    const threshold = 80;
    const meaningShown = showMeaningRef.current || showMeaning;

    // Down swipe → show meaning first
    if (dy > 40 && Math.abs(dx) < 60 && !meaningShown) {
      setShowMeaning(true);
      showMeaningRef.current = true;
      card.style.transform = '';
      card.style.transition = 'transform 0.2s ease-out';
      offsetRef.current = { x: 0, y: 0 };
      return;
    }

    // Left → unknown
    if (dx < -threshold) { finishCard('unknown', 'left'); return; }
    // Right → known
    if (dx > threshold) { finishCard('known', 'right'); return; }
    // Down → fuzzy (after meaning shown)
    if (dy > threshold && meaningShown) { finishCard('fuzzy', 'down'); return; }

    // Snap back
    card.style.transform = '';
    card.style.transition = 'transform 0.2s ease-out';
    offsetRef.current = { x: 0, y: 0 };
    setSwipeDir('');
  }, [animating, showMeaning, finishCard]);

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      <div
        className={`relative w-full max-w-[320px] h-[380px] bg-surface rounded-3xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden
          ${animating && swipeDir === 'left' ? '!opacity-0 !translate-x-[-120%] !-rotate-[15deg]' : ''}
          ${animating && swipeDir === 'right' ? '!opacity-0 !translate-x-[120%] !rotate-[15deg]' : ''}
          ${animating && swipeDir === 'down' ? '!opacity-0 !translate-y-[120%]' : ''}
        `}
        style={animating ? { transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', transform: '', cursor: 'grab' } : { cursor: 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Left hint */}
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${swipeDir === 'left' && !animating ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-base font-semibold text-danger">不认识</span>
        </div>
        {/* Right hint */}
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${swipeDir === 'right' && !animating ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-base font-semibold text-success">认识</span>
        </div>
        {/* Down hint */}
        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-opacity duration-200 ${swipeDir === 'down' && !animating ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-base font-semibold text-warning">模糊</span>
        </div>

        {/* Card content */}
        <div className="flex flex-col items-center justify-center h-full px-8 text-center pointer-events-none">
          <span className="text-4xl font-bold text-text-primary mb-1 tracking-wide">{word}</span>
          {phonetic && <span className="text-base text-text-secondary mb-4">{phonetic}</span>}
          {showMeaning ? (
            <>
              <span className="text-lg font-medium text-text-primary">{meaning}</span>
              {example && (
                <div className="mt-4 px-4 py-3 bg-accent-soft rounded-lg max-w-full">
                  <p className="text-[13px] text-text-secondary italic leading-relaxed">&ldquo;{example}&rdquo;</p>
                  {exampleSource && <p className="text-[11px] text-text-tertiary mt-1">— {exampleSource}</p>}
                </div>
              )}
            </>
          ) : (
            <div className="mt-8"><span className="text-sm text-text-tertiary">↓ 下滑看释义</span></div>
          )}
        </div>
      </div>

      {!hasInteracted && (
        <div className="flex justify-around w-full max-w-[320px] mt-4 opacity-60">
          <span className="text-xs text-text-secondary">◀ 不认识</span>
          <span className="text-xs text-text-secondary">模糊 ▼</span>
          <span className="text-xs text-text-secondary">认识 ▶</span>
        </div>
      )}
      {total > 0 && <div className="mt-2"><span className="text-xs text-text-tertiary">{current}/{total}</span></div>}
    </div>
  );
});

export default WordCard;
