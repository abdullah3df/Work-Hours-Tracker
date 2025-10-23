import React, { useState, useEffect, useRef, useMemo } from 'react';
import { formatDuration, formatTime, formatDate } from '../lib/utils.js';
import { ShiftStartIcon, ShiftEndIcon } from './Icons.js';
import useLocalStorage from '../hooks/useLocalStorage.js';

const TimeTracker = ({ addLog, profile, t, showToast, language }) => {
  const [startTimeISO, setStartTimeISO] = useLocalStorage('saati-shift-startTime', null);
  const [notes, setNotes] = useLocalStorage('saati-shift-notes', '');
  const [breakMinutes, setBreakMinutes] = useLocalStorage('saati-shift-breakMinutes', profile.defaultBreakMinutes);
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const intervalRef = useRef(null);

  const isRunning = !!startTimeISO;

  // Derived date/time info
  const dayName = useMemo(() => currentTime.toLocaleDateString(language, { weekday: 'long' }), [currentTime, language]);
  const fullDate = useMemo(() => formatDate(currentTime, language), [currentTime, language]);
  const dayOfWeek = currentTime.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

  // Sync default break minutes from profile when no shift is running
  useEffect(() => {
    if (!isRunning) {
      setBreakMinutes(profile.defaultBreakMinutes);
    }
  }, [profile.defaultBreakMinutes, isRunning, setBreakMinutes]);

  // Timer for elapsed time
  useEffect(() => {
    if (isRunning && startTimeISO) {
      const start = new Date(startTimeISO);
      setElapsedTime(new Date().getTime() - start.getTime());
      
      intervalRef.current = window.setInterval(() => {
        setElapsedTime(new Date().getTime() - start.getTime());
      }, 1000);
    } else {
      setElapsedTime(0);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTimeISO]);

  // Timer for current real-time clock
  useEffect(() => {
    const clockInterval = window.setInterval(() => {
        setCurrentTime(new Date());
    }, 1000);
    return () => window.clearInterval(clockInterval);
  }, []);


  const handleStart = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); 

    if (currentDayOfWeek === 0 || currentDayOfWeek === 6) { // 0:Sun, 6:Sat
        const currentDayName = today.toLocaleDateString(language, { weekday: 'long' });
        const confirmationMessage = t('weekendClockInConfirm').replace('{dayName}', currentDayName);
        if (!window.confirm(confirmationMessage)) {
            return; // User cancelled the action
        }
    }
    setStartTimeISO(new Date().toISOString());
  };

  const handleStop = async () => {
    if (!startTimeISO) return;
    const startTime = new Date(startTimeISO);
    const endTime = new Date();
    
    try {
      await addLog({
        date: startTime.toISOString().split('T')[0],
        type: 'work',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        breakMinutes: Number(breakMinutes) || 0,
        notes,
      });
      showToast(t('shiftSaved'), 'success');
      setStartTimeISO(null);
      setNotes('');
      setBreakMinutes(profile.defaultBreakMinutes);
    } catch(error) {
      console.error("Failed to save shift:", error);
      showToast(t('saveError'), 'error');
    }
  };

  return (
    React.createElement('div', { className: "bg-glass-bg-light dark:bg-glass-bg-dark backdrop-blur-xl border border-glass-border-light dark:border-glass-border-dark p-6 sm:p-8 rounded-2xl shadow-2xl shadow-shadow-color-light dark:shadow-shadow-color-dark w-full max-w-4xl mx-auto transition-all duration-300" },
      React.createElement('div', { className: "flex flex-col sm:flex-row justify-around items-center mb-8 text-center space-y-6 sm:space-y-0" },
        React.createElement('div', null,
          React.createElement('p', { className: "text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" }, t('currentTime')),
          React.createElement('p', { className: "text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent font-mono", suppressHydrationWarning: true }, formatTime(currentTime))
        ),
        React.createElement('div', { className: "w-px h-16 bg-gray-300/50 dark:bg-gray-600/50 hidden sm:block" }),
        React.createElement('div', null,
          React.createElement('p', { className: "text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" }, t('shiftDuration')),
          React.createElement('p', { className: "text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent font-mono" }, formatDuration(elapsedTime))
        )
      ),
      React.createElement('div', { className: "flex flex-col md:flex-row justify-center items-center my-8 gap-4 sm:gap-8" },
        React.createElement('button', {
          onClick: handleStart,
          disabled: isRunning,
          className: `w-40 h-40 md:w-48 md:h-48 rounded-full flex flex-col items-center justify-center transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 
            bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 dark:shadow-emerald-800/30 focus:ring-green-300 dark:focus:ring-green-800 
            disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-500 disabled:dark:bg-gray-600 disabled:dark:from-gray-600 disabled:dark:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none
            ${!isRunning ? 'pulse-glow-start' : ''}`,
          'aria-label': t('clockIn')
        },
          React.createElement(ShiftStartIcon, { className: "w-12 h-12 md:w-14 md:h-14" }),
          React.createElement('span', { className: "text-xl md:text-2xl font-semibold mt-2" }, t('clockIn'))
        ),
        React.createElement('div', { className: "order-first md:order-none flex flex-col items-center justify-center text-center p-4" },
            React.createElement('p', { className: "text-3xl font-bold text-gray-800 dark:text-white" }, dayName),
            React.createElement('p', { className: "text-sm text-gray-500 dark:text-gray-400" }, fullDate),
            isWeekend && !isRunning && (
                React.createElement('div', { className: "mt-4 px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-100 dark:text-amber-200 dark:bg-amber-900/50 rounded-full whitespace-nowrap" },
                    t('weekendWarning')
                )
            )
        ),
        React.createElement('button', {
          onClick: handleStop,
          disabled: !isRunning,
          className: `w-40 h-40 md:w-48 md:h-48 rounded-full flex flex-col items-center justify-center transition-all duration-300 ease-in-out focus:outline-none focus:ring-4
            bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/30 dark:shadow-rose-800/30 focus:ring-red-300 dark:focus:ring-red-800
            disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-500 disabled:dark:bg-gray-600 disabled:dark:from-gray-600 disabled:dark:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none`,
          'aria-label': t('clockOut')
        },
          React.createElement(ShiftEndIcon, { className: "w-12 h-12 md:w-14 md:h-14" }),
          React.createElement('span', { className: "text-xl md:text-2xl font-semibold mt-2" }, t('clockOut'))
        )
      ),
      React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto" },
        React.createElement('div', null,
            React.createElement('label', { htmlFor: "break", className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, t('break')),
            React.createElement('input', {
              type: "number",
              id: "break",
              value: breakMinutes,
              onChange: (e) => setBreakMinutes(parseInt(e.target.value, 10)),
              className: "mt-1 block w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white",
              placeholder: t('break')
            })
        ),
        React.createElement('div', null,
            React.createElement('label', { htmlFor: "notes", className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, t('notes')),
             React.createElement('input', {
              type: "text",
              id: "notes",
              value: notes,
              onChange: (e) => setNotes(e.target.value),
              className: "mt-1 block w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white",
              placeholder: t('notes')
            })
        )
      )
    )
  );
};

export default TimeTracker;
