/**
 * TaskCard — card with icon, label, duration badge, description, checkbox toggle
 * @param {{ taskId: string, icon: string, label: string, duration: number, description: string, source?: string, completed: boolean, onToggle: (taskId: string, completed: boolean) => void }}
 */
export default function TaskCard({
  taskId,
  icon = '📝',
  label = '',
  duration = 10,
  description = '',
  source = '',
  completed = false,
  onToggle,
}) {
  const handleClick = () => {
    onToggle?.(taskId, !completed);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center p-4 bg-surface rounded-2xl mb-3 shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all duration-200 cursor-pointer select-none ${
        completed ? 'opacity-50' : 'hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]'
      }`}
    >
      {/* Icon */}
      <span className="text-2xl mr-4 flex-shrink-0 select-none">{icon}</span>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-base font-semibold text-text-primary truncate">{label}</span>
          <span className="text-xs text-text-secondary bg-accent-soft px-2.5 py-0.5 rounded-xl flex-shrink-0 ml-2">
            {duration}min
          </span>
        </div>
        <p className="text-[13px] text-text-secondary truncate">{description}</p>
        {source && (
          <p className="text-[11px] text-text-tertiary mt-0.5 truncate">{source}</p>
        )}
      </div>

      {/* Checkbox toggle */}
      <div className="w-10 h-10 flex items-center justify-center ml-2 flex-shrink-0">
        {completed ? (
          <div className="w-9 h-9 rounded-full bg-success flex items-center justify-center">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full border-2 border-text-tertiary" />
        )}
      </div>
    </div>
  );
}
