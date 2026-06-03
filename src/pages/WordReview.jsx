import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getDueWords, calculateNextReview } from '../utils/spaced-repetition';
import { storage, CACHE_KEYS } from '../utils/storage';
import { today } from '../utils/date';
import { SEED_WORD_BANK } from '../constants';
import WordCard from '../components/WordCard';

export default function WordReview() {
  const { userWords, wordBank, updateWord, setWordBank } = useApp();
  const navigate = useNavigate();

  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [stats, setStats] = useState({ known: 0, fuzzy: 0, unknown: 0 });
  const [currentIdx, setCurrentIdx] = useState(0);

  // Refs to avoid stale closure in callbacks
  const wordsRef = useRef([]);
  const statsRef = useRef({ known: 0, fuzzy: 0, unknown: 0 });
  const currentIdxRef = useRef(0);
  const userWordsRef = useRef({});

  useEffect(() => { wordsRef.current = words; }, [words]);
  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  useEffect(() => { userWordsRef.current = userWords || {}; }, [userWords]);

  // Load words on mount
  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = () => {
    setLoading(true);
    let bank = wordBank;
    if (!bank || bank.length === 0) {
      bank = storage.get(CACHE_KEYS.WORD_BANK);
    }
    if (!bank || bank.length === 0) {
      bank = SEED_WORD_BANK;
      storage.set(CACHE_KEYS.WORD_BANK, bank);
      setWordBank(bank);
    }

    const uw = userWords || storage.get(CACHE_KEYS.USER_WORDS) || {};
    userWordsRef.current = uw;

    const dueWordIds = getDueWords(
      Object.values(uw).map(w => ({ ...w, status: w.status || 'learning' }))
    ).map(w => w.wordId);

    let wordsToReview;
    if (dueWordIds.length > 0) {
      wordsToReview = bank.filter(w => dueWordIds.includes(w.word));
    } else {
      wordsToReview = bank.filter(w => !uw[w.word]);
      if (wordsToReview.length === 0) wordsToReview = bank;
    }

    const selected = wordsToReview.slice(0, 50);
    if (selected.length === 0) {
      setWords([]);
      setLoading(false);
      return;
    }

    setWords(selected);
    wordsRef.current = selected;
    setCurrentIdx(0);
    setStats({ known: 0, fuzzy: 0, unknown: 0 });
    setLoading(false);
  };

  const handleSwipe = useCallback((result) => {
    const idx = currentIdxRef.current;
    const wordList = wordsRef.current;
    const currentWord = wordList[idx];
    if (!currentWord) return;

    // Update stats
    const newStats = { ...statsRef.current, [result]: statsRef.current[result] + 1 };
    setStats(newStats);
    statsRef.current = newStats;

    // Update user word record
    const uw = { ...userWordsRef.current };
    const existing = uw[currentWord.word] || {};
    const review = calculateNextReview(existing.interval || 0, result);

    uw[currentWord.word] = {
      wordId: currentWord.word,
      interval: review.interval,
      nextReviewDate: review.nextDate,
      status: review.interval >= 5 ? 'mastered' : 'learning',
      history: [...(existing.history || []), { date: today(), result }],
    };

    // Persist immediately
    storage.set(CACHE_KEYS.USER_WORDS, uw);
    userWordsRef.current = uw;
    updateWord(currentWord.word, uw[currentWord.word]);

    // Move to next
    const nextIdx = idx + 1;
    if (nextIdx < wordList.length) {
      setCurrentIdx(nextIdx);
      currentIdxRef.current = nextIdx;
    } else {
      setShowComplete(true);
      setWords([]);
    }
  }, [updateWord]);

  const handleDismiss = () => {
    setShowComplete(false);
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <span className="text-text-tertiary text-sm">加载单词中...</span>
      </div>
    );
  }

  if (words.length === 0 && !showComplete) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <span className="text-6xl mb-4">🎉</span>
        <h2 className="text-xl font-bold mb-1">今日单词已完成</h2>
        <p className="text-[15px] text-text-secondary mb-6">明天继续加油</p>
        <button onClick={() => navigate(-1)} className="px-8 py-3 rounded-full text-sm font-semibold bg-text-primary text-white">返回</button>
      </div>
    );
  }

  const currentWord = words[currentIdx] || {};

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8">
      {words.length > 0 && (
        <WordCard
          word={currentWord.word || ''}
          phonetic={currentWord.phonetic || ''}
          meaning={currentWord.meaning || ''}
          example={currentWord.example || ''}
          exampleSource={currentWord.exampleSource || ''}
          current={currentIdx + 1}
          total={words.length}
          onSwipe={handleSwipe}
        />
      )}
      {showComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={handleDismiss} />
          <div className="relative w-[300px] bg-surface rounded-3xl p-8 text-center shadow-lg">
            <span className="text-5xl block mb-3">✨</span>
            <h3 className="text-xl font-bold mb-6">单词完成</h3>
            <div className="flex justify-around mb-6">
              <div className="flex flex-col"><span className="text-2xl font-bold text-success">{stats.known}</span><span className="text-xs text-text-secondary">认识</span></div>
              <div className="flex flex-col"><span className="text-2xl font-bold text-warning">{stats.fuzzy}</span><span className="text-xs text-text-secondary">模糊</span></div>
              <div className="flex flex-col"><span className="text-2xl font-bold text-danger">{stats.unknown}</span><span className="text-xs text-text-secondary">不认识</span></div>
            </div>
            <button onClick={handleDismiss} className="w-full py-3 rounded-full text-[15px] font-semibold bg-text-primary text-white">完成</button>
          </div>
        </div>
      )}
    </div>
  );
}
