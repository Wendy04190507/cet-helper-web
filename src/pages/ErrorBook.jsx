import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, CACHE_KEYS } from '../utils/storage';

export default function ErrorBook() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const data = storage.get(CACHE_KEYS.ERROR_BOOK) || [];
    // Sort: most recently added first
    data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    setErrors(data);
  }, []);

  const moduleLabel = { listening: '听力', reading: '阅读', writing: '写作', translation: '翻译' };
  const moduleIcon = { listening: '🎧', reading: '📖', writing: '✍️', translation: '🔄' };

  if (errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <span className="text-5xl mb-4">📚</span>
        <h3 className="text-lg font-semibold mb-2">错题本为空</h3>
        <p className="text-sm text-text-secondary mb-6">你还没有错题，继续保持！</p>
        <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-full text-sm font-medium bg-text-primary text-white">返回首页</button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <h2 className="text-2xl font-semibold mb-1">错题本</h2>
      <p className="text-sm text-text-secondary mb-6">共 {errors.length} 道错题</p>
      <div className="space-y-3">
        {errors.map((error, idx) => (
          <div key={idx} className="card card-hover bg-white rounded-2xl p-5 border border-divider/50">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary">
                {moduleIcon[error.module] || '📋'} {moduleLabel[error.module] || error.module}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8B86D]/10 text-[#E8B86D]">
                复习 {error.reviewCount || 0} 次
              </span>
            </div>
            <p className="text-sm font-medium mb-1">{error.questionTitle || '题目'}</p>
            {error.userAnswer && error.correctAnswer && (
              <div className="text-xs space-y-1 mt-2">
                <div><span className="text-[#ff3b30]">你的答案：{error.userAnswer}</span></div>
                <div><span className="text-[#5B8C5A]">正确答案：{error.correctAnswer}</span></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
