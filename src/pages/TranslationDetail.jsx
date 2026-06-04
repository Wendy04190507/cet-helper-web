import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEED_EXERCISES } from '../data/exercises';
import { storage, CACHE_KEYS } from '../utils/storage';
import { deepseekChatJSON } from '../lib/deepseek';
import { translationCorrectionPrompt, feynmanAssessmentPrompt } from '../lib/prompts';

export default function TranslationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('feynman');
  const [feynmanText, setFeynmanText] = useState('');
  const [feynmanResult, setFeynmanResult] = useState(null);
  const [translation, setTranslation] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const exKey = 'cet_exercises';
  const data = storage.get(exKey) || SEED_EXERCISES;
  const trans = data.filter(e => e.module === 'translation');
  const item = trans[parseInt(id)];
  if (!item) return <div className="p-8 text-center text-text-secondary">未找到</div>;
  const content = item.content || {};

  const handleFeynmanSubmit = async () => {
    setLoading(true); setError('');
    try {
      const result = await deepseekChatJSON(feynmanAssessmentPrompt('translation', content.chineseText || '', feynmanText), { temperature: 0.3 });
      setFeynmanResult(result);
    } catch (e) { setError('AI评估失败: ' + e.message); }
    setLoading(false);
  };

  const handleTranslateSubmit = async () => {
    setLoading(true); setError('');
    try {
      const result = await deepseekChatJSON(
        translationCorrectionPrompt(content.chineseText || '', translation, content.referenceTranslation || ''),
        { temperature: 0.3, maxTokens: 4096 }
      );
      setFeedback(result);
      // Save errors to error book
      const grammarErrs = (result.grammar && result.grammar.errors) || [];
      const vocabErrs = (result.vocabulary && result.vocabulary.suggestions) || [];
      if (grammarErrs.length > 0 || vocabErrs.length > 0) {
        let errors = storage.get(CACHE_KEYS.ERROR_BOOK) || [];
        grammarErrs.forEach(e => { errors.push({ module: 'translation', questionTitle: item.title, userAnswer: e.original, correctAnswer: e.correction, reason: e.rule || '', reviewCount: 0, createdAt: new Date().toISOString() }); });
        vocabErrs.forEach(e => { errors.push({ module: 'translation', questionTitle: item.title + ' (词汇)', userAnswer: e.original, correctAnswer: e.better || '', reason: '', reviewCount: 0, createdAt: new Date().toISOString() }); });
        storage.set(CACHE_KEYS.ERROR_BOOK, errors);
      }
      setPhase('feedback');
    } catch (e) { setError('AI批改失败: ' + e.message); }
    setLoading(false);
  };

  if (phase === 'feynman') {
    return (
      <div className="px-4 pt-6 pb-20 space-y-6">
        <h2 className="text-2xl font-semibold mb-1">{item.title}</h2>
        <div className="card bg-white rounded-2xl p-5 border border-divider/50"><h3 className="text-sm font-semibold mb-3">📝 翻译原文</h3><p className="text-sm leading-relaxed">{content.chineseText}</p></div>
        {content.keyExpressions && content.keyExpressions.length > 0 && (
          <div className="card bg-white rounded-2xl p-5 border border-divider/50"><h3 className="text-sm font-semibold mb-3">🔑 关键表达</h3>
            <div className="space-y-1">{content.keyExpressions.map((ke, i) => (<div key={i} className="flex justify-between text-xs"><span>{ke.cn}</span><span className="text-text-secondary">{ke.en}</span></div>))}</div>
          </div>
        )}
        <div className="card bg-white rounded-2xl p-5 border border-divider/50">
          <h3 className="text-sm font-semibold mb-3">🗣️ 费曼法：拆解翻译思路</h3>
          <p className="text-xs text-text-secondary mb-3">解释你的翻译策略：核心意思是什么？用什么英文结构？</p>
          <textarea value={feynmanText} onChange={e => setFeynmanText(e.target.value)} placeholder="这句话的核心意思是..." className="w-full h-28 p-4 rounded-xl border border-divider bg-[#f8f8f8] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B8C5A]/30" />
        </div>
        {feynmanResult && (
          <div className="card bg-[#5B8C5A]/5 border-[#5B8C5A]/20 rounded-2xl p-5">
            <span className="text-xs text-text-secondary">{feynmanResult.encouragement}</span>
            {feynmanResult.blindSpots && feynmanResult.blindSpots.length > 0 && <ul className="list-disc list-inside text-xs text-[#E8B86D] mt-1">{feynmanResult.blindSpots.map((b, i) => <li key={i}>{b}</li>)}</ul>}
          </div>
        )}
        {error && <p className="text-sm text-[#ff3b30] text-center">{error}</p>}
        {feynmanResult ? (
          <button onClick={() => setPhase('translate')} className="w-full py-3 rounded-full text-sm font-semibold bg-text-primary text-white">开始翻译</button>
        ) : (
          <button onClick={handleFeynmanSubmit} disabled={loading || !feynmanText.trim()} className="w-full py-3 rounded-full text-sm font-semibold bg-text-primary text-white disabled:opacity-50">{loading ? '评估中...' : 'AI 评估思路'}</button>
        )}
      </div>
    );
  }

  if (phase === 'translate') {
    return (
      <div className="px-4 pt-6 pb-20 space-y-6">
        <div className="card bg-white rounded-2xl p-5 border border-divider/50"><h3 className="text-sm font-semibold mb-3">原文</h3><p className="text-sm">{content.chineseText}</p></div>
        <div className="card bg-white rounded-2xl p-5 border border-divider/50">
          <h3 className="text-sm font-semibold mb-3">✍️ 你的翻译</h3>
          <textarea value={translation} onChange={e => setTranslation(e.target.value)} placeholder="在这里输入你的英文翻译..." className="w-full h-48 p-4 rounded-xl border border-divider bg-[#f8f8f8] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B8C5A]/30" />
        </div>
        {error && <p className="text-sm text-[#ff3b30] text-center">{error}</p>}
        <button onClick={handleTranslateSubmit} disabled={loading || translation.length < 5} className="w-full py-3 rounded-full text-sm font-semibold bg-text-primary text-white disabled:opacity-50">{loading ? 'AI批改中...' : '提交AI批改'}</button>
      </div>
    );
  }

  if (phase === 'feedback' && feedback) {
    return (
      <div className="px-4 pt-6 pb-20 space-y-6">
        <div className="card bg-white rounded-2xl p-5 border border-divider/50 text-center"><span className="text-6xl font-bold text-[#5B8C5A]">{typeof feedback.totalScore === 'number' ? feedback.totalScore.toFixed(1) : feedback.totalScore}</span><p className="text-xs text-text-secondary mt-1">满分 106.5</p></div>
        {feedback.optimizedVersion && (
          <div className="card bg-white rounded-2xl p-5 border border-divider/50"><h3 className="text-sm font-semibold mb-3">✨ 优化译文</h3><div className="p-4 bg-[#f8f8f8] rounded-xl text-sm leading-relaxed whitespace-pre-wrap">{feedback.optimizedVersion}</div></div>
        )}
        {feedback.grammar && feedback.grammar.errors && feedback.grammar.errors.length > 0 && (
          <div className="card bg-white rounded-2xl p-5 border border-divider/50"><h3 className="text-sm font-semibold mb-3">📝 语法错误</h3>
            {feedback.grammar.errors.map((e, i) => (<div key={i} className="text-xs mb-2"><span className="text-[#ff3b30] line-through">{e.original}</span><span className="mx-1">→</span><span className="text-[#5B8C5A]">{e.correction}</span><span className="text-text-secondary ml-1">({e.rule})</span></div>))}
          </div>
        )}
        {feedback.keyStructures && feedback.keyStructures.length > 0 && (
          <div className="card bg-white rounded-2xl p-5 border border-divider/50"><h3 className="text-sm font-semibold mb-3">🔑 核心句型</h3>{feedback.keyStructures.map((s, i) => <p key={i} className="text-xs text-text-secondary mb-1">{s}</p>)}</div>
        )}
        <button onClick={() => navigate('/translation')} className="w-full py-3 rounded-full text-sm font-semibold bg-[#5B8C5A] text-white">完成学习</button>
      </div>
    );
  }

  return null;
}
