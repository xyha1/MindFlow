import React from 'react';
import TabBar from './components/TabBar';
import TodoList from './components/TodoList';
import CalendarView from './components/CalendarView';
import IdeaBoard from './components/IdeaBoard';
import { Tab } from './types';
import useLocalStorage from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useLocalStorage<Tab>('mindflow_active_tab', Tab.TODO);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.TODO:
        return <TodoList />;
      case Tab.CALENDAR:
        return <CalendarView />;
      case Tab.IDEAS:
        return <IdeaBoard />;
      default:
        return <TodoList />;
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex justify-center text-slate-900 font-sans overflow-hidden">
      <div className="w-full max-w-md h-full bg-white sm:shadow-2xl sm:my-4 sm:rounded-[3rem] sm:h-[95vh] relative flex flex-col overflow-hidden landscape:max-w-full landscape:my-0 landscape:rounded-none landscape:h-full">
        
        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-hidden">
            {renderContent()}
        </main>

        {/* Navigation */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

export default App;