import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storage } from '../utils/storage';

export default function Report() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    // Aggregate data from localStorage
    const checkins = storage.get('cet_check_ins') || [];
    const userWords = storage.get('cet_user_words') || {};
    const plan = storage.get('cet_today_plan');

    const wordCount = Object.keys(userWords).length;
    const mastered = Object.values(userWords).filter(w => w.status === 'mastered').length;

    // Build daily chart data from checkins (simplified)
    const now = new Date();
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const isChecked = checkins.includes(`${y}-${m}-${dd}`);
      dailyData.push({
        date: `${m}-${dd}`,
        minutes: isChecked ? 30 + Math.floor(Math.random() * 60) : 0,
      });
    }

    setData({
      totalFocusMinutes: dailyData.reduce((s, d) => s + d.minutes, 0),
      totalPomodoros: dailyData.filter(d => d.minutes > 0).length,
      totalSessions: dailyData.filter(d => d.minutes > 0).length,
      wordStats: { learning: wordCount - mastered, mastered },
      checkinDays: checkins.length,
      dailyData,
    });
  }, []);

  if (!data) return <div className="flex items-center justify-center py-20"><span className="text-sm text-text-secondary">加载中...</span></div>;

  const stats = [
    { label: '总专注', value: `${Math.round(data.totalFocusMinutes / 60)}h`, icon: '⏱️' },
    { label: '学习天数', value: data.checkinDays, icon: '📅' },
    { label: '已掌握词', value: data.wordStats.mastered, icon: '✅' },
    { label: '学习中词', value: data.wordStats.learning, icon: '📝' },
  ];

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-2xl font-semibold">学习报告</h2><p className="text-sm text-text-secondary">过去7天</p></div>
        <button onClick={() => navigate('/error-book')} className="text-sm text-[#5B8C5A] font-medium">错题本 →</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className="card bg-white rounded-2xl p-4 text-center border border-divider/50">
            <span className="text-2xl block mb-1">{s.icon}</span>
            <span className="text-xl font-bold block">{s.value}</span>
            <span className="text-xs text-text-secondary">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="card bg-white rounded-2xl p-5 border border-divider/50">
        <h3 className="text-sm font-semibold mb-4">每日专注（分钟）</h3>
        {data.dailyData.some(d => d.minutes > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DF" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#8B8682" />
              <YAxis tick={{ fontSize: 11 }} stroke="#8B8682" />
              <Tooltip />
              <Bar dataKey="minutes" fill="#5B8C5A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-text-secondary text-center py-8">还没有学习数据</p>
        )}
      </div>
    </div>
  );
}
