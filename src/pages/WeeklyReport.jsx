import { useState, useEffect, useMemo } from 'react';
import { storage, CACHE_KEYS } from '../utils/storage';
import { weekStart, today, formatDate } from '../utils/date';

const ENCOURAGEMENTS = [
  '你的听力在慢慢变好，再坚持一周就能看到明显变化。',
  '这一周你做得很好，保持这个节奏，考试稳了。',
  '每一个单词都是通向高分的台阶，你正在积累复利。',
  '进步不是线性的，但你正在往对的方向走。',
];

const SIMULATED_IMPROVEMENTS = [
  { module: '听力', before: 56, after: 62, up: true },
  { module: '阅读', before: 70, after: 74, up: true },
  { module: '单词', before: 120, after: 183, up: true },
];

export default function WeeklyReport() {
  const [weeklyStats, setWeeklyStats] = useState({
    studyDays: 0,
    totalMinutes: 0,
    newWords: 0,
    tasksDone: 0,
    improvements: [],
  });
  const [aiMessage, setAiMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = () => {
    const checkins = storage.get(CACHE_KEYS.CHECK_INS) || [];
    const ws = weekStart();
    const todayStr = today();

    // This week's checkins
    const weekCheckins = checkins.filter(d => d >= ws && d <= todayStr);
    const studyDays = weekCheckins.length;

    // Count tasks and minutes
    let tasksDone = 0;
    let totalMinutes = 0;
    weekCheckins.forEach(date => {
      const completedMap = storage.get(`completed_${date}`) || {};
      tasksDone += Object.keys(completedMap).length;

      const plan = storage.get(`${CACHE_KEYS.TODAY_PLAN}_${date}`);
      if (plan && plan.totalMinutes) {
        totalMinutes += plan.totalMinutes;
      }
    });

    // Count new words this week
    const userWords = storage.get(CACHE_KEYS.USER_WORDS) || {};
    const newWords = Object.values(userWords).filter(w => {
      return w.history && w.history.some(h => h.date >= ws && h.date <= todayStr);
    }).length;

    // Simulated improvements
    const improvements = SIMULATED_IMPROVEMENTS;

    setWeeklyStats({
      studyDays,
      totalMinutes,
      newWords,
      tasksDone,
      improvements,
    });

    // Random encouragement
    setAiMessage(
      ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
    );
  };

  const handleShare = async () => {
    const text = `我这周学习了 ${weeklyStats.studyDays} 天，掌握了 ${weeklyStats.newWords} 个单词，完成了 ${weeklyStats.tasksDone} 个任务！来自 CET Helper 四六级备考助手`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (weeklyStats.studyDays === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <span className="text-5xl mb-4">📊</span>
        <h2 className="text-xl font-bold mb-2">还没有本周数据</h2>
        <p className="text-[15px] text-text-secondary">完成一些学习任务后再来看看吧</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="bg-surface rounded-3xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <h2 className="text-xl font-bold mb-5">你这一周</h2>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center py-4 px-3 bg-accent-soft rounded-2xl">
            <span className="text-3xl font-bold block">{weeklyStats.studyDays}</span>
            <span className="text-[13px] text-text-secondary mt-0.5">学习天数</span>
          </div>
          <div className="text-center py-4 px-3 bg-accent-soft rounded-2xl">
            <span className="text-3xl font-bold block">{weeklyStats.totalMinutes}</span>
            <span className="text-[13px] text-text-secondary mt-0.5">总分钟</span>
          </div>
          <div className="text-center py-4 px-3 bg-accent-soft rounded-2xl">
            <span className="text-3xl font-bold block">{weeklyStats.newWords}</span>
            <span className="text-[13px] text-text-secondary mt-0.5">新单词</span>
          </div>
          <div className="text-center py-4 px-3 bg-accent-soft rounded-2xl">
            <span className="text-3xl font-bold block">{weeklyStats.tasksDone}</span>
            <span className="text-[13px] text-text-secondary mt-0.5">完成任务</span>
          </div>
        </div>

        {/* Improvements */}
        {weeklyStats.improvements.length > 0 && (
          <div>
            <span className="text-[13px] font-semibold text-text-secondary block mb-2">
              模块进步
            </span>
            <div className="space-y-0">
              {weeklyStats.improvements.map((imp, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-3 border-b border-divider last:border-b-0"
                >
                  <span className="text-[15px]">{imp.module}</span>
                  <span
                    className={`text-[15px] font-semibold ${
                      imp.up ? 'text-success' : 'text-text-secondary'
                    }`}
                  >
                    {imp.before}% → {imp.after}% {imp.up ? '↑' : '↓'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI encouragement */}
      {aiMessage && (
        <div className="mt-5 px-6 py-6 text-center">
          <p className="text-[17px] text-text-secondary italic leading-relaxed">
            &ldquo;{aiMessage}&rdquo;
          </p>
        </div>
      )}

      {/* Share button */}
      <button
        onClick={handleShare}
        className="w-full py-3.5 rounded-full text-[15px] font-semibold bg-text-primary text-white mt-4 transition-opacity hover:opacity-90"
      >
        {copied ? '已复制 ✓' : '分享到聊天'}
      </button>
    </div>
  );
}
