import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEED_EXERCISES } from '../data/exercises';
import { storage, CACHE_KEYS } from '../utils/storage';

export default function Translation() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let data = storage.get(CACHE_KEYS.EXERCISES);
    if (!data || data.length === 0) {
      data = SEED_EXERCISES;
      storage.set(CACHE_KEYS.EXERCISES, data);
    }
    setExercises(data.filter(e => e.module === 'translation'));
    setLoading(false);
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><span className="text-sm text-text-secondary">加载中...</span></div>;

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <span className="text-5xl mb-4">🔄</span>
        <h3 className="text-lg font-semibold mb-2">暂无翻译练习</h3>
        <Link to="/" className="px-6 py-2.5 rounded-full text-sm font-medium bg-text-primary text-white">返回首页</Link>
      </div>
    );
  }

  const diffLabel = { easy: '基础', medium: '进阶', hard: '冲刺' };

  return (
    <div className="px-4 pt-6 pb-4">
      <h2 className="text-2xl font-semibold mb-1">翻译训练</h2>
      <p className="text-sm text-text-secondary mb-6">费曼拆解 + AI智能批改</p>
      <div className="space-y-3">
        {exercises.map((item, idx) => (
          <Link key={idx} to={`/translation/${idx}`} className="card card-hover flex items-center gap-4 p-4 bg-white rounded-2xl border border-divider/50">
            <span className="text-2xl shrink-0">🔄</span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium block truncate">{item.title}</span>
              <span className="text-xs text-text-secondary">{diffLabel[item.difficulty] || item.difficulty}</span>
            </div>
            <span className="text-xs text-text-secondary shrink-0">{item.examType.toUpperCase()}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
