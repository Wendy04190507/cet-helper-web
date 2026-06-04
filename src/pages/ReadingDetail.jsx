import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEED_EXERCISES } from '../data/exercises';
import { storage, CACHE_KEYS } from '../utils/storage';

export default function ReadingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('preview');
  const [answers, setAnswers] = useState({});
  const [feynmanText, setFeynmanText] = useState('');
  const [result, setResult] = useState(null);

  const data = storage.get(CACHE_KEYS.EXERCISES) || SEED_EXERCISES;
  const reading = data.filter(e => e.module === 'reading');
  const item = reading[parseInt(id)];
  if (!item) return <div className="p-8 text-center text-text-secondary">未找到</div>;

  const content = item.content || {};
  const passage = content.passage || '';
  const questions = content.questions || [];

  const handleSubmit = () => {
    const results = questions.map((q, i) => ({
      correct: (answers[i] || '') === q.answer,
      userAnswer: answers[i] || '未作答',
      correctAnswer: q.answer,
    }));
    const correctCount = results.filter(r => r.correct).length;
    const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

    // Save wrong answers to error book
    const wrongOnes = results.filter(r => !r.correct);
    if (wrongOnes.length > 0) {
      let errors = storage.get(CACHE_KEYS.ERROR_BOOK) || [];
      wrongOnes.forEach(w => {
        errors.push({
          module: 'reading',
          questionTitle: item.title,
          userAnswer: w.userAnswer,
          correctAnswer: w.correctAnswer,
          nextReviewDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          reviewCount: 0,
          createdAt: new Date().toISOString(),
        });
      });
      storage.set(CACHE_KEYS.ERROR_BOOK, errors);
    }

    setResult({ score, correctCount, totalQuestions: questions.length, results });
    setPhase('result');
  };

  if (phase === 'preview') {
    return (
      <div className="px-4 pt-6 pb-20 space-y-6">
        <h2 className="text-2xl font-semibold mb-1">{item.title}</h2>
        <div className="card bg-white rounded-2xl p-5 border border-divider/50">
          <h3 className="text-sm font-semibold mb-3">📖 PQ4R阅读法</h3>
          <p className="text-xs text-text-secondary">Preview → Question → Read → Reflect → Recite → Review</p>
        </div>
        <div className="card bg-white rounded-2xl p-5 border border-divider/50">
          <h3 className="text-sm font-semibold mb-3">问题预览</h3>
          {questions.map((q, i) => (
            <div key={i} className="mb-3"><p className="text-sm font-medium">{i + 1}. {q.question}</p></div>
          ))}
        </div>
        <button onClick={() => setPhase('read')} className="w-full py-3 rounded-full text-sm font-semibold bg-text-primary text-white">开始阅读</button>
      </div>
    );
  }

  if (phase === 'read') {
    return (
      <div className="px-4 pt-6 pb-20 space-y-6">
        <div className="card bg-white rounded-2xl p-5 border border-divider/50">
          <h3 className="text-sm font-semibold mb-3">📄 阅读材料</h3>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{passage}</div>
        </div>
        <button onClick={() => setPhase('answer')} className="w-full py-3 rounded-full text-sm font-semibold bg-text-primary text-white">开始答题</button>
      </div>
    );
  }

  if (phase === 'answer') {
    return (
      <div className="px-4 pt-6 pb-20 space-y-6">
        <div className="card bg-white rounded-2xl p-5 border border-divider/50">
          <h3 className="text-sm font-semibold mb-4">答题</h3>
          {questions.map((q, i) => (
            <div key={i} className="mb-4 pb-4 border-b border-divider last:border-0">
              <p className="text-sm font-medium mb-2">{i + 1}. {q.question}</p>
              <div className="space-y-1">
                {q.options.map((opt, j) => (
                  <label key={j} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer py-1">
                    <input type="radio" name={`q-${i}`} value={opt} checked={answers[i] === opt} onChange={() => setAnswers(prev => ({ ...prev, [i]: opt }))} className="accent-[#5B8C5A]" />
                    {String.fromCharCode(65 + j)}. {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleSubmit} className="w-full py-3 rounded-full text-sm font-semibold bg-text-primary text-white">提交答案</button>
      </div>
    );
  }

  if (phase === 'result' && result) {
    return (
      <div className="px-4 pt-6 pb-20 space-y-6">
        <div className="card bg-white rounded-2xl p-5 border border-divider/50 text-center">
          <span className="text-5xl font-bold text-[#5B8C5A]">{result.score.toFixed(0)}%</span>
          <p className="text-xs text-text-secondary mt-2">正确 {result.correctCount}/{result.totalQuestions} 题</p>
        </div>
        {result.results.map((r, i) => (
          <div key={i} className={`card p-5 rounded-2xl border ${r.correct ? 'border-[#5B8C5A]/20' : 'border-[#ff3b30]/20'} bg-white`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={r.correct ? 'text-[#5B8C5A]' : 'text-[#ff3b30]'}>{r.correct ? '✓' : '✗'}</span>
              <span className="text-sm font-medium">{questions[i]?.question}</span>
            </div>
            {!r.correct && <p className="text-xs text-[#5B8C5A] mt-1">正确答案：{r.correctAnswer}</p>}
          </div>
        ))}
        <div className="card bg-white rounded-2xl p-5 border border-divider/50">
          <h3 className="text-sm font-semibold mb-3">🗣️ 费曼法：一句话总结</h3>
          <textarea value={feynmanText} onChange={e => setFeynmanText(e.target.value)} placeholder="用你自己的话总结这篇文章..." className="w-full h-24 p-4 rounded-xl border border-divider bg-[#f8f8f8] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B8C5A]/30" />
        </div>
        <button onClick={() => navigate('/reading')} className="w-full py-3 rounded-full text-sm font-semibold bg-[#5B8C5A] text-white">完成学习</button>
      </div>
    );
  }

  return null;
}
