import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEED_EXERCISES } from '../data/exercises';
import { storage } from '../utils/storage';

export default function Translation() {
  const [exercises, setExercises] = useState([]);
  useEffect(() => {
    const exKey = 'cet_exercises';
    let data = storage.get(exKey);
    if (!data || data.length === 0) { data = SEED_EXERCISES; storage.set(exKey, data); }
    setExercises(data.filter(e => e.module === 'translation'));
  }, []);

  return (
    <div className="px-4 pt-6 pb-4">
      <h2 className="text-2xl font-semibold mb-1">翻译训练</h2>
      <p className="text-sm text-text-secondary mb-6">费曼拆解 + AI智能批改</p>
      <div className="space-y-3">
        {exercises.length === 0 ? (
          <div className="text-center py-16"><span className="text-5xl block mb-4">🔄</span><p className="text-text-secondary">暂无翻译练习</p></div>
        ) : exercises.map((item, idx) => (
          <Link key={idx} to={`/translation/${idx}`} className="card card-hover flex items-center gap-4 p-4 bg-white rounded-2xl border border-divider/50">
            <span className="text-2xl">🔄</span>
            <div className="flex-1 min-w-0"><span className="text-sm font-medium block truncate">{item.title}</span></div>
            <span className="text-xs text-text-secondary">{item.examType.toUpperCase()}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
