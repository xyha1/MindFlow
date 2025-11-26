import React, { useState } from 'react';
import { Todo } from '../types';
import { IconCheck, IconPlus, IconTrash, IconSparkles, IconArchive, IconHistory, IconChevronLeft } from './Icons';
import { generateSubtasks } from '../services/geminiService';
import useLocalStorage from '../hooks/useLocalStorage';

const TodoList: React.FC = () => {
  const [tasks, setTasks] = useLocalStorage<Todo[]>('mindflow_tasks', []);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [view, setView] = useState<'active' | 'history'>('active');

  const addTask = (text: string) => {
    if (!text.trim()) return;
    const newTask: Todo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
    setInputValue('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id 
        ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined } 
        : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAiSplit = async () => {
    if (!inputValue.trim()) return;
    setIsAiLoading(true);
    const subtasks = await generateSubtasks(inputValue);
    setIsAiLoading(false);

    if (subtasks.length > 0) {
      const newTasks = subtasks.map(text => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text,
        completed: false,
        createdAt: Date.now(),
      }));
      setTasks(prev => [...newTasks, ...prev]);
      setInputValue('');
    } else {
        addTask(inputValue);
    }
  };

  const handleArchive = () => {
    setTasks(prev => prev.map(t => {
      if (t.completed && !t.archivedDate) {
        // Use completion date or fallback to current local date
        const date = t.completedAt ? new Date(t.completedAt) : new Date();
        // Convert to YYYY-MM-DD
        const dateStr = date.toLocaleDateString('en-CA');
        return { ...t, archivedDate: dateStr };
      }
      return t;
    }));
  };

  // Filter tasks based on view
  const activeTasks = tasks.filter(t => !t.archivedDate);
  const archivedTasks = tasks.filter(t => t.archivedDate);

  // Sort active tasks: Incomplete first, then newest
  const sortedActiveTasks = [...activeTasks].sort((a, b) => {
    if (a.completed === b.completed) {
      return b.createdAt - a.createdAt;
    }
    return a.completed ? 1 : -1;
  });

  // Group archived tasks by date
  const historyByDate = archivedTasks.reduce((acc, task) => {
    const date = task.archivedDate!;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Todo[]>);

  // Sort dates descending
  const historyDates = Object.keys(historyByDate).sort((a, b) => b.localeCompare(a));

  const completedCount = activeTasks.filter(t => t.completed).length;

  if (view === 'history') {
    return (
      <div className="h-full flex flex-col p-6 pt-10 landscape:pl-24 landscape:pt-6">
        <div className="mb-6 flex items-center gap-2">
          <button 
            onClick={() => setView('active')}
            className="p-2 -ml-2 text-slate-400 hover:text-primary-600 transition-colors"
          >
            <IconChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">History</h1>
            <p className="text-slate-500 font-medium text-sm">Completed tasks by day</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 landscape:pb-6 space-y-6">
          {historyDates.length === 0 && (
             <div className="text-center text-slate-400 mt-20 flex flex-col items-center">
                <IconHistory className="w-12 h-12 mb-2 opacity-20"/>
                <p>No archived tasks yet.</p>
             </div>
          )}
          {historyDates.map(date => (
            <div key={date} className="animate-in slide-in-from-bottom-2 duration-500">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">
                {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <div className="space-y-2">
                {historyByDate[date].map(task => (
                  <div key={task.id} className="flex items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-500">
                    <IconCheck className="w-5 h-5 mr-3 text-primary-500" />
                    <span className="line-through flex-1">{task.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 pt-10 landscape:pl-24 landscape:pt-6">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Today's Focus</h1>
          <p className="text-slate-500 font-medium mt-1">
            {completedCount} of {activeTasks.length} tasks completed
          </p>
        </div>
        <button 
          onClick={() => setView('history')}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm"
          title="View History"
        >
          <IconHistory className="w-5 h-5" />
        </button>
      </div>

      <div className="relative mb-6 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask(inputValue)}
          placeholder="Add a new task..."
          className="flex-1 bg-white border border-slate-200 rounded-2xl py-4 pl-5 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-700 transition-all"
        />
        {process.env.API_KEY && inputValue.trim().length > 5 && (
             <button
             onClick={handleAiSplit}
             disabled={isAiLoading}
             className="bg-purple-100 text-purple-600 p-4 rounded-2xl hover:bg-purple-200 transition-colors disabled:opacity-50"
             title="Use AI to break down this task"
           >
             <IconSparkles className={`w-6 h-6 ${isAiLoading ? 'animate-pulse' : ''}`} />
           </button>
        )}
        <button
          onClick={() => addTask(inputValue)}
          className="bg-primary-500 text-white p-4 rounded-2xl shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-colors"
        >
          <IconPlus className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 landscape:pb-6 space-y-3 relative">
        {activeTasks.length === 0 && (
          <div className="text-center text-slate-400 mt-20">
            <p className="text-lg">All clear! Relax or add a task.</p>
          </div>
        )}
        {sortedActiveTasks.map(task => (
          <div
            key={task.id}
            className={`group flex items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 ${task.completed ? 'opacity-70 bg-slate-50' : 'hover:-translate-y-0.5'}`}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${task.completed ? 'bg-primary-500 border-primary-500' : 'border-slate-300 hover:border-primary-400'}`}
            >
              {task.completed && <IconCheck className="w-4 h-4 text-white" />}
            </button>
            <span className={`flex-1 text-lg font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
              {task.text}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="p-2 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <IconTrash className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Floating Archive Action Button */}
      {completedCount > 0 && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center z-10 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none landscape:bottom-6 landscape:left-24">
            <button 
                onClick={handleArchive}
                className="pointer-events-auto flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl shadow-slate-800/30 hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all"
            >
                <IconArchive className="w-4 h-4" />
                <span className="font-semibold text-sm">Archive Completed</span>
            </button>
        </div>
      )}
    </div>
  );
};

export default TodoList;