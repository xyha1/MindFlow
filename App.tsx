import React, { useState } from 'react';
import TabBar from './components/TabBar';
import TodoList from './components/TodoList';
import CalendarView from './components/CalendarView';
import IdeaBoard from './components/IdeaBoard';
import { Tab } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { checkSystemStatus } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useLocalStorage<Tab>('mindflow_active_tab', Tab.TODO);
  const [diagMessage, setDiagMessage] = useState<string>('');

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

  const runDiagnostics = async () => {
    setDiagMessage('Connecting...');
    const result = await checkSystemStatus();
    setDiagMessage(result.message);
    if (!result.ok) {
        alert("Diagnostics Failed:\n" + result.message);
    } else {
        alert("Diagnostics Passed:\n" + result.message);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex justify-center text-slate-900 font-sans overflow-hidden">
      <div className="w-full max-w-md h-full bg-white sm:shadow-2xl sm:my-4 sm:rounded-[3rem] sm:h-[95vh] relative flex flex-col overflow-hidden landscape:max-w-full landscape:my-0 landscape:rounded-none landscape:h-full">
        
        {/* DIAGNOSTIC BAR: REMOVE AFTER TESTING */}
        <div className="bg-slate-900 text-white text-[10px] p-2 flex justify-between items-center z-50 shrink-0">
            <div className="flex flex-col">
              <span className="font-mono">
                  API Key: {process.env.API_KEY ? <span className="text-green-400">LOADED</span> : <span className="text-red-500 font-bold">MISSING</span>}
              </span>
              <span className="font-mono text-slate-400">
                  Proxy: {process.env.API_BASE_URL ? <span className="text-blue-400">CONFIGURED</span> : "DIRECT"}
              </span>
            </div>
            {process.env.API_KEY && (
                <button 
                    onClick={runDiagnostics} 
                    className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white transition-colors h-8"
                >
                    Test AI {diagMessage && `(${diagMessage})`}
                </button>
            )}
        </div>

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