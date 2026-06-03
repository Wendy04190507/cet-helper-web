import { useState, useRef, useEffect, useCallback } from 'react';
import { MODULES } from '../constants';
import { storage, CACHE_KEYS } from '../utils/storage';
import { today } from '../utils/date';

const PLANT_STAGES = ['🌱', '🪴', '🌿', '🌳', '🌲'];
const PLANT_MESSAGES = [
  '完成一次专注，种子就会长大',
  '刚开始生长...',
  '正在茁壮成长',
  '快要完成了',
  '再坚持一下！',
  '完成了！真棒 ✨',
];

const SAMPLE_PEERS = [
  { id: 1, name: '北京大学', task: '听力精听' },
  { id: 2, name: '匿名用户', task: '单词复习' },
  { id: 3, name: '浙江大学', task: '翻译练习' },
  { id: 4, name: '匿名用户', task: '阅读训练' },
  { id: 5, name: '武汉大学', task: '单词复习' },
];

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return {
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
  };
}

export default function Pomodoro() {
  const [duration, setDuration] = useState(25); // minutes
  const [remaining, setRemaining] = useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [plantIndex, setPlantIndex] = useState(0);
  const [peers, setPeers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);

  const timerRef = useRef(null);

  // Simulate peers on mount
  useEffect(() => {
    const count = 2 + Math.floor(Math.random() * 4);
    setPeers(SAMPLE_PEERS.slice(0, count));
    setOnlineCount(2314 + Math.floor(Math.random() * 200));
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const updatePlant = useCallback((remainingSec, totalSec) => {
    const progress = 1 - remainingSec / totalSec;
    if (progress >= 1) {
      setPlantIndex(5); // Special message
    } else if (progress >= 0.75) setPlantIndex(4);
    else if (progress >= 0.5) setPlantIndex(3);
    else if (progress >= 0.25) setPlantIndex(2);
    else setPlantIndex(1);
  }, []);

  const runTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsRunning(false);
          setIsPaused(false);
          updatePlant(0, totalSeconds);
          return 0;
        }
        const next = prev - 1;
        if (next % 10 === 0) {
          updatePlant(next, totalSeconds);
        }
        return next;
      });
    }, 1000);
  }, [totalSeconds, updatePlant]);

  const startTimer = () => {
    const secs = duration * 60;
    setTotalSeconds(secs);
    setRemaining(secs);
    setIsRunning(true);
    setIsPaused(false);

    // Try to load current task from today's plan
    const plan = storage.get(CACHE_KEYS.TODAY_PLAN);
    if (plan && plan.tasks) {
      const completedMap = storage.get(`completed_${today()}`) || {};
      const nextTask = plan.tasks.find(t => !completedMap[t.id]);
      if (nextTask) {
        setCurrentTask({
          label: nextTask.label,
          icon: MODULES[nextTask.type] ? MODULES[nextTask.type].icon : '📋',
        });
      }
    }

    // Reset plant
    setPlantIndex(1);
    updatePlant(secs, secs);

    runTimer();
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
    runTimer();
  };

  const skipTask = () => {
    setCurrentTask(null);
  };

  const handleDurationChange = (min) => {
    if (!isRunning && !isPaused) {
      setDuration(min);
      setRemaining(min * 60);
      setTotalSeconds(min * 60);
    }
  };

  const progress = totalSeconds > 0 ? 1 - remaining / totalSeconds : 0;
  const { minutes, seconds } = formatTime(remaining);

  // SVG ring constants
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 12;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference * (1 - progress);

  const plantEmoji = plantIndex === 5 ? PLANT_STAGES[4] : PLANT_STAGES[Math.min(plantIndex - 1, 4)];
  const plantMessage = PLANT_MESSAGES[plantIndex] || PLANT_MESSAGES[0];

  return (
    <div className="min-h-dvh flex flex-col items-center px-6 pt-8 pb-24">
      {/* Timer ring */}
      <div className="relative mb-6" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-baseline">
            <span className="text-7xl font-[200] text-text-primary font-mono tracking-tight">
              {minutes}
            </span>
            <span className="text-6xl font-[200] text-text-tertiary font-mono mx-1">
              :
            </span>
            <span className="text-7xl font-[200] text-text-primary font-mono tracking-tight">
              {seconds}
            </span>
          </div>
        </div>
      </div>

      {/* Current task */}
      {currentTask && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{currentTask.icon}</span>
          <span className="text-[15px] text-text-secondary">{currentTask.label}</span>
        </div>
      )}

      {/* Plant growth */}
      <div className="text-center mb-6">
        <span
          className="text-5xl block mb-1 transition-transform duration-500 ease-out"
          style={{
            transform: `scale(${1 + progress * 0.2})`,
          }}
        >
          {plantEmoji}
        </span>
        <span className="text-[13px] text-text-tertiary">{plantMessage}</span>
      </div>

      {/* Study With Me */}
      <div className="w-full max-w-xs bg-surface rounded-2xl p-4 mb-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <span className="text-[13px] text-text-secondary block mb-2">
          🌙 此刻有 {onlineCount} 人在学
        </span>
        <div className="flex flex-col gap-1.5">
          {peers.map(peer => (
            <div key={peer.id} className="flex items-center gap-1.5">
              <span className="text-success text-xs">●</span>
              <span className="text-[11px] text-text-tertiary">
                {peer.name} · {peer.task}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap justify-center mb-6">
        {!isRunning && !isPaused && (
          <button
            onClick={startTimer}
            className="w-40 py-3 rounded-full text-[15px] font-semibold bg-text-primary text-white transition-opacity hover:opacity-90"
          >
            开始
          </button>
        )}
        {isRunning && (
          <button
            onClick={pauseTimer}
            className="w-40 py-3 rounded-full text-[15px] font-semibold bg-accent-soft text-text-primary transition-opacity hover:opacity-90"
          >
            暂停
          </button>
        )}
        {isPaused && (
          <button
            onClick={resumeTimer}
            className="w-40 py-3 rounded-full text-[15px] font-semibold bg-text-primary text-white transition-opacity hover:opacity-90"
          >
            继续
          </button>
        )}
        {(isRunning || isPaused) && (
          <button
            onClick={skipTask}
            className="w-40 py-3 rounded-full text-[15px] font-semibold bg-transparent text-text-secondary border border-divider transition-opacity hover:opacity-80"
          >
            跳过当前
          </button>
        )}
      </div>

      {/* Duration selector (only when idle) */}
      {!isRunning && !isPaused && (
        <div className="flex gap-4">
          {[15, 25, 45].map(m => (
            <button
              key={m}
              onClick={() => handleDurationChange(m)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${
                duration === m
                  ? 'bg-text-primary text-white'
                  : 'bg-accent-soft text-text-tertiary'
              }`}
            >
              {m}min
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
