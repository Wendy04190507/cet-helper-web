import { useMemo } from 'react';
import { formatDate, today } from '../utils/date';

/**
 * CheckinCalendar — Monthly calendar grid, show filled dots for checked days, calculate streak
 * @param {{ checkins: string[] }} props
 */
export default function CheckinCalendar({ checkins = [] }) {
  const calendar = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const todayStr = today();
    const weekdays = ['一', '二', '三', '四', '五', '六', '日'];

    // First day of month (adjusted to Monday=0)
    const firstDay = new Date(year, month - 1, 1).getDay();
    const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;

    // Days in month
    const daysInMonth = new Date(year, month, 0).getDate();

    const checkinSet = new Set(checkins || []);
    const days = [];

    // Fill leading blanks
    for (let i = 0; i < adjustedFirst; i++) {
      days.push({ empty: true });
    }

    // Fill days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDate(new Date(year, month - 1, d));
      days.push({
        num: d,
        date: dateStr,
        isToday: dateStr === todayStr,
        checked: checkinSet.has(dateStr),
        empty: false,
      });
    }

    // Calculate streak
    let streak = 0;
    let check = new Date(todayStr);

    if (!checkinSet.has(todayStr)) {
      check.setDate(check.getDate() - 1);
    }

    while (true) {
      const ds = formatDate(check);
      if (checkinSet.has(ds)) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }

    return { year, month, weekdays, days, streak };
  }, [checkins]);

  const { year, month, weekdays, days, streak } = calendar;

  return (
    <div className="p-4 bg-surface rounded-2xl">
      {/* Header */}
      <div className="text-center mb-3">
        <span className="text-[15px] font-semibold text-text-primary">
          {year}年{month}月
        </span>
      </div>

      {/* Grid */}
      <div
        className="grid gap-[2px] text-center"
        style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}
      >
        {/* Weekday headers */}
        {weekdays.map((wd, i) => (
          <span
            key={`wd-${i}`}
            className="text-[11px] text-text-tertiary py-1 block"
          >
            {wd}
          </span>
        ))}

        {/* Days */}
        {days.map((day, i) => (
          <div
            key={`day-${i}`}
            className={`aspect-square flex items-center justify-center rounded-full transition-colors duration-200 ${
              day.empty
                ? 'invisible'
                : day.checked
                  ? 'bg-text-primary'
                  : ''
            } ${
              day.isToday && !day.checked
                ? 'border-2 border-text-primary'
                : ''
            }`}
          >
            {!day.empty && (
              <span
                className={`text-[13px] ${
                  day.checked
                    ? 'text-white font-semibold'
                    : 'text-text-primary'
                }`}
              >
                {day.num}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Streak info */}
      {streak > 0 && (
        <div className="flex items-center justify-center mt-3 gap-1">
          <span className="text-xl">🔥</span>
          <span className="text-[15px] font-semibold text-text-primary">
            连续 {streak} 天了
          </span>
        </div>
      )}
    </div>
  );
}
