import React, { useState, useMemo } from 'react';
import { SparklesIcon } from './Icons.js';
import { calculateDuration } from '../lib/utils.js';
import { GoogleGenAI } from '@google/genai';

// Make marked available from the global scope

const AIInsights = ({ logs, profile, t, language }) => {
  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const MIN_WORK_DAYS = 5;

  const { last30DaysLogs, hasEnoughData } = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const workLogDates = new Set();
    logs.forEach(log => {
      if (log.date >= thirtyDaysAgoStr && log.type === 'work') {
        workLogDates.add(log.date);
      }
    });

    return {
      last30DaysLogs: logs.filter(log => log.date >= thirtyDaysAgoStr),
      hasEnoughData: workLogDates.size >= MIN_WORK_DAYS,
    };
  }, [logs]);


  const handleGenerateInsights = async () => {
    if (!hasEnoughData) return;

    setIsLoading(true);
    setError('');
    setInsights('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const workLogs = last30DaysLogs.filter(l => l.type === 'work');
      const totalWorkMs = workLogs.reduce((acc, log) => acc + calculateDuration(log), 0);
      const totalWorkDays = new Set(workLogs.map(log => log.date)).size;
      const avgWorkMs = totalWorkDays > 0 ? totalWorkMs / totalWorkDays : 0;
      const totalOvertimeMs = workLogs.reduce((acc, log) => {
          const duration = calculateDuration(log);
          const dailyTarget = profile.workHoursPerDay * 3600 * 1000;
          if (duration > dailyTarget) {
              return acc + (duration - dailyTarget);
          }
          return acc;
      }, 0);
      
      const sickDays = last30DaysLogs.filter(l => l.type === 'sickLeave').length;
      const vacationDays = last30DaysLogs.filter(l => l.type === 'vacation').length;

      const langName = { 'en': 'English', 'ar': 'Arabic', 'de': 'German' }[language] || 'English';

      const systemInstruction = t('aiSystemInstruction', { language: langName });
      const userPrompt = t('aiUserPrompt', {
        totalWorkDays: totalWorkDays,
        avgWorkHours: (avgWorkMs / 3600000).toFixed(1),
        totalOvertime: (totalOvertimeMs / 3600000).toFixed(1),
        sickDays,
        vacationDays,
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });
      
      const generatedText = response.text;
      setInsights(generatedText);

    } catch (err) {
      console.error('Error generating AI insights:', err);
      setError(t('aiPromptError'));
    } finally {
      setIsLoading(false);
    }
  };

  const formattedInsights = useMemo(() => {
    if (!insights) return '';
    if (typeof marked === 'function') {
      return marked.parse(insights);
    }
    return insights.replace(/\n/g, '<br />'); // Fallback
  }, [insights]);
  

  return (
    React.createElement('div', { className: "bg-glass-bg-light dark:bg-glass-bg-dark backdrop-blur-xl border border-glass-border-light dark:border-glass-border-dark p-6 sm:p-8 rounded-2xl shadow-2xl shadow-shadow-color-light dark:shadow-shadow-color-dark w-full h-full flex flex-col min-h-[300px]" },
      React.createElement('h2', { className: "text-2xl font-bold text-gray-800 dark:text-white mb-4" }, t('aiInsights')),
      
      React.createElement('div', { className: "flex-grow flex flex-col justify-center items-center" },
        isLoading ? (
          React.createElement('div', { className: "text-center" },
            React.createElement(SparklesIcon, { className: "w-10 h-10 text-indigo-500 animate-pulse mx-auto" }),
            React.createElement('p', { className: "mt-2 text-gray-600 dark:text-gray-400" }, t('generating'))
          )
        ) : insights ? (
          React.createElement('div', { 
            className: "prose prose-sm dark:prose-invert max-w-none w-full text-gray-700 dark:text-gray-300",
            dangerouslySetInnerHTML: { __html: formattedInsights }
          })
        ) : (
          React.createElement('div', { className: "text-center text-gray-500 dark:text-gray-400" },
            !hasEnoughData && React.createElement('p', { className: "mb-4" }, t('aiPromptInsufficientData')),
             error && React.createElement('p', { className: "text-red-500 mb-4" }, error)
          )
        )
      ),

      React.createElement('div', { className: "mt-6" },
        React.createElement('button', {
          onClick: handleGenerateInsights,
          disabled: !hasEnoughData || isLoading,
          className: "w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-lg shadow-indigo-500/30 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        },
          React.createElement(SparklesIcon, { className: "w-5 h-5 me-2" }),
          t('generateInsights')
        )
      )
    )
  );
};

export default AIInsights;