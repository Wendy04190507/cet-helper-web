import { Link } from 'react-router-dom';

const modules = [
  { to: '/word-review', icon: '📝', label: '单词复习', desc: '艾宾浩斯间隔重复', color: '#ff3b30' },
  { to: '/listening', icon: '🎧', label: '听力训练', desc: '精听 + 听写 + 费曼', color: '#007aff' },
  { to: '/reading', icon: '📖', label: '阅读理解', desc: 'PQ4R法 + 主动回忆', color: '#34c759' },
  { to: '/writing', icon: '✍️', label: '写作练习', desc: '费曼思路 + AI批改', color: '#ff9f0a' },
  { to: '/translation', icon: '🔄', label: '翻译训练', desc: '拆句法 + AI校对', color: '#af52de' },
  { to: '/error-book', icon: '📚', label: '错题本', desc: '错误回顾，温故知新', color: '#8B8682' },
];

export default function LearningHub() {
  return (
    <div className="px-4 pt-6 pb-24">
      <h2 className="text-2xl font-semibold mb-1">学习中心</h2>
      <p className="text-sm text-text-secondary mb-6">选择你要练习的模块</p>
      <div className="grid grid-cols-2 gap-3">
        {modules.map((mod) => (
          <Link
            key={mod.to}
            to={mod.to}
            className="card card-hover flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-divider/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-200"
          >
            <span className="text-3xl mb-2">{mod.icon}</span>
            <span className="text-sm font-semibold text-text-primary mb-0.5">{mod.label}</span>
            <span className="text-[11px] text-text-tertiary leading-tight">{mod.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
