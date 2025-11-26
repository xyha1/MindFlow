import React from 'react';
import { Tab } from '../types';
import { IconList, IconCalendar, IconBulb } from './Icons';

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const getTabClass = (tab: Tab) => {
    const base = "flex flex-col items-center justify-center w-full h-full transition-all duration-200";
    return activeTab === tab
      ? `${base} text-primary-600 scale-105`
      : `${base} text-slate-400 hover:text-slate-500`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 md:h-20 bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-lg z-50 pb-safe">
      <div className="flex justify-around h-full max-w-md mx-auto">
        <button onClick={() => onTabChange(Tab.TODO)} className={getTabClass(Tab.TODO)}>
          <IconList className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold tracking-wide">TASKS</span>
        </button>
        <button onClick={() => onTabChange(Tab.CALENDAR)} className={getTabClass(Tab.CALENDAR)}>
          <IconCalendar className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold tracking-wide">CALENDAR</span>
        </button>
        <button onClick={() => onTabChange(Tab.IDEAS)} className={getTabClass(Tab.IDEAS)}>
          <IconBulb className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold tracking-wide">IDEAS</span>
        </button>
      </div>
    </div>
  );
};

export default TabBar;