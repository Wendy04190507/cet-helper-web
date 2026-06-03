import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/', icon: '📋', label: '今日' },
  { to: '/pomodoro', icon: '⏱️', label: '学习' },
  { to: '/settings', icon: '👤', label: '我' },
];

export default function BottomNav() {
  const location = useLocation();
  const isHidden = location.pathname === '/onboarding';

  if (isHidden) return null;

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-surface border-t border-divider flex justify-around items-center py-2 z-50"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)',
      }}
    >
      {tabs.map(t => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === '/'}
          className="flex flex-col items-center gap-0.5 px-5 py-1 no-underline transition-opacity duration-200"
          style={({ isActive }) => ({
            opacity: isActive ? 1 : 0.35,
          })}
        >
          <span className="text-xl leading-none">{t.icon}</span>
          <span className="text-xs font-medium text-text-primary">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
