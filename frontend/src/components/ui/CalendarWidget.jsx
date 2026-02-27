import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

export function CalendarWidget({ events = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Create an array of days to render
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null); // Empty slots before the 1st
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Helper to check if a day has events
  const hasEventDay = (day) => {
    if (!day) return false;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.some(e => e.date === dateStr);
  };

  // Helper to check if a day is exactly today
  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
  };

  return (
    <Card className="flex flex-col h-full" style={{ backgroundColor: 'var(--card)' }}>
      <CardHeader className="pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center w-full">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <CalendarIcon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            Schedule
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-1 rounded-md transition-colors hover:bg-[var(--bg-secondary)]"
              style={{ color: 'var(--text-muted)' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold w-24 text-center" style={{ color: 'var(--text-primary)' }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded-md transition-colors hover:bg-[var(--bg-secondary)]"
              style={{ color: 'var(--text-muted)' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-xs font-semibold uppercase tracking-wider py-1" style={{ color: 'var(--text-muted)' }}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const today = isToday(day);
            const hasEvent = hasEventDay(day);

            return (
              <div
                key={idx}
                className={`
                  relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all
                  ${day ? 'hover:bg-[var(--bg-secondary)] cursor-pointer' : ''}
                  ${today ? 'bg-[var(--primary)] text-white font-bold hover:bg-[var(--primary-hover)] shadow-sm' : ''}
                  ${hasEvent && !today ? 'font-bold bg-[var(--primary-muted)] border border-[var(--primary-light)]' : ''}
                `}
                style={!today && !hasEvent ? { color: 'var(--text-secondary)' } : {}}
              >
                {day}
                {hasEvent && !today && (
                  <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[var(--primary)] shadow-sm" />
                )}
                {hasEvent && today && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
