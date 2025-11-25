import React from 'react';
import { Tab } from '../types';
import { LayoutDashboard, CalendarDays, Ticket, MoreHorizontal } from 'lucide-react';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: React.ReactNode;
}

const Layout = ({ activeTab, onTabChange, children }: Props) => {
  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-50 shadow-2xl overflow-hidden relative">
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative z-0">
        {children}
      </main>

      {/* Floating Glass Bottom Navigation */}
      <nav className="no-print absolute left-4 right-4 h-16 z-50 safe-bottom-nav">
        <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl"></div>
        <div className="relative flex justify-around items-center h-full px-2">
          <NavButton 
            isActive={activeTab === Tab.Overview} 
            onClick={() => onTabChange(Tab.Overview)} 
            icon={<LayoutDashboard size={22} strokeWidth={activeTab === Tab.Overview ? 2.5 : 2} />}
            label="總覽"
          />
          <NavButton 
            isActive={activeTab === Tab.Itinerary} 
            onClick={() => onTabChange(Tab.Itinerary)} 
            icon={<CalendarDays size={22} strokeWidth={activeTab === Tab.Itinerary ? 2.5 : 2} />}
            label="行程"
          />
          <NavButton 
            isActive={activeTab === Tab.Tickets} 
            onClick={() => onTabChange(Tab.Tickets)} 
            icon={<Ticket size={22} strokeWidth={activeTab === Tab.Tickets ? 2.5 : 2} />}
            label="票券"
          />
          <NavButton 
            isActive={activeTab === Tab.More} 
            onClick={() => onTabChange(Tab.More)} 
            icon={<MoreHorizontal size={22} strokeWidth={activeTab === Tab.More ? 2.5 : 2} />}
            label="更多"
          />
        </div>
      </nav>
      
      {/* Spacer to prevent content from being hidden behind floating nav */}
      <div className="h-24 w-full absolute bottom-0 pointer-events-none bg-gradient-to-t from-slate-50 to-transparent z-10"></div>
    </div>
  );
};

const NavButton: React.FC<{ isActive: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ isActive, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-14 h-full space-y-0.5 transition-all duration-300 relative ${isActive ? 'text-primary -translate-y-1' : 'text-gray-400'}`}
  >
    {isActive && (
        <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-pulse"></span>
    )}
    <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : 'bg-transparent'}`}>
        {icon}
    </div>
    <span className={`text-[9px] font-bold ${isActive ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
  </button>
);

export default Layout;
