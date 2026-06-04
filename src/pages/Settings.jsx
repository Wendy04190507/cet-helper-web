import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { storage, CACHE_KEYS } from '../utils/storage';
import { formatDate } from '../utils/date';

export default function Settings() {
  const { userProfile, isOnboarded, updateSettings, settings } = useApp();
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [fontSizeIndex, setFontSizeIndex] = useState(settings?.fontSizeIndex || 1);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = () => {
    const checkins = storage.get(CACHE_KEYS.CHECK_INS) || [];
    const todayStr = formatDate(new Date());
    let s = 0;
    let check = new Date(todayStr);

    if (!checkins.includes(todayStr)) {
      check.setDate(check.getDate() - 1);
    }

    while (true) {
      const ds = formatDate(check);
      if (checkins.includes(ds)) {
        s++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }

    setStreak(s);
  };

  const handleFontChange = (index) => {
    setFontSizeIndex(index);
    updateSettings({ fontSizeIndex: index });
    const html = document.documentElement;
    const sizes = ['14px', '16px', '18px'];
    html.style.fontSize = sizes[index];
  };

  const handleReset = () => {
    if (window.confirm('确定要清除所有学习数据吗？此操作不可恢复。')) {
      storage.clearAll();
      window.location.reload();
    }
  };

  if (!isOnboarded || !userProfile) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 pb-24">
        <span className="text-5xl mb-4">👤</span>
        <p className="text-[15px] text-text-secondary mb-6">还没有设置学习档案</p>
        <button
          onClick={() => navigate('/onboarding')}
          className="px-8 py-3 rounded-full text-sm font-semibold bg-text-primary text-white"
        >
          开始评估
        </button>
      </div>
    );
  }

  const examLabel = userProfile.examType === 'cet4' ? 'CET-4 四级' : 'CET-6 六级';
  const timeLabel =
    userProfile.dailyTime === '60min' ? '1 小时'
    : userProfile.dailyTime === '30min' ? '30 分钟'
    : userProfile.dailyTime === '15min' ? '15 分钟'
    : `${userProfile.customMinutes || 30} 分钟`;

  // Total stats
  const totalStudyDays = (storage.get(CACHE_KEYS.CHECK_INS) || []).length;
  const userWords = storage.get(CACHE_KEYS.USER_WORDS) || {};
  const totalWords = Object.keys(userWords).length;

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Profile card */}
      <div className="flex items-center p-5 bg-surface rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] mb-6">
        <span className="text-4xl mr-4">📚</span>
        <div className="flex-1">
          <span className="text-lg font-bold block">{examLabel}</span>
          <span className="text-[13px] text-text-secondary">
            考试日期：{userProfile.examDate}
          </span>
          <span className="text-[13px] text-text-secondary block">
            每日 {timeLabel}
          </span>
        </div>
        <button
          onClick={() => navigate('/onboarding')}
          className="text-[13px] text-text-secondary px-3 py-1"
        >
          调整
        </button>
      </div>

      {/* Stats section */}
      <div className="mb-6">
        <span className="text-[13px] font-semibold text-text-tertiary uppercase block mb-2">
          学习数据
        </span>
        <div
          className="flex justify-between items-center p-4 bg-surface rounded-xl cursor-pointer hover:bg-accent-soft transition-colors"
          onClick={() => navigate('/weekly-report')}
        >
          <span className="text-[15px]">周度报告</span>
          <span className="text-text-tertiary">→</span>
        </div>
        <div className="flex justify-between items-center p-4 bg-surface rounded-xl mt-0.5">
          <span className="text-[15px]">连续打卡</span>
          <span className="text-[13px] text-text-secondary">{streak} 天</span>
        </div>
        <div className="flex justify-between items-center p-4 bg-surface rounded-xl mt-0.5">
          <span className="text-[15px]">总计打卡</span>
          <span className="text-[13px] text-text-secondary">{totalStudyDays} 天</span>
        </div>
        <div className="flex justify-between items-center p-4 bg-surface rounded-xl mt-0.5">
          <span className="text-[15px]">学习单词</span>
          <span className="text-[13px] text-text-secondary">{totalWords} 词</span>
        </div>
      </div>

      {/* Settings section */}
      <div className="mb-6">
        <span className="text-[13px] font-semibold text-text-tertiary uppercase block mb-2">
          设置
        </span>
        <div
          className="flex justify-between items-center p-4 bg-surface rounded-xl cursor-pointer hover:bg-accent-soft transition-colors"
          onClick={() => navigate('/onboarding')}
        >
          <span className="text-[15px]">重新评估</span>
          <span className="text-text-tertiary">→</span>
        </div>
        <div
          className="flex justify-between items-center p-4 bg-surface rounded-xl mt-0.5 cursor-pointer hover:bg-accent-soft transition-colors"
          onClick={() => navigate('/report')}
        >
          <span className="text-[15px]">学习报告</span>
          <span className="text-text-tertiary">→</span>
        </div>
        <div
          className="flex justify-between items-center p-4 bg-surface rounded-xl mt-0.5 cursor-pointer hover:bg-accent-soft transition-colors"
          onClick={() => navigate('/error-book')}
        >
          <span className="text-[15px]">错题本</span>
          <span className="text-text-tertiary">→</span>
        </div>
        <div className="flex justify-between items-center p-4 bg-surface rounded-xl mt-0.5">
          <span className="text-[15px]">字体大小</span>
          <select
            value={fontSizeIndex}
            onChange={(e) => handleFontChange(parseInt(e.target.value))}
            className="text-[13px] text-text-secondary bg-transparent border-none outline-none cursor-pointer"
          >
            <option value={0}>小</option>
            <option value={1}>标准</option>
            <option value={2}>大</option>
          </select>
        </div>
      </div>

      {/* About */}
      <div className="mb-6">
        <span className="text-[13px] font-semibold text-text-tertiary uppercase block mb-2">
          关于
        </span>
        <div className="flex justify-between items-center p-4 bg-surface rounded-xl">
          <span className="text-[15px]">版本</span>
          <span className="text-[13px] text-text-secondary">v1.0.0</span>
        </div>
      </div>

      {/* Reset */}
      <div className="text-center">
        <button
          onClick={handleReset}
          className="text-[13px] text-danger py-2 px-4 rounded-full border border-danger/20 hover:bg-red-50 transition-colors"
        >
          清除所有数据
        </button>
      </div>
    </div>
  );
}
