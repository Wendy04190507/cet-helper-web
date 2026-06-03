/**
 * Progress bar with label
 * @param {{ completed: number, total: number, color?: string, label?: string, showLabel?: boolean }}
 */
export default function ProgressBar({
  completed = 0,
  total = 0,
  color = '#1a1a1a',
  label = '今日进度',
  showLabel = true,
}) {
  const percent = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));

  return (
    <div className="w-full">
      <div className="w-full h-1.5 bg-divider rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-text-secondary">{label}</span>
          <span className="text-xs font-semibold text-text-primary">{completed}/{total}</span>
        </div>
      )}
    </div>
  );
}
