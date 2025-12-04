import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { IconChevronLeft, IconChevronRight, IconClock, IconPlus, IconTrash, IconSparkles } from './Icons';
import { suggestEventTitle } from '../services/geminiService';
import { scheduleNotification, cancelNotification, requestNotificationPermission } from '../services/notificationService';
import useLocalStorage from '../hooks/useLocalStorage';

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useLocalStorage<Record<string, CalendarEvent[]>>('mindflow_events', {});
  const [newEventTitle, setNewEventTitle] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Request notification permissions on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateStr(dateStr);
  };

  const addEvent = async (title: string, dateOverride?: string, timeOverride?: string) => {
    const targetDate = dateOverride || selectedDateStr;
    const eventId = Date.now().toString();
    
    const newEvent: CalendarEvent = {
      id: eventId,
      dateStr: targetDate,
      title: title,
      time: timeOverride,
    };

    setEvents(prev => ({
      ...prev,
      [targetDate]: [...(prev[targetDate] || []), newEvent]
    }));
    setNewEventTitle('');
    
    // Schedule Notification if time exists
    if (timeOverride) {
      await scheduleNotification(
        eventId,
        "MindFlow Reminder",
        title,
        targetDate,
        timeOverride
      );
    }
    
    // Jump to the date of the new event if it's different
    if(dateOverride && dateOverride !== selectedDateStr) {
        setSelectedDateStr(dateOverride);
        const newDateObj = new Date(dateOverride);
        // If the new date is in a different month, switch view
        if(newDateObj.getMonth() !== currentDate.getMonth() || newDateObj.getFullYear() !== currentDate.getFullYear()) {
            setCurrentDate(new Date(newDateObj.getFullYear(), newDateObj.getMonth(), 1));
        }
    }
  };

    const handleAiAdd = async () => {
        if (!newEventTitle.trim()) return;
        setIsAiLoading(true);
        const suggestion = await suggestEventTitle(newEventTitle);
        setIsAiLoading(false);
        addEvent(suggestion.title, suggestion.date || undefined, suggestion.time || undefined);
    };


  const deleteEvent = (dateStr: string, id: string) => {
    // Cancel the notification
    cancelNotification(id);

    setEvents(prev => {
        const newDayEvents = prev[dateStr].filter(e => e.id !== id);
        if (newDayEvents.length === 0) {
            const { [dateStr]: _, ...rest } = prev;
            return rest;
        }
        return { ...prev, [dateStr]: newDayEvents };
    });
  };

  // Generate grid cells
  const blanks = Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`} className="h-10"></div>);
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isSelected = dateStr === selectedDateStr;
    const hasEvents = events[dateStr] && events[dateStr].length > 0;
    const isToday = dateStr === new Date().toISOString().split('T')[0];

    return (
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`relative h-10 w-10 mx-auto flex items-center justify-center rounded-full text-sm font-semibold transition-all
          ${isSelected ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30' : 'text-slate-700 hover:bg-slate-100'}
          ${isToday && !isSelected ? 'text-primary-600 ring-1 ring-primary-300' : ''}
        `}
      >
        {day}
        {hasEvents && !isSelected && (
          <div className="absolute bottom-1 w-1 h-1 bg-primary-500 rounded-full"></div>
        )}
      </button>
    );
  });

  const selectedEvents = events[selectedDateStr] || [];

  return (
    <div className="h-full flex flex-col p-6 pt-10 landscape:pl-24 landscape:pt-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{monthNames[month]} {year}</h1>
        <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"><IconChevronLeft className="w-5 h-5 text-slate-600"/></button>
            <button onClick={handleNextMonth} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"><IconChevronRight className="w-5 h-5 text-slate-600"/></button>
        </div>
      </div>

      <div className="flex flex-col h-full landscape:grid landscape:grid-cols-2 landscape:gap-8">
        
        {/* Left Col (Landscape): Calendar Grid */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-6 landscape:mb-0 landscape:h-fit">
            <div className="grid grid-cols-7 mb-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {['S','M','T','W','T','F','S'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-2">
            {blanks}
            {days}
            </div>
        </div>

        {/* Right Col (Landscape): Selected Day Events */}
        <div className="flex-1 overflow-hidden flex flex-col relative landscape:h-full">
            <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center">
                {new Date(selectedDateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h2>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-40 landscape:pb-24">
                {selectedEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-300 space-y-2">
                        <IconClock className="w-8 h-8 opacity-20" />
                        <span className="text-sm">No events planned</span>
                    </div>
                ) : (
                    selectedEvents
                    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                    .map(evt => (
                        <div key={evt.id} className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-transform active:scale-[0.98]">
                            <div className={`h-12 w-12 rounded-2xl flex flex-col items-center justify-center mr-4 ${evt.time ? 'bg-primary-50 text-primary-600' : 'bg-slate-50 text-slate-400'}`}>
                                {evt.time ? (
                                    <>
                                        <span className="text-xs font-bold leading-none">{evt.time.split(':')[0]}</span>
                                        <span className="text-[10px] opacity-70 leading-none">{evt.time.split(':')[1]}</span>
                                    </>
                                ) : (
                                    <IconClock className="w-5 h-5" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 text-base truncate">{evt.title}</p>
                                {evt.time && <p className="text-xs text-primary-500 font-semibold mt-0.5">Scheduled</p>}
                            </div>
                            <button onClick={() => deleteEvent(selectedDateStr, evt.id)} className="text-slate-300 hover:text-red-400 p-2 transition-colors">
                                <IconTrash className="w-4 h-4"/>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Add Event Input */}
            <div className="absolute bottom-20 left-0 right-0 z-10 landscape:bottom-0">
                <div className="flex gap-2 p-1">
                    <input 
                        type="text" 
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (process.env.API_KEY ? handleAiAdd() : addEvent(newEventTitle))}
                        placeholder={process.env.API_KEY ? "Ex: Hike tomorrow at 6am..." : "New Event..."}
                        className="flex-1 bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-700 placeholder:text-slate-400"
                    />
                    {process.env.API_KEY ? (
                        <button 
                            onClick={handleAiAdd} 
                            disabled={isAiLoading || !newEventTitle.trim()} 
                            className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-14 rounded-2xl shadow-xl shadow-indigo-500/30 flex items-center justify-center disabled:opacity-70 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
                        >
                            {isAiLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <IconSparkles className="w-6 h-6"/>}
                        </button>
                    ) : (
                        <button onClick={() => addEvent(newEventTitle)} className="bg-primary-500 text-white w-14 rounded-2xl shadow-xl shadow-primary-500/30 flex items-center justify-center">
                            <IconPlus className="w-6 h-6"/>
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;