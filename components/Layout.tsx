import React from 'react';
import { AppState, FlowerTheme } from '../types';
import { FLOWER_THEMES } from '../constants';
import { Activity, BookOpen, LayoutDashboard, Settings, FileText } from 'lucide-react';

interface LayoutProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ appState, setAppState, activeTab, setActiveTab, children }) => {
  const currentTheme = FLOWER_THEMES.find(t => t.id === appState.current_flower_id) || FLOWER_THEMES[0];
  const isDark = appState.theme_mode === 'dark';

  // Dynamic style injection for theme colors
  const themeStyle = {
    '--theme-primary': currentTheme.primary,
    '--theme-secondary': currentTheme.secondary,
    '--theme-accent': currentTheme.accent,
    '--theme-bg': isDark ? '#0B1725' : currentTheme.bg,
    '--theme-text': isDark ? '#ECF0F1' : '#0B1725',
    '--orb-shadow-color': currentTheme.accent,
  } as React.CSSProperties;

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full text-left
        ${activeTab === id 
          ? 'bg-[var(--theme-primary)] text-white shadow-lg' 
          : 'hover:bg-black/5 text-[var(--theme-text)] opacity-70 hover:opacity-100'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div style={themeStyle} className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex transition-colors duration-500">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-white/10 backdrop-blur-md border-r border-white/20 p-6 flex flex-col h-screen sticky top-0">
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight">FDA Review Studio</h1>
          <p className="text-xs opacity-60 mt-1">Flower Edition V2</p>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem id="pipeline" icon={Activity} label="Review Pipeline" />
          <NavItem id="summary" icon={FileText} label="Device Summary" />
          <NavItem id="notes" icon={BookOpen} label="AI Note Keeper" />
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
          <div>
            <label className="text-xs font-semibold opacity-50 uppercase tracking-wider mb-2 block">Theme</label>
            <select 
              value={appState.current_flower_id}
              onChange={(e) => setAppState(prev => ({ ...prev, current_flower_id: e.target.value }))}
              className="w-full bg-black/5 border border-white/10 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)]"
            >
              {FLOWER_THEMES.map(t => (
                <option key={t.id} value={t.id}>{appState.language === 'en' ? t.name_en : t.name_zh}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
             <span className="text-sm">Dark Mode</span>
             <button 
               onClick={() => setAppState(prev => ({ ...prev, theme_mode: prev.theme_mode === 'light' ? 'dark' : 'light' }))}
               className={`w-10 h-5 rounded-full p-1 transition-colors ${isDark ? 'bg-[var(--theme-primary)]' : 'bg-gray-300'}`}
             >
               <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
             </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Status Header */}
        <div className="bg-white/5 backdrop-blur-md border-b border-white/10 p-6 sticky top-0 z-10 flex items-center justify-between">
          <div>
             <h2 className="text-2xl font-bold">{currentTheme.name_en}</h2>
             <p className="text-sm opacity-60">Nordic Regulatory Workspace</p>
          </div>
          
          <div className="flex items-center gap-8">
             {/* Stats */}
             <div className="flex gap-6 text-sm">
                <div className="flex flex-col">
                  <span className="opacity-50 text-xs uppercase">Health</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${appState.health}%` }} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="opacity-50 text-xs uppercase">Mana</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${appState.mana}%` }} />
                  </div>
                </div>
                <div className="flex flex-col">
                   <span className="opacity-50 text-xs uppercase">Level {appState.level}</span>
                   <span className="font-bold">{appState.experience} XP</span>
                </div>
             </div>

             {/* Mana Orb */}
             <div className="relative group cursor-pointer">
               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-[var(--theme-accent)] mana-orb animate-orb-pulse relative z-10">
                 <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/80 to-transparent" />
               </div>
               <div className="absolute top-full right-0 mt-2 w-32 bg-black/80 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity text-center backdrop-blur-md">
                 Stress: {100 - appState.health}%
               </div>
             </div>
          </div>
        </div>

        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
