import React, { useMemo, useRef, useState, useEffect } from 'react';
import { calculateDuration, calculateOvertime, formatDate, formatDuration, formatTime } from '../lib/utils.js';
import { PdfFileIcon, ImageIcon } from './Icons.js';

// Make jspdf and html2canvas available from the global scope

const getRowClass = (type) => {
  switch (type) {
    case 'sickLeave':
      return 'bg-amber-50 dark:bg-amber-900/30';
    case 'vacation':
      return 'bg-sky-50 dark:bg-sky-900/30';
    case 'officialHoliday':
      return 'bg-purple-50 dark:bg-purple-900/30';
    case 'work':
    default:
      return 'bg-white dark:bg-gray-800';
  }
};

const getTypeBadgeClass = (type) => {
    switch (type) {
        case 'sickLeave':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-200';
        case 'vacation':
            return 'bg-sky-100 text-sky-800 dark:bg-sky-900/70 dark:text-sky-200';
        case 'officialHoliday':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/70 dark:text-purple-200';
        case 'work':
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const ReportModal = ({ isOpen, onClose, logs, profile, t, language, user }) => {
  const reportContentRef = useRef(null);
  const [period, setPeriod] = useState('thisMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const toISODateString = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    if (period === 'custom' && !customStartDate && !customEndDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      setCustomStartDate(toISODateString(thirtyDaysAgo));
      setCustomEndDate(toISODateString(today));
    }
  }, [period, customStartDate, customEndDate]);

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    switch (period) {
      case 'today': {
        const todayStr = toISODateString(now);
        return { startDate: todayStr, endDate: todayStr };
      }
      case 'thisWeek': {
        const currentDay = now.getDay(); // 0 is Sunday
        const firstDayOfWeek = language === 'ar' ? 6 : 1; // Assuming week starts Saturday for AR, Monday otherwise
        let firstDay = new Date(now.setDate(now.getDate() - currentDay + (currentDay === 0 ? -6 : firstDayOfWeek) ));
        if (language === 'ar' && currentDay < 6) { // if today is before saturday
          firstDay.setDate(firstDay.getDate() - 7);
        }
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);
        return { startDate: toISODateString(firstDay), endDate: toISODateString(lastDay) };
      }
      case 'thisMonth': {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { startDate: toISODateString(firstDay), endDate: toISODateString(lastDay) };
      }
      case 'thisYear': {
        const firstDay = new Date(now.getFullYear(), 0, 1);
        const lastDay = new Date(now.getFullYear(), 11, 31);
        return { startDate: toISODateString(firstDay), endDate: toISODateString(lastDay) };
      }
      case 'custom': {
        return { startDate: customStartDate, endDate: customEndDate };
      }
      default:
        return { startDate: '', endDate: '' };
    }
  }, [period, customStartDate, customEndDate, language]);

  const filteredLogs = useMemo(() => {
    if (!startDate || !endDate) {
      return [];
    }
    return [...logs]
      .filter(log => log.date >= startDate && log.date <= endDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [logs, startDate, endDate]);

  const reportData = useMemo(() => {
    let totalWorkMs = 0;
    let totalOvertimeMs = 0;
    let sickDays = 0;
    let officialHolidayDays = 0;
    const workDates = new Set();

    filteredLogs.forEach(log => {
      if (log.type === 'work') {
        workDates.add(log.date);
        const duration = calculateDuration(log);
        if (duration > 0) {
          totalWorkMs += duration;
          totalOvertimeMs += calculateOvertime(duration, profile);
        }
      } else if (log.type === 'sickLeave') {
        sickDays++;
      } else if (log.type === 'officialHoliday') {
        officialHolidayDays++;
      }
    });
    
    const totalWorkDays = workDates.size;

    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    const startDt = parseDate(startDate);
    const endDt = parseDate(endDate);

    let targetWorkMs = 0;
    const officialHolidaysSet = new Set((profile.officialHolidays || []).map(h => h.date));
    
    if (startDt && endDt && profile.workDaysPerWeek > 0 && profile.workHoursPerDay > 0) {
        let workDaysInRange = 0;
        const current = new Date(startDt);
        while (current <= endDt) {
            const dayOfWeek = current.getDay();
            const currentDateStr = toISODateString(new Date(current.getTime() - current.getTimezoneOffset() * 60000));
            const isOfficialHoliday = officialHolidaysSet.has(currentDateStr);

            if (!isOfficialHoliday) {
                if (profile.workDaysPerWeek >= 7) {
                    workDaysInRange++;
                } else if (profile.workDaysPerWeek === 6) { // Assumes Fri is weekend
                    if (dayOfWeek !== 5) workDaysInRange++;
                } else { // Assumes 5 day work week, Sat/Sun is weekend
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) workDaysInRange++;
                }
            }
            current.setDate(current.getDate() + 1);
        }
        targetWorkMs = workDaysInRange * profile.workHoursPerDay * 60 * 60 * 1000;
    }
    
    const currentYear = new Date().getFullYear();
    const usedAnnualVacationDays = logs.reduce((count, log) => {
      const [year, month, day] = log.date.split('-').map(Number);
      const logDate = new Date(Date.UTC(year, month - 1, day));
      
      if (log.type === 'vacation' && logDate.getUTCFullYear() === currentYear) {
        const dayOfWeek = logDate.getUTCDay(); // 0 = Sunday, 6 = Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isOfficialHoliday = officialHolidaysSet.has(log.date);

        if (!isWeekend && !isOfficialHoliday) {
          return count + 1;
        }
      }
      return count;
    }, 0);

    const remainingVacationDays = (profile.annualVacationDays || 0) - usedAnnualVacationDays;

    return {
      totalWorkMs,
      totalOvertimeMs,
      sickDays,
      officialHolidayDays,
      totalWorkDays,
      targetWorkMs,
      remainingVacationDays,
    };
  }, [filteredLogs, profile, startDate, endDate, logs]);

  const handleDownload = async (type) => {
    const element = reportContentRef.current;
    if (!element) return;
    
    // Temporarily set theme to light for consistent export appearance
    const root = document.documentElement;
    const originalTheme = root.classList.contains('dark') ? 'dark' : 'light';
    root.classList.remove('dark');

    await new Promise(resolve => setTimeout(resolve, 100)); // allow time for re-render

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f0f4f8', // Light theme bg color
    });

    const imgData = canvas.toDataURL('image/png');

    if (type === 'image') {
      const link = document.createElement('a');
      link.download = `Saati-Report-${startDate}-to-${endDate}.png`;
      link.href = imgData;
      link.click();
    } else {
      const { jsPDF } = jspdf;
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Saati-Report-${startDate}-to-${endDate}.pdf`);
    }

     // Restore original theme
    if (originalTheme === 'dark') {
      root.classList.add('dark');
    }
  };

  if (!isOpen) return null;

  const userName = user ? user.displayName || user.email : t('guest');

  return (
    React.createElement('div', { className: "fixed inset-0 bg-black/50 flex justify-center items-center z-[10001] p-4" },
      React.createElement('div', { className: "bg-glass-bg-light dark:bg-glass-bg-dark backdrop-blur-xl border border-glass-border-light dark:border-glass-border-dark rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]" },
        React.createElement('div', { className: "p-6 border-b border-gray-900/10 dark:border-white/10 flex justify-between items-center" },
          React.createElement('h2', { className: "text-2xl font-bold text-gray-800 dark:text-white" }, t('workReport')),
          React.createElement('div', { className: "flex items-center gap-2" },
            React.createElement('button', {
                onClick: () => handleDownload('image'),
                className: "inline-flex items-center justify-center p-2 border border-gray-300/80 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700/80 dark:text-white dark:border-gray-600/80 dark:hover:bg-gray-700",
                title: t('downloadImage')
              },
                React.createElement(ImageIcon, { className: "w-5 h-5"})
              ),
            React.createElement('button', {
              onClick: () => handleDownload('pdf'),
              className: "inline-flex items-center justify-center p-2 border border-gray-300/80 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700/80 dark:text-white dark:border-gray-600/80 dark:hover:bg-gray-700",
              title: t('downloadPDF')
            },
              React.createElement(PdfFileIcon, { className: "w-5 h-5" })
            )
          )
        ),
        
        React.createElement('div', { className: "p-6 bg-black/5 dark:bg-black/10" },
          React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" },
            React.createElement('select', {
              value: period,
              onChange: (e) => setPeriod(e.target.value),
              className: "w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:placeholder-gray-400 dark:text-white"
            },
              React.createElement('option', { value: "today" }, t('today')),
              React.createElement('option', { value: "thisWeek" }, t('thisWeek')),
              React.createElement('option', { value: "thisMonth" }, t('thisMonth')),
              React.createElement('option', { value: "thisYear" }, t('thisYear')),
              React.createElement('option', { value: "custom" }, t('customRange'))
            ),
            period === 'custom' && (
              React.createElement(React.Fragment, null,
                React.createElement('input', {
                  type: "date",
                  value: customStartDate,
                  onChange: (e) => setCustomStartDate(e.target.value),
                  className: "w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:text-white"
                }),
                React.createElement('input', {
                  type: "date",
                  value: customEndDate,
                  onChange: (e) => setCustomEndDate(e.target.value),
                  className: "w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:text-white"
                })
              )
            )
          )
        ),

        React.createElement('div', { className: "p-6 flex-grow overflow-auto report-table" },
          React.createElement('div', { ref: reportContentRef, className: "p-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-md" },
            React.createElement('div', { className: "text-center mb-8" },
              React.createElement('h1', { className: "text-3xl font-bold text-indigo-600 dark:text-indigo-400 font-cairo" }, t('saati')),
              React.createElement('p', { className: "text-lg font-semibold" }, t('workReport'))
            ),
            React.createElement('div', { className: "grid grid-cols-2 gap-x-8 gap-y-4 mb-8 text-sm border-y border-gray-200 dark:border-gray-700 py-4" },
                React.createElement('div', null, React.createElement('span', { className: "font-semibold" }, t('reportFor'), ":"), " ", userName),
                React.createElement('div', null, React.createElement('span', { className: "font-semibold" }, t('dateRange'), ":"), " ", startDate, " - ", endDate),
                React.createElement('div', null, React.createElement('span', { className: "font-semibold" }, t('reportPeriod'), ":"), " ", t(period)),
                React.createElement('div', null, React.createElement('span', { className: "font-semibold" }, t('dateGenerated'), ":"), " ", formatDate(new Date(), language))
            ),
            React.createElement('div', { className: "mb-8" },
                React.createElement('h3', { className: "text-xl font-semibold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2" }, t('summary')),
                React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-center" },
                  React.createElement('div', { className: "bg-black/5 dark:bg-white/5 p-4 rounded-lg" },
                    React.createElement('h4', { className: "text-sm font-medium text-gray-500 dark:text-gray-400" }, t('totalWorkHours')),
                    React.createElement('p', { className: "text-2xl font-bold font-mono text-gray-800 dark:text-white" }, formatDuration(reportData.totalWorkMs))
                  ),
                  React.createElement('div', { className: "bg-black/5 dark:bg-white/5 p-4 rounded-lg" },
                    React.createElement('h4', { className: "text-sm font-medium text-gray-500 dark:text-gray-400" }, t('targetWorkHours')),
                    React.createElement('p', { className: "text-2xl font-bold font-mono text-gray-800 dark:text-white" }, formatDuration(reportData.targetWorkMs))
                  ),
                  React.createElement('div', { className: "bg-black/5 dark:bg-white/5 p-4 rounded-lg" },
                    React.createElement('h4', { className: "text-sm font-medium text-gray-500 dark:text-gray-400" }, t('totalOvertime')),
                    React.createElement('p', { className: "text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400" }, formatDuration(reportData.totalOvertimeMs))
                  ),
                   React.createElement('div', { className: "bg-black/5 dark:bg-white/5 p-4 rounded-lg" },
                    React.createElement('h4', { className: "text-sm font-medium text-gray-500 dark:text-gray-400" }, t('totalWorkDays')),
                    React.createElement('p', { className: "text-2xl font-bold font-mono text-gray-800 dark:text-white" }, reportData.totalWorkDays)
                  ),
                  React.createElement('div', { className: "bg-black/5 dark:bg-white/5 p-4 rounded-lg" },
                    React.createElement('h4', { className: "text-sm font-medium text-gray-500 dark:text-gray-400" }, t('totalSickDays')),
                    React.createElement('p', { className: "text-2xl font-bold font-mono text-gray-800 dark:text-white" }, reportData.sickDays)
                  ),
                   React.createElement('div', { className: "bg-black/5 dark:bg-white/5 p-4 rounded-lg" },
                    React.createElement('h4', { className: "text-sm font-medium text-gray-500 dark:text-gray-400" }, t('totalOfficialHolidays')),
                    React.createElement('p', { className: "text-2xl font-bold font-mono text-gray-800 dark:text-white" }, reportData.officialHolidayDays)
                  ),
                  React.createElement('div', { className: "bg-black/5 dark:bg-white/5 p-4 rounded-lg md:col-span-2" },
                    React.createElement('h4', { className: "text-sm font-medium text-gray-500 dark:text-gray-400" }, t('remainingVacationDays')),
                    React.createElement('p', { className: "text-2xl font-bold font-mono text-gray-800 dark:text-white" }, reportData.remainingVacationDays, " / ", profile.annualVacationDays || 0)
                  )
                )
            ),
            React.createElement('div', null,
              React.createElement('h3', { className: "text-xl font-semibold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2" }, t('logHistory')),
              filteredLogs.length > 0 ? (
                React.createElement('table', { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700" },
                  React.createElement('thead', { className: "bg-gray-50 dark:bg-gray-700" },
                    React.createElement('tr', null,
                      React.createElement('th', { scope: "col", className: "px-4 py-3 text-start text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider" }, t('date')),
                      React.createElement('th', { scope: "col", className: "px-4 py-3 text-start text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider" }, t('entryType')),
                      React.createElement('th', { scope: "col", className: "px-4 py-3 text-start text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider" }, t('startTime')),
                      React.createElement('th', { scope: "col", className: "px-4 py-3 text-start text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider" }, t('endTime')),
                      React.createElement('th', { scope: "col", className: "px-4 py-3 text-start text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider" }, t('duration')),
                      React.createElement('th', { scope: "col", className: "px-4 py-3 text-start text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider" }, t('overtime'))
                    )
                  ),
                  React.createElement('tbody', { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" },
                    filteredLogs.map(log => {
                      const durationMs = calculateDuration(log);
                      const overtimeMs = calculateOvertime(durationMs, profile);
                      return (
                        React.createElement('tr', { key: log.id, className: getRowClass(log.type) },
                          React.createElement('td', { className: "px-4 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200" }, formatDate(new Date(log.date), language)),
                          React.createElement('td', { className: "px-4 py-4 whitespace-nowrap text-sm" },
                            React.createElement('span', { className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClass(log.type)}` },
                              t(log.type)
                            )
                          ),
                          React.createElement('td', { className: "px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono" }, log.startTime ? formatTime(new Date(log.startTime), language) : '—'),
                          React.createElement('td', { className: "px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono" }, log.endTime ? formatTime(new Date(log.endTime), language) : '—'),
                          React.createElement('td', { className: "px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono" }, log.type === 'work' ? formatDuration(durationMs) : '—'),
                          React.createElement('td', { className: "px-4 py-4 whitespace-nowrap text-sm font-mono", style: {color: overtimeMs > 0 ? '#10B981' : 'inherit'} }, log.type === 'work' ? formatDuration(overtimeMs) : '—')
                        )
                      );
                    })
                  )
                )
              ) : (
                React.createElement('p', { className: "text-center text-gray-500 dark:text-gray-400 py-8" }, t('noLogsToReport'))
              )
            )
          )
        ),

        React.createElement('div', { className: "px-6 py-4 bg-black/5 dark:bg-black/10 rounded-b-xl flex justify-end" },
          React.createElement('button', {
            type: "button",
            onClick: onClose,
            className: "py-2 px-4 border border-gray-300/80 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700/80 dark:text-white dark:border-gray-600/80 dark:hover:bg-gray-700"
          },
            t('close')
          )
        )
      )
    )
  );
};

export default ReportModal;