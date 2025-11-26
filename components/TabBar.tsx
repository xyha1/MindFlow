import React from 'react';
import { Tab } from '../types';
import { IconList, IconCalendar, IconBulb } from './Icons';

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const getTabClass = (tab: Tab) => {
    const base = "flex flex-col items-center justify-center w-full h-full transition-all duration-200 p-2 rounded-xl";
    const active = activeTab === tab
      ? "text-primary-600 scale-105 bg-primary-50/50 landscape:bg-primary-50"
      : "text-slate-400 hover:text-slate-500 hover:bg-slate-50";
    return `${base} ${active}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 md:h-20 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-lg z-50 pb-safe
                    landscape:top-0 landscape:bottom-0 landscape:left-0 landscape:w-20 landscape:h-full landscape:border-t-0 landscape:border-r landscape:flex landscape:flex-col landscape:items-center landscape:justify-center landscape:py-4">
      <div className="flex justify-around h-full max-w-md mx-auto w-full landscape:flex-col landscape:justify-center landscape:gap-8 landscape:h-auto landscape:w-full landscape:px-2">
        <button onClick={() => onTabChange(Tab.TODO)} className={getTabClass(Tab.TODO)}>
          <IconList className="w-6 h-6 mb-1 landscape:w-7 landscape:h-7" />
          <span className="text-[10px] font-bold tracking-wide">TASKS</span>
        </button>
        <button onClick={() => onTabChange(Tab.CALENDAR)} className={getTabClass(Tab.CALENDAR)}>
          <IconCalendar className="w-6 h-6 mb-1 landscape:w-7 landscape:h-7" />
          <span className="text-[10px] font-bold tracking-wide">CAL</span>
        </button>
        <button onClick={() => onTabChange(Tab.IDEAS)} className={getTabClass(Tab.IDEAS)}>
          <IconBulb className="w-6 h-6 mb-1 landscape:w-7 landscape:h-7" />
          <span className="text-[10px] font-bold tracking-wide">IDEAS</span>
        </button>
      </div>
    </div>
  );
};

export default TabBar;