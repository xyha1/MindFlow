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
    setDiagMessage(result.ok ? 'OK' : 'Error');
    
    // Pretty print the debug details
    const debugText = JSON.stringify(result.debugInfo, null, 2);
    
    if (!result.ok) {
        alert(`❌ DIAGNOSTICS FAILED\n\nReason: ${result.message}\n\nDEBUG INFO:\n${debugText}`);
    } else {
        alert(`✅ SYSTEM OPERATIONAL\n\n${result.message}\n\nDEBUG INFO:\n${debugText}`);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex justify-center text-slate-900 font-sans overflow-hidden">
      <div className="w-full max-w-md h-full bg-white sm:shadow-2xl sm:my-4 sm:rounded-[3rem] sm:h-[95vh] relative flex flex-col overflow-hidden landscape:max-w-full landscape:my-0 landscape:rounded-none landscape:h-full">
        
        {/* DIAGNOSTIC BAR: REMOVE AFTER TESTING */}
        <div className="bg-slate-900 text-white text-[10px] p-2 flex justify-between items-center z-50 shrink-0 shadow-md">
            <div className="flex flex-col max-w-[70%]">
              <span className="font-mono flex items-center gap-1">
                  API Key: {process.env.API_KEY ? <span className="text-green-400 font-bold">● LOADED</span> : <span className="text-red-500 font-bold">● MISSING</span>}
              </span>
              <span className="font-mono text-slate-400 truncate" title={process.env.API_BASE_URL}>
                  Proxy: {process.env.API_BASE_URL ? <span className="text-blue-300">{process.env.API_BASE_URL}</span> : <span className="text-slate-500">Direct (Google)</span>}
              </span>
            </div>
            {process.env.API_KEY && (
                <button 
                    onClick={runDiagnostics} 
                    className={`px-3 py-1 rounded text-white transition-colors h-8 text-xs font-bold border border-slate-600 ${diagMessage === 'Error' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                    {diagMessage || 'Test Conn'}
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