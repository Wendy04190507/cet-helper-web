import { useState, useCallback, useEffect } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [stats, setStats] = useState({ known: 0, fuzzy: 0, unknown: 0 });

  // Load words on mount
  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = () => {
    setLoading(true);
    // Ensure word bank exists
    let bank = wordBank;
    if (!bank || bank.length === 0) {
      bank = storage.get(CACHE_KEYS.WORD_BANK);
    }
    if (!bank || bank.length === 0) {
      bank = SEED_WORD_BANK;
      storage.set(CACHE_KEYS.WORD_BANK, bank);
      setWordBank(bank);
    }

    // Get user word records
    const uw = userWords || storage.get(CACHE_KEYS.USER_WORDS) || {};

    // Get due words
    const dueWordIds = getDueWords(
      Object.values(uw).map(w => ({ ...w, status: w.status || 'learning' }))
    ).map(w => w.wordId);

    let wordsToReview;
    if (dueWordIds.length > 0) {
      wordsToReview = bank.filter(w => dueWordIds.includes(w.word));
    } else {
      // Take unlearned words
      wordsToReview = bank.filter(w => !uw[w.word]);
      if (wordsToReview.length === 0) {
        wordsToReview = bank; // Cycle through all
      }
    }

    // Limit daily
    const selected = wordsToReview.slice(0, 50);

    if (selected.length === 0) {
      setWords([]);
      setLoading(false);
      return;
    }

    setWords(selected);
    setCurrentIndex(0);
    setStats({ known: 0, fuzzy: 0, unknown: 0 });
    setLoading(false);
  };

  const handleSwipe = useCallback(
    (result) => {
      const { currentIndex: idx, words: wordList } = { currentIndex, words };
      const currentWord = wordList[idx];

      if (!currentWord) return;

      // Update stats
      setStats(prev => ({ ...prev, [result]: prev[result] + 1 }));

      // Update user word record
      const uw = userWords || storage.get(CACHE_KEYS.USER_WORDS) || {};
      const existing = uw[currentWord.word] || {};
      const review = calculateNextReview(existing.interval || 0, result);

      const newRecord = {
        wordId: currentWord.word,
        interval: review.interval,
        nextReviewDate: review.nextDate,
        status: review.interval >= 5 ? 'mastered' : 'learning',
        history: [
          ...(existing.history || []),
          { date: today(), result },
        ],
      };

      updateWord(currentWord.word, newRecord);

      // Move to next
      const nextIdx = idx + 1;
      if (nextIdx < wordList.length) {
        setCurrentIndex(nextIdx);
      } else {
        setShowComplete(true);
        setWords([]);
      }
    },
    [currentIndex, words, userWords, updateWord]
  );

  const handleDismiss = () => {
    setShowComplete(false);
    navigate(-1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <span className="text-text-tertiary text-sm">加载单词中...</span>
      </div>
    );
  }

  // Empty state — no words to review
  if (words.length === 0 && !showComplete) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <span className="text-6xl mb-4">🎉</span>
        <h2 className="text-xl font-bold mb-1">今日单词已完成</h2>
        <p className="text-[15px] text-text-secondary mb-6">明天继续加油</p>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 rounded-full text-sm font-semibold bg-text-primary text-white"
        >
          返回
        </button>
      </div>
    );
  }

  const currentWord = words[currentIndex] || {};

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8">
      {words.length > 0 && (
        <WordCard
          word={currentWord.word || ''}
          phonetic={currentWord.phonetic || ''}
          meaning={currentWord.meaning || ''}
          example={currentWord.example || ''}
          exampleSource={currentWord.exampleSource || ''}
          current={currentIndex + 1}
          total={words.length}
          onSwipe={handleSwipe}
        />
      )}

      {/* Completion modal */}
      {showComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={handleDismiss} />
          <div className="relative w-[300px] bg-surface rounded-3xl p-8 text-center shadow-lg">
            <span className="text-5xl block mb-3">✨</span>
            <h3 className="text-xl font-bold mb-6">单词完成</h3>

            <div className="flex justify-around mb-6">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-success">{stats.known}</span>
                <span className="text-xs text-text-secondary">认识</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-warning">{stats.fuzzy}</span>
                <span className="text-xs text-text-secondary">模糊</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-danger">{stats.unknown}</span>
                <span className="text-xs text-text-secondary">不认识</span>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full py-3 rounded-full text-[15px] font-semibold bg-text-primary text-white"
            >
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
