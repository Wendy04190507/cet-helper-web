import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { today, daysBetween, getDefaultExamDate } from '../utils/date';
import { generateDailyPlan, generateMinimalPlan } from '../utils/plan-engine';
import { MODULES, SEED_WORD_BANK } from '../constants';
import { storage, CACHE_KEYS } from '../utils/storage';
import ProgressBar from '../components/ProgressBar';
import TaskCard from '../components/TaskCard';
import CheckinCalendar from '../components/CheckinCalendar';

export default function Home() {
  const { userProfile, todayPlan, checkins, addCheckin, setPlan, setProfile, setWordBank, isOnboarded } = useApp();
  const navigate = useNavigate();
  const [isMinimal, setIsMinimal] = useState(false);

  // If not onboarded, show welcome
  if (!isOnboarded) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6">
        <span className="text-7xl mb-5">📚</span>
        <h1 className="text-2xl font-bold mb-2">还没有学习计划</h1>
        <p className="text-[15px] text-text-secondary mb-8 text-center">
          先做一个快速评估，为你生成专属计划
        </p>
        <button
          onClick={() => navigate('/onboarding')}
          className="w-60 py-3.5 rounded-full text-base font-semibold bg-text-primary text-white transition-opacity hover:opacity-90"
        >
          开始评估
        </button>
        <button
          onClick={() => quickStart(setProfile, setWordBank, navigate)}
          className="w-60 mt-3 py-3.5 rounded-full text-base font-semibold bg-transparent text-text-secondary border border-divider transition-opacity hover:opacity-80"
        >
          直接开始
        </button>
      </div>
    );
  }

  // Load plan if not yet loaded
  if (!todayPlan || todayPlan.date !== today()) {
    loadTodayPlan(userProfile, setPlan, isMinimal);
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <span className="text-text-tertiary text-sm">加载中...</span>
      </div>
    );
  }

  const tasks = todayPlan.tasks || [];
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length;
  const remainingDays = daysBetween(today(), userProfile.examDate);

  const handleToggle = useCallback(
    (taskId, completed) => {
      setPlan({
        ...todayPlan,
        tasks: todayPlan.tasks.map(t =>
          t.id === taskId ? { ...t, isCompleted: completed } : t
        ),
      });

      // Persist completed state
      const completedMap = storage.get(`completed_${today()}`) || {};
      if (completed) {
        completedMap[taskId] = true;
      } else {
        delete completedMap[taskId];
      }
      storage.set(`completed_${today()}`, completedMap);

      // All tasks done → auto checkin
      const newCompletedCount = tasks.filter(t =>
        t.id === taskId ? completed : t.isCompleted
      ).length;
      if (newCompletedCount === totalTasks) {
        addCheckin(today());
      }
    },
    [todayPlan, setPlan, addCheckin, tasks, totalTasks]
  );

  const handleSwitchMode = (mode) => {
    const minimal = mode === 'minimal';
    setIsMinimal(minimal);

    if (minimal) {
      const plan = generateMinimalPlan();
      // Restore completed state
      const completedMap = storage.get(`completed_${today()}`) || {};
      plan.tasks = plan.tasks.map(t => ({
        ...t,
        icon: t.type === 'vocabulary' ? '📝' : '🎧',
        isCompleted: !!completedMap[t.id],
      }));
      setPlan(plan);
    } else {
      loadTodayPlan(userProfile, setPlan, false);
    }
  };

  // Date display
  const d = new Date();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const dateDisplay = `${d.getMonth() + 1}月${d.getDate()}日 · 星期${weekdays[d.getDay()]}`;

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Date header */}
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-xl font-bold">{dateDisplay}</span>
        <span className="text-[13px] text-text-secondary">
          距离考试还有 {remainingDays} 天
        </span>
      </div>

      {/* Progress bar */}
      <ProgressBar
        completed={completedCount}
        total={totalTasks}
        color="#1a1a1a"
      />

      {/* Task list */}
      <div className="mt-5">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            taskId={task.id}
            icon={task.icon || (MODULES[task.type]?.icon || '📋')}
            label={task.label}
            duration={task.defaultDuration || 10}
            description={task.description || ''}
            completed={task.isCompleted || false}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Start study button */}
      <button
        onClick={() => navigate('/pomodoro')}
        className="w-full py-3.5 rounded-full text-base font-semibold bg-text-primary text-white mt-3 mb-5 transition-opacity hover:opacity-90"
      >
        开始今日学习
      </button>

      {/* Mode switch */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <button
          onClick={() => handleSwitchMode('normal')}
          className={`text-[13px] transition-colors ${!isMinimal ? 'text-text-primary font-semibold' : 'text-text-tertiary'}`}
        >
          正常
        </button>
        <span className="text-text-tertiary">|</span>
        <button
          onClick={() => handleSwitchMode('minimal')}
          className={`text-[13px] transition-colors ${isMinimal ? 'text-text-primary font-semibold' : 'text-text-tertiary'}`}
        >
          极简
        </button>
      </div>

      {/* Calendar */}
      <div className="mb-3">
        <span className="text-[15px] font-semibold text-text-secondary">打卡记录</span>
      </div>
      <CheckinCalendar checkins={checkins} />
    </div>
  );
}

// Helper: Load today's plan
function loadTodayPlan(profile, setPlan, minimal) {
  if (minimal) {
    const plan = generateMinimalPlan();
    const completedMap = storage.get(`completed_${today()}`) || {};
    plan.tasks = plan.tasks.map(t => ({
      ...t,
      icon: t.type === 'vocabulary' ? '📝' : '🎧',
      isCompleted: !!completedMap[t.id],
    }));
    setPlan(plan);
    return;
  }

  const todayStr = today();
  const remainingDays = daysBetween(todayStr, profile.examDate);
  const plan = generateDailyPlan(profile, remainingDays);

  // Restore completed state
  const completedMap = storage.get(`completed_${todayStr}`) || {};
  plan.tasks = plan.tasks.map(t => ({
    ...t,
    icon: t.type === 'vocabulary' ? MODULES.vocabulary.icon
      : (MODULES[t.type] ? MODULES[t.type].icon : '📋'),
    isCompleted: !!completedMap[t.id],
  }));

  setPlan(plan);
}

// Helper: Quick start without onboarding
function quickStart(setProfile, setWordBank, navigate) {
  const defaultProfile = {
    examType: 'cet4',
    examDate: getDefaultExamDate(),
    remainingDays: 90,
    selfEval: { listening: 3, reading: 3, writing: 3, translation: 3 },
    dailyTime: '30min',
    createdAt: today(),
  };

  setProfile(defaultProfile);
  storage.set(CACHE_KEYS.USER_PROFILE, defaultProfile);

  // Initialize word bank
  if (!storage.get(CACHE_KEYS.WORD_BANK)) {
    storage.set(CACHE_KEYS.WORD_BANK, SEED_WORD_BANK);
    setWordBank(SEED_WORD_BANK);
  }

  navigate('/', { replace: true });
}
