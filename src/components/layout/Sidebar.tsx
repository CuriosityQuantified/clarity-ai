'use client';

const navItems = [
  { icon: '📄', label: 'Document Library', active: true },
  { icon: '🔬', label: 'Research Sessions', active: false },
  { icon: '🔖', label: 'Bookmarks', active: false },
  { icon: '⚙️', label: 'Settings', active: false },
];

export function Sidebar() {
  return (
    <aside className="sidebar flex flex-col bg-[#1a1a24] border-r border-white/5">
      <div className="flex items-center gap-2 px-4 py-5">
        <span className="text-xl">✨</span>
        <h1 className="text-lg font-bold text-white">Clarity AI</h1>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              item.active
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm text-indigo-400">
            R
          </div>
          <span className="text-sm text-gray-400">Researcher</span>
        </div>
      </div>
    </aside>
  );
}
