import React, { useState } from 'react';
import { Idea, PASTEL_COLORS } from '../types';
import { IconPlus, IconSparkles, IconTrash, IconBulb } from './Icons';
import { expandIdea } from '../services/geminiService';
import useLocalStorage from '../hooks/useLocalStorage';

const IdeaBoard: React.FC = () => {
  const [ideas, setIdeas] = useLocalStorage<Idea[]>('mindflow_ideas', []);
  const [inputValue, setInputValue] = useState('');
  const [expandingId, setExpandingId] = useState<string | null>(null);

  const addIdea = () => {
    if (!inputValue.trim()) return;
    const randomColor = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
    const newIdea: Idea = {
      id: Date.now().toString(),
      content: inputValue,
      color: randomColor,
      createdAt: Date.now(),
    };
    setIdeas(prev => [newIdea, ...prev]);
    setInputValue('');
  };

  const deleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
  };

  const handleExpand = async (id: string, currentContent: string) => {
    setExpandingId(id);
    const expansion = await expandIdea(currentContent);
    setExpandingId(null);
    if (expansion) {
      setIdeas(prev => prev.map(i => 
        i.id === id ? { ...i, content: i.content + "\n\n✨ " + expansion } : i
      ));
    }
  };

  return (
    <div className="h-full flex flex-col p-6 pt-10 bg-slate-50/50 landscape:pl-24 landscape:pt-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800">Idea Board</h1>
        <p className="text-slate-500">Capture your thoughts instantly.</p>
      </div>

      <div className="relative mb-8">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full bg-white border-none rounded-3xl p-5 shadow-sm text-lg text-slate-700 resize-none focus:ring-2 focus:ring-primary-200 placeholder:text-slate-300 min-h-[120px]"
        />
        <button
          onClick={addIdea}
          disabled={!inputValue.trim()}
          className="absolute bottom-4 right-4 bg-primary-500 text-white p-3 rounded-xl shadow-md hover:bg-primary-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
        >
          <IconPlus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 landscape:pb-6">
        <div className="columns-2 landscape:columns-3 xl:landscape:columns-4 gap-4 space-y-4">
          {ideas.map(idea => (
            <div
              key={idea.id}
              className={`break-inside-avoid rounded-3xl p-5 ${idea.color} transition-all duration-300 hover:shadow-md relative group`}
            >
              <p className="text-slate-800 font-medium whitespace-pre-wrap text-sm leading-relaxed">{idea.content}</p>
              
              <div className="flex justify-between items-center mt-4 pt-2 border-t border-black/5">
                <span className="text-[10px] text-black/40 font-bold uppercase tracking-wider">
                    {new Date(idea.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                    {process.env.API_KEY && (
                        <button 
                            onClick={() => handleExpand(idea.id, idea.content)}
                            disabled={!!expandingId}
                            className={`p-1.5 bg-white/50 rounded-lg text-indigo-600 hover:bg-white transition-colors ${expandingId === idea.id ? 'animate-pulse' : ''}`}
                        >
                            <IconSparkles className="w-4 h-4" />
                        </button>
                    )}
                    <button 
                        onClick={() => deleteIdea(idea.id)}
                        className="p-1.5 bg-white/50 rounded-lg text-red-500 hover:bg-white transition-colors"
                    >
                        <IconTrash className="w-4 h-4" />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {ideas.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-slate-300">
                <IconBulb className="w-12 h-12 mb-2 opacity-50"/>
                <p>No ideas yet.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default IdeaBoard;