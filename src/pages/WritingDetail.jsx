import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEED_EXERCISES } from '../data/exercises';
import { storage } from '../utils/storage';
import { deepseekChatJSON } from '../lib/deepseek';
import { writingCorrectionPrompt, feynmanAssessmentPrompt } from '../lib/prompts';

export default function WritingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('feynman');
  const [feynmanText, setFeynmanText] = useState('');
  const [feynmanResult, setFeynmanResult] = useState(null);
  const [essay, setEssay] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const exKey = 'cet_exercises';
  const data = storage.get(exKey) || SEED_EXERCISES;
  const writing = data.filter(e => e.module === 'writing');
  const item = writing[parseInt(id)];
  if (!item) return <div className="p-8 text-center text-text-secondary">未找到</div>;
  const content = item.content || {};

  const handleFeynmanSubmit = async () => {
    setLoading(true); setError('');
    try {
      const result = await deepseekChatJSON(
        feynmanAssessmentPrompt('writing', (content.prompt || '') + '\n' + (content.requirements || ''), feynmanText),
        { temperature: 0.3 }
      );
      setFeynmanResult(result);
    } catch (e) { setError('AI评估失败，请重试: ' + e.message); }
    setLoading(false);
  };

  const handleEssaySubmit = async () => {
    if (essay.length < 10) return;
    setLoading(true); setError('');
    try {
      const result = await deepseekChatJSON(
        writingCorrectionPrompt(item.examType, item.title, content.requirements || content.prompt || '', essay),
        { temperature: 0.3, maxTokens: 4096 }
      );
      setFeedback(result);
      setPhase('feedback');
    } catch (e) { setError('AI批改失败: ' + e.message); }
    setLoading(false);
  };

  const dimLabels = { content: '内容', structure: '结构', grammar: '语法', vocabulary: '词汇' };

  if (phase === 'feynman') {
    return (
      <div className="px-4 pt-6 pb-20 space-y-6">
        <h2 className="text-2xl font-semibold mb-1">{item.title}</h2>
        <div className="card bg-white rounded-2xl p-5 border border-divider/50">
          <h3 className="text-sm font-semibold mb-3">📝 写作题目</h3>
          <p className="text-sm mb-2">{content.prompt}</p>
          <p className="text-xs text-text-secondary">{content.requirements}</p>
          {content.keyPoints && content.keyPoints.length > 0 && (
            <div className="mt-3"><span className="text-xs font-medium text-text-secondary">要点：</span>
              <ul className="list-disc list-inside text-xs text-text-secondary mt-1">{content.keyPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </div>
          )}
        </div>
        <div className="card bg-white rounded-2xl p-5 border border-divider/50">
          <h3 className="text-sm font-semibold mb-3">🗣️ 费曼法：先讲思路</h3>
          <p className="text-xs text-text-secondary mb-3">动笔前用简单的话讲一下你打算怎么写。</p>
          <textarea value={feynmanText} onChange={e => setFeynmanText(e.target.value)} placeholder="我打算这样写：开头先...然后...最后..." className="w-full h-28 p-4 rounded-xl border border-divider bg-[#f8f8f8] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B8C5A]/30" />
        </div>
        {feynmanResult && (
          <div className="card bg-[#5B8C5A]/5 border-[#5B8C5A]/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold text-[#5B8C5A]">AI 思路评估</span><span className="text-lg font-bold text-[#5B8C5A]">{feynmanResult.score}/10</span></div>
            <p className="text-xs text-text-secondary mb-2">{feynmanResult.encouragement}</p>
            {feynmanResult.blindSpots && feynmanResult.blindSpots.length > 0 && (
              <div><span className="text-xs font-medium text-[#E8B86D]">需要注意：</span><ul className="list-disc list-inside text-xs text-text-secondary">{feynmanResult.blindSpots.map((b, i) => <li key={i}>{b}</li>)}</ul></div>
            )}
          </div>
        )}
        {error && <p className="text-sm text-[#ff3b30] text-center">{error}</p>}
        {feynmanResult ? (
          <button onClick={() => setPhase('write')} className="w-full py-3 rounded-full text-sm font-semibold bg-text-primary text-white">开始写作文</button>
        ) : (
          <button onClick={handleFeynmanSubmit} disabled={loading || !feynmanText.trim()} className="w-full py-3 rounded-full text-sm font-semibold bg-text-primary text-white disabled:opacity-50">{loading ? 'AI评估中...' : 'AI 评估我的思路'}</button>
        )}
      </div>
    );
  }

  if (phase === 'write') {
    return (
      <div className="px-4 pt-6 pb-20 space-y-6">
        <div className="card bg-white rounded-2xl p-5 border border-divider/50">
          <h3 className="text-sm font-semibold mb-3">✍️ 写作文</h3>
          <textarea value={essay} onChange={e => setEssay(e.target.value)} placeholder="在这里写你的作文..." className="w-full h-80 p-4 rounded-xl border border-divider bg-[#f8f8f8] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B8C5A]/30" />
          <div className="flex justify-between mt-2"><span className="text-xs text-text-secondary">{essay.length} 字</span><span className="text-xs text-text-secondary">建议 ≥ 120 词</span></div>
        </div>
        {error && <p className="text-sm text-[#ff3b30] text-center">{error}</p>}
        <button onClick={handleEssaySubmit} disabled={loading || essay.length < 10} className="w-full py-3 rounded-full text-sm font-semibold bg-text-primary text-white disabled:opacity-50">{loading ? 'AI正在批改中...' : '提交AI批改'}</button>
        <button onClick={() => setPhase('feynman')} className="w-full py-3 rounded-full text-sm font-medium border border-divider text-text-secondary">返回修改思路</button>
      </div>
    );
  }

  if (phase === 'feedback' && feedback) {
    return (
      <div className="px-4 pt-6 pb-20 space-y-6">
        <div className="card bg-white rounded-2xl p-5 border border-divider/50 text-center">
          <span className="text-6xl font-bold text-[#5B8C5A]">{typeof feedback.totalScore === 'number' ? feedback.totalScore.toFixed(1) : feedback.totalScore}</span>
          <p className="text-xs text-text-secondary mt-1">满分 106.5</p>
        </div>
        {feedback.dimensions && (
          <div className="card bg-white rounded-2xl p-5 border border-divider/50">
            <h3 className="text-sm font-semibold mb-3">📊 四维评分</h3>
            {Object.entries(feedback.dimensions).map(([key, dim]) => (
              <div key={key} className="mb-3 pb-3 border-b border-divider last:border-0">
                <div className="flex justify-between mb-1"><span className="text-xs font-medium">{dimLabels[key] || key}</span><span className="text-xs text-[#5B8C5A]">{dim.score}分</span></div>
                <p className="text-xs text-text-secondary">{dim.comment}</p>
                {dim.errors && dim.errors.length > 0 && (
                  <div className="mt-2 space-y-1">{dim.errors.map((e, i) => (
                    <div key={i} className="text-xs"><span className="text-[#ff3b30] line-through">{e.original}</span><span className="mx-1">→</span><span className="text-[#5B8C5A]">{e.correction}</span><span className="text-text-secondary ml-1">({e.reason})</span></div>
                  ))}</div>
                )}
                {dim.suggestions && dim.suggestions.length > 0 && (
                  <div className="mt-2 space-y-1">{dim.suggestions.map((s, i) => (
                    <div key={i} className="text-xs"><span className="text-[#E8B86D]">{s.original}</span><span className="mx-1">→</span><span className="text-[#5B8C5A]">{s.upgrade || s.better}</span></div>
                  ))}</div>
                )}
              </div>
            ))}
          </div>
        )}
        {feedback.overallComment && (
          <div className="card bg-white rounded-2xl p-5 border border-divider/50"><h3 className="text-sm font-semibold mb-3">💬 总体评语</h3><p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{feedback.overallComment}</p></div>
        )}
        {feedback.optimizedVersion && (
          <div className="card bg-white rounded-2xl p-5 border border-divider/50"><h3 className="text-sm font-semibold mb-3">✨ 优化版范文</h3><div className="p-4 bg-[#f8f8f8] rounded-xl text-sm leading-relaxed whitespace-pre-wrap">{feedback.optimizedVersion}</div></div>
        )}
        <div className="flex gap-3">
          <button onClick={() => { setPhase('write'); setEssay(''); setFeedback(null); }} className="flex-1 py-3 rounded-full text-sm font-medium border border-divider text-text-secondary">重写一篇</button>
          <button onClick={() => navigate('/writing')} className="flex-1 py-3 rounded-full text-sm font-semibold bg-[#5B8C5A] text-white">完成</button>
        </div>
      </div>
    );
  }

  return null;
}
