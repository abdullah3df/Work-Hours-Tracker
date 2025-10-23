import React, { useState, useMemo } from 'react';
import { calculateDuration, calculateOvertime, formatDate, formatDuration, formatTime } from '../lib/utils.js';
import { AddIcon, EditIcon, DeleteIcon, DocumentTextIcon } from './Icons.js';

const getRowClass = (type) => {
  switch (type) {
    case 'sickLeave':
      return 'bg-amber-50/50 dark:bg-amber-900/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/30 transition-colors';
    case 'vacation':
      return 'bg-sky-50/50 dark:bg-sky-900/20 hover:bg-sky-100/60 dark:hover:bg-sky-900/30 transition-colors';
    case 'officialHoliday':
      return 'bg-purple-50/50 dark:bg-purple-900/20 hover:bg-purple-100/60 dark:hover:bg-purple-900/30 transition-colors';
    case 'work':
    default:
      return 'hover:bg-black/5 dark:hover:bg-white/5 transition-colors';
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

const LogManager = ({
  logs,
  profile,
  onAdd,
  onEdit,
  onDelete,
  onGenerateReport,
  t,
  language,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('work');
  const [logToDelete, setLogToDelete] = useState(null);

  const filteredLogs = useMemo(() => {
    return [...logs]
      .filter(log => {
        const matchesType = log.type === filterType;
        const matchesSearch =
          searchQuery.trim() === '' ||
          log.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, searchQuery, filterType]);

  const handleDeleteClick = (log) => {
    setLogToDelete(log);
  };

  const handleConfirmDelete = async () => {
    if (logToDelete) {
      try {
        await onDelete(logToDelete.id);
        showToast(t('deleteSuccess'), 'success');
      } catch (error) {
        console.error("Failed to delete entry:", error);
        showToast(t('deleteError'), 'error');
      } finally {
        setLogToDelete(null);
      }
    }
  };

  const filterButtons = [
    { value: 'work', label: t('work') },
    { value: 'sickLeave', label: t('sickLeave') },
    { value: 'vacation', label: t('vacation') },
    { value: 'officialHoliday', label: t('officialHoliday') },
  ];

  return (
    React.createElement(React.Fragment, null,
      React.createElement('div', { className: "bg-glass-bg-light dark:bg-glass-bg-dark backdrop-blur-xl border border-glass-border-light dark:border-glass-border-dark p-6 sm:p-8 rounded-2xl shadow-2xl shadow-shadow-color-light dark:shadow-shadow-color-dark w-full h-full flex flex-col" },
        React.createElement('div', { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4" },
          React.createElement('h2', { className: "text-2xl font-bold text-gray-800 dark:text-white" }, t('logHistory')),
          React.createElement('div', { className: "flex items-center gap-2 flex-wrap" },
            React.createElement('button', {
              onClick: () => onAdd(filterType),
              className: "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            },
              React.createElement(AddIcon, { className: "w-5 h-5 me-2" }),
              t('addManualEntry')
            ),
            React.createElement('button', {
              onClick: onGenerateReport,
              disabled: logs.length === 0,
              className: "inline-flex items-center justify-center px-4 py-2 border border-gray-300/80 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700/80 dark:text-white dark:border-gray-600/80 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            },
              React.createElement(DocumentTextIcon, { className: "w-5 h-5 me-2" }),
              t('generateReport')
            )
          )
        ),
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-5 gap-4 mb-4" },
          React.createElement('input', {
            type: "text",
            placeholder: t('searchNotes'),
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:placeholder-gray-400 dark:text-white md:col-span-2"
          }),
          React.createElement('div', { className: "flex items-center gap-1 bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-1 md:col-span-3" },
            filterButtons.map(btn => (
                React.createElement('button', {
                    key: btn.value,
                    onClick: () => setFilterType(btn.value),
                    className: `flex-1 text-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterType === btn.value ? 'bg-indigo-600 text-white shadow' : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'}`
                },
                    btn.label
                )
            ))
          )
        ),
        React.createElement('div', { className: "flex-grow overflow-auto border border-gray-200/50 dark:border-gray-700/50 rounded-lg" },
          React.createElement('div', { className: "min-w-full align-middle" },
            React.createElement('table', { className: "min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50" },
              React.createElement('thead', { className: "bg-black/5 dark:bg-white/5 sticky top-0 backdrop-blur-sm" },
                React.createElement('tr', null,
                  React.createElement('th', { scope: "col", className: "px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider" }, t('date')),
                  React.createElement('th', { scope: "col", className: "px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider" }, t('type')),
                  React.createElement('th', { scope: "col", className: "px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell" }, t('startTime')),
                  React.createElement('th', { scope: "col", className: "px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell" }, t('endTime')),
                  React.createElement('th', { scope: "col", className: "px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider" }, t('duration')),
                  React.createElement('th', { scope: "col", className: "px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell" }, t('overtime')),
                  React.createElement('th', { scope: "col", className: "px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider" }, t('actions'))
                )
              ),
              React.createElement('tbody', { className: "divide-y divide-gray-200/50 dark:divide-gray-700/50" },
                filteredLogs.length > 0 ? (
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
                        React.createElement('td', { className: "px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono hidden md:table-cell" }, log.startTime ? formatTime(new Date(log.startTime), language) : '—'),
                        React.createElement('td', { className: "px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono hidden md:table-cell" }, log.endTime ? formatTime(new Date(log.endTime), language) : '—'),
                        React.createElement('td', { className: "px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono" }, log.type === 'work' ? formatDuration(durationMs) : '—'),
                        React.createElement('td', { className: "px-4 py-4 whitespace-nowrap text-sm font-mono hidden lg:table-cell", style: {color: overtimeMs > 0 ? '#10B981' : 'inherit'} }, log.type === 'work' ? formatDuration(overtimeMs) : '—'),
                        React.createElement('td', { className: "px-4 py-4 whitespace-nowrap text-sm font-medium" },
                          React.createElement('div', { className: "flex items-center space-x-2 rtl:space-x-reverse" },
                            React.createElement('button', { onClick: () => onEdit(log), className: "p-1 rounded-md text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-200/50 dark:hover:bg-gray-600/50", title: t('edit') },
                              React.createElement(EditIcon, { className: "w-5 h-5" })
                            ),
                            React.createElement('button', { onClick: () => handleDeleteClick(log), className: "p-1 rounded-md text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200/50 dark:hover:bg-gray-600/50", title: t('delete') },
                              React.createElement(DeleteIcon, { className: "w-5 h-5" })
                            )
                          )
                        )
                      )
                    );
                  })
                ) : (
                  React.createElement('tr', null,
                    React.createElement('td', { colSpan: 7, className: "px-4 py-8 text-center text-gray-500 dark:text-gray-400" },
                      logs.length === 0 ? t('noLogs') : t('noMatchingLogs')
                    )
                  )
                )
              )
            )
          )
        )
      ),

      logToDelete && (
        React.createElement('div', { className: "fixed inset-0 bg-black/50 flex justify-center items-center z-[10001] p-4" },
          React.createElement('div', { className: "bg-glass-bg-light dark:bg-glass-bg-dark backdrop-blur-xl border border-glass-border-light dark:border-glass-border-dark rounded-xl shadow-2xl w-full max-w-sm" },
            React.createElement('div', { className: "p-6 text-center" },
              React.createElement('h3', { className: "text-lg font-bold text-gray-800 dark:text-white mb-2" }, t('deleteEntry')),
              React.createElement('p', { className: "text-sm text-gray-600 dark:text-gray-400 mb-6" }, t('confirmDelete')),
              React.createElement('div', { className: "flex justify-center space-x-4 rtl:space-x-reverse" },
                React.createElement('button', {
                  onClick: () => setLogToDelete(null),
                  className: "py-2 px-4 border border-gray-300/80 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700/80 dark:text-white dark:border-gray-600/80 dark:hover:bg-gray-700"
                },
                  t('cancel')
                ),
                React.createElement('button', {
                  onClick: handleConfirmDelete,
                  className: "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                },
                  t('delete')
                )
              )
            )
          )
        )
      )
    )
  );
};

export default LogManager;
