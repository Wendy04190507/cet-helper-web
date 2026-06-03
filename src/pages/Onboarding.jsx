import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { MODULES } from '../constants';
import { getDefaultExamDate, daysBetween, today } from '../utils/date';
import RadarChart from '../components/RadarChart';

const TOTAL_STEPS = 4;

const moduleList = [
  MODULES.listening,
  MODULES.reading,
  MODULES.writing,
  MODULES.translation,
];

export default function Onboarding() {
  const { isOnboarded, setProfile } = useApp();
  const navigate = useNavigate();

  // If already onboarded, redirect to home
  if (isOnboarded) {
    navigate('/', { replace: true });
    return null;
  }

  const [step, setStep] = useState(0);
  const [examType, setExamType] = useState('');
  const [examDate, setExamDate] = useState(getDefaultExamDate());
  const [selfEval, setSelfEval] = useState({
    listening: 0,
    reading: 0,
    writing: 0,
    translation: 0,
  });
  const [dailyTime, setDailyTime] = useState('');

  const remainingDays = daysBetween(today(), examDate);

  const canNext = useCallback(() => {
    switch (step) {
      case 0: return !!examType;
      case 1: return true;
      case 2: return Object.values(selfEval).every(v => v > 0);
      case 3: return !!dailyTime;
      default: return false;
    }
  }, [step, examType, selfEval, dailyTime]);

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
    }
  };

  const handleSelectExam = (type) => {
    setExamType(type);
  };

  const handleEval = (module, score) => {
    setSelfEval(prev => ({ ...prev, [module]: score }));
  };

  const handleFinish = () => {
    if (!dailyTime) return;

    const profile = {
      examType,
      examDate,
      remainingDays,
      selfEval,
      dailyTime,
      createdAt: today(),
    };

    setProfile(profile);
    navigate('/', { replace: true });
  };

  // Build radar data for preview
  const radarData = Object.entries(selfEval).map(([key, value]) => ({
    label: MODULES[key]?.label || key,
    value,
    max: 5,
    color: MODULES[key]?.color || '#1a1a1a',
  }));

  const hasEval = Object.values(selfEval).every(v => v > 0);

  return (
    <div className="min-h-dvh flex flex-col items-center px-6 pt-12 pb-8">
      {/* Step dots */}
      <div className="flex gap-3 mb-10">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i <= step ? 'bg-text-primary scale-125' : 'bg-text-tertiary'
            }`}
          />
        ))}
      </div>

      {/* Step 0: Select exam type */}
      {step === 0 && (
        <div className="flex-1 flex flex-col items-center w-full">
          <h1 className="text-3xl font-bold mb-2 text-center">你准备考什么？</h1>
          <div className="flex gap-4 w-full justify-center flex-wrap mt-8">
            <button
              onClick={() => handleSelectExam('cet4')}
              className={`w-36 py-6 bg-surface rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] text-center border-2 transition-all duration-200 ${
                examType === 'cet4'
                  ? 'border-text-primary'
                  : 'border-transparent hover:border-text-tertiary'
              }`}
            >
              <span className="text-4xl block mb-3">📘</span>
              <span className="text-lg font-semibold block">四级</span>
              <span className="text-[13px] text-text-secondary">CET-4</span>
            </button>
            <button
              onClick={() => handleSelectExam('cet6')}
              className={`w-36 py-6 bg-surface rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] text-center border-2 transition-all duration-200 ${
                examType === 'cet6'
                  ? 'border-text-primary'
                  : 'border-transparent hover:border-text-tertiary'
              }`}
            >
              <span className="text-4xl block mb-3">📕</span>
              <span className="text-lg font-semibold block">六级</span>
              <span className="text-[13px] text-text-secondary">CET-6</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Pick exam date */}
      {step === 1 && (
        <div className="flex-1 flex flex-col items-center w-full">
          <h1 className="text-3xl font-bold mb-1 text-center">考试日期</h1>
          <p className="text-[15px] text-text-secondary mb-8 text-center">
            距离这天开始倒推每日任务
          </p>
          <div className="w-full max-w-xs">
            <label className="block bg-surface rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] text-center cursor-pointer">
              <input
                type="date"
                value={examDate}
                min={today()}
                onChange={(e) => setExamDate(e.target.value)}
                className="block w-full text-center text-lg font-semibold bg-transparent border-none outline-none text-text-primary cursor-pointer"
              />
              <span className="text-[11px] text-text-tertiary mt-1 block">
                默认：下一次统考日期
              </span>
            </label>
          </div>
          {remainingDays > 0 && (
            <p className="mt-5 text-[15px] text-text-secondary text-center">
              距离考试还有{' '}
              <span className="text-2xl font-bold text-text-primary">{remainingDays}</span>{' '}
              天
            </p>
          )}
        </div>
      )}

      {/* Step 2: Self-eval */}
      {step === 2 && (
        <div className="flex-1 flex flex-col items-center w-full">
          <h1 className="text-3xl font-bold mb-1 text-center">自我评估</h1>
          <p className="text-[15px] text-text-secondary mb-6 text-center">
            诚实打分，系统才能精准帮你
          </p>

          <div className="w-full max-w-sm">
            {moduleList.map(mod => (
              <div
                key={mod.key}
                className="flex justify-between items-center py-3 border-b border-divider"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{mod.icon}</span>
                  <span className="text-[15px] font-medium">{mod.label}</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleEval(mod.key, star)}
                      className={`p-1 text-2xl transition-colors duration-150 ${
                        star <= (selfEval[mod.key] || 0)
                          ? 'text-warning'
                          : 'text-text-tertiary'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Radar preview */}
          {hasEval && (
            <div className="mt-6">
              <RadarChart data={radarData} width={280} height={260} />
            </div>
          )}
        </div>
      )}

      {/* Step 3: Daily time + finish */}
      {step === 3 && (
        <div className="flex-1 flex flex-col items-center w-full">
          <h1 className="text-3xl font-bold mb-1 text-center">每日可用时间</h1>
          <p className="text-[15px] text-text-secondary mb-8 text-center">
            随时可调，不用有压力
          </p>

          <div className="flex gap-4 flex-wrap justify-center w-full">
            <button
              onClick={() => setDailyTime('15min')}
              className={`w-40 py-5 bg-surface rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] text-center border-2 transition-all duration-200 ${
                dailyTime === '15min'
                  ? 'border-text-primary'
                  : 'border-transparent hover:border-text-tertiary'
              }`}
            >
              <span className="text-xl font-bold block">15 分钟</span>
              <span className="text-[13px] text-text-secondary">极简模式</span>
            </button>
            <button
              onClick={() => setDailyTime('30min')}
              className={`w-40 py-5 bg-surface rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] text-center border-2 transition-all duration-200 ${
                dailyTime === '30min'
                  ? 'border-text-primary'
                  : 'border-transparent hover:border-text-tertiary'
              }`}
            >
              <span className="text-xl font-bold block">30 分钟</span>
              <span className="text-[13px] text-text-secondary">推荐</span>
            </button>
            <button
              onClick={() => setDailyTime('60min')}
              className={`w-40 py-5 bg-surface rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] text-center border-2 transition-all duration-200 ${
                dailyTime === '60min'
                  ? 'border-text-primary'
                  : 'border-transparent hover:border-text-tertiary'
              }`}
            >
              <span className="text-xl font-bold block">1 小时</span>
              <span className="text-[13px] text-text-secondary">常规模式</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      {step < TOTAL_STEPS - 1 ? (
        <button
          onClick={handleNext}
          disabled={!canNext()}
          className="w-full max-w-xs mt-auto py-3.5 rounded-full text-base font-semibold transition-all duration-200 bg-text-primary text-white disabled:bg-text-tertiary disabled:cursor-not-allowed"
        >
          {step === 2 ? '看结果' : '继续'}
        </button>
      ) : (
        <button
          onClick={handleFinish}
          disabled={!canNext()}
          className="w-full max-w-xs mt-auto py-3.5 rounded-full text-base font-semibold transition-all duration-200 bg-text-primary text-white disabled:bg-text-tertiary disabled:cursor-not-allowed"
        >
          开始备考
        </button>
      )}
    </div>
  );
}
