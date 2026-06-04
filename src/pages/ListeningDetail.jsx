import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEED_EXERCISES } from '../data/exercises';
import { storage, CACHE_KEYS } from '../utils/storage';

export default function ListeningDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('pre');
  const [dictationText, setDictationText] = useState('');
  const [answers, setAnswers] = useState({});
  const [showTranscript, setShowTranscript] = useState(false);

  const data = storage.get(CACHE_KEYS.EXERCISES) || SEED_EXERCISES;
  const listening = data.filter(e => e.module === 'listening');
  const item = listening[parseInt(id)];
  if (!item) return <div className="p-8 text-center text-text-secondary">未找到</div>;

  const content = item.content || {};
  const questions = content.questions || [];

  // Phase 1: Pre-listen prediction
  if (phase === 'pre') {
    return (
      <div className="px-4 pt-6 pb-20 space-y-6">
        <h2 className="text-2xl font-semibold mb-1">{item.title}</h2>
        <div className="card bg-white rounded-2xl p-5 border border-divider/50">
          <h3 className="text-sm font-semibold mb-3">🎯 听前预测（主动回忆）</h3>
          <p className="text-xs text-text-secondary mb-4">先看问题，预测答案，激活先验知识。</p>
          {questions.map((q, i) => (
            <div key={i} className="mb-4 pb-3 border-b border-divider last:border-0">
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
        <button onClick={() => setPhase('listening')} className="w-full py-3 rounded-full text-sm font-semibold bg-text-primary text-white">开始听力</button>
      </div>
    );
  }

  // Phase 2: Listen
  if (phase === 'listening') {
    return (
      <div className="px-4 pt-6 pb-20 space-y-6">
        <div className="card bg-white rounded-2xl p-5 border border-divider/50 text-center py-8">
          <span className="text-6xl block mb-4">🔊</span>
          <p className="text-sm text-text-secondary mb-6">请播放音频，仔细聆听。</p>
          {content.transcript && (
            <div className="text-left mt-4">
              <button onClick={() => setShowTranscript(!showTranscript)} className="text-sm text-[#5B8C5A] font-medium">{showTranscript ? '隐藏原文' : '显示原文'}</button>
              {showTranscript && <div className="mt-3 p-4 bg-[#f8f8f8] rounded-xl text-sm leading-relaxed text-left whitespace-pre-wrap">{content.transcript}</div>}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setPhase('dictation')} className="flex-1 py-3 rounded-full text-sm font-semibold bg-text-primary text-white">进入听写</button>
          <button onClick={() => setPhase('pre')} className="flex-1 py-3 rounded-full text-sm font-medium border border-divider text-text-secondary">返回</button>
        </div>
      </div>
    );
  }

  // Phase 3: Dictation
  if (phase === 'dictation') {
    return (
      <div className="px-4 pt-6 pb-20 space-y-6">
        <div className="card bg-white rounded-2xl p-5 border border-divider/50">
          <h3 className="text-sm font-semibold mb-3">✍️ 听写训练</h3>
          <p className="text-xs text-text-secondary mb-4">根据记忆输入听到的内容——主动回忆的核心练习。</p>
          <textarea value={dictationText} onChange={e => setDictationText(e.target.value)} placeholder="在这里输入你听到的内容..." className="w-full h-48 p-4 rounded-xl border border-divider bg-[#f8f8f8] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B8C5A]/30" />
        </div>
        <div className="flex gap-3">
          <button onClick={() => setPhase('review')} className="flex-1 py-3 rounded-full text-sm font-semibold bg-text-primary text-white">查看原文对比</button>
          <button onClick={() => setPhase('listening')} className="flex-1 py-3 rounded-full text-sm font-medium border border-divider text-text-secondary">再听一次</button>
        </div>
      </div>
    );
  }

  // Phase 4: Review + Feynman
  if (phase === 'review') {
    return (
      <div className="px-4 pt-6 pb-20 space-y-6">
        <div className="card bg-white rounded-2xl p-5 border border-divider/50">
          <h3 className="text-sm font-semibold mb-3">📋 原文对比</h3>
          {content.transcript && <div className="p-4 bg-[#f8f8f8] rounded-xl text-sm leading-relaxed whitespace-pre-wrap">{content.transcript}</div>}
          {dictationText && (
            <div className="mt-4">
              <h4 className="text-xs font-medium text-text-secondary mb-2">你的听写：</h4>
              <div className="p-4 bg-[#E8B86D]/10 rounded-xl text-sm leading-relaxed">{dictationText}</div>
            </div>
          )}
        </div>
        <div className="card bg-white rounded-2xl p-5 border border-divider/50">
          <h3 className="text-sm font-semibold mb-3">🗣️ 费曼法：用自己的话讲出来</h3>
          <textarea placeholder="这段材料主要讲了..." className="w-full h-24 p-4 rounded-xl border border-divider bg-[#f8f8f8] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B8C5A]/30" />
        </div>
        <button onClick={() => navigate('/listening')} className="w-full py-3 rounded-full text-sm font-semibold bg-[#5B8C5A] text-white">完成学习</button>
      </div>
    );
  }

  return null;
}
