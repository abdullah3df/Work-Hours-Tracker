import React, { useState, useEffect } from 'react';

const LogFormModal = ({ isOpen, onClose, onSave, logToEdit, t, showToast, defaultType }) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [notes, setNotes] = useState('');
  const [type, setType] = useState('work');

  useEffect(() => {
    if (logToEdit) {
        setType(logToEdit.type);
        const logDate = new Date(logToEdit.date);
        // Adjust for timezone offset when parsing date string
        logDate.setMinutes(logDate.getMinutes() + logDate.getTimezoneOffset());
        setDate(logDate.toISOString().split('T')[0]);
        
        setStartTime(logToEdit.startTime ? new Date(logToEdit.startTime).toTimeString().split(' ')[0].substring(0, 5) : '');
        setEndTime(logToEdit.endTime ? new Date(logToEdit.endTime).toTimeString().split(' ')[0].substring(0, 5) : '');
        
        setBreakMinutes(logToEdit.breakMinutes);
        setNotes(logToEdit.notes);

    } else {
        // Reset form for new entry
        const now = new Date();
        setDate(now.toISOString().split('T')[0]);
        setStartTime('');
        setEndTime('');
        setBreakMinutes(30);
        setNotes('');
        setType(defaultType || 'work');
    }
  }, [logToEdit, isOpen, defaultType]);

  const handleSave = async (e) => {
    e.preventDefault();
    const isWorkEntry = type === 'work';

    if (!date || (isWorkEntry && !startTime)) {
        alert('Date and Start Time are required for work entries.');
        return;
    }

    const startISO = isWorkEntry && startTime ? new Date(`${date}T${startTime}`).toISOString() : null;
    const endISO = isWorkEntry && endTime ? new Date(`${date}T${endTime}`).toISOString() : null;
    
    if (isWorkEntry && endISO && new Date(endISO) <= new Date(startISO)) {
        alert('End Time must be after Start Time.');
        return;
    }

    const logData = {
        date,
        type,
        startTime: startISO,
        endTime: endISO,
        breakMinutes: isWorkEntry ? (Number(breakMinutes) || 0) : 0,
        notes,
    };

    try {
      if (logToEdit) {
          await onSave({ ...logData, id: logToEdit.id });
      } else {
          await onSave(logData);
      }
      showToast(t('saveSuccess'), 'success');
      onClose();
    } catch(error) {
       console.error("Failed to save log entry:", error);
       showToast(t('saveError'), 'error');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    React.createElement('div', { className: "fixed inset-0 bg-black/50 flex justify-center items-center z-[10001] p-4" },
      React.createElement('div', { className: "bg-glass-bg-light dark:bg-glass-bg-dark backdrop-blur-xl border border-glass-border-light dark:border-glass-border-dark rounded-xl shadow-2xl w-full max-w-md" },
        React.createElement('form', { onSubmit: handleSave },
            React.createElement('div', { className: "p-6" },
              React.createElement('h2', { className: "text-2xl font-bold text-gray-800 dark:text-white mb-6" },
                logToEdit ? t('editEntry') : t('addManualEntry')
              ),
              React.createElement('div', { className: "space-y-4" },
                React.createElement('div', null,
                  React.createElement('label', { htmlFor: "logType", className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, t('entryType')),
                  React.createElement('select', {
                    id: "logType",
                    value: type,
                    onChange: (e) => setType(e.target.value),
                    className: "mt-1 block w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white"
                  },
                    React.createElement('option', { value: "work" }, t('work')),
                    React.createElement('option', { value: "sickLeave" }, t('sickLeave')),
                    React.createElement('option', { value: "vacation" }, t('vacation')),
                    React.createElement('option', { value: "officialHoliday" }, t('officialHoliday'))
                  )
                ),
                React.createElement('div', null,
                  React.createElement('label', { htmlFor: "logDate", className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, t('date')),
                  React.createElement('input', {
                    type: "date",
                    id: "logDate",
                    value: date,
                    onChange: (e) => setDate(e.target.value),
                    required: true,
                    className: "mt-1 block w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white"
                  })
                ),
                type === 'work' && (
                  React.createElement(React.Fragment, null,
                    React.createElement('div', { className: "grid grid-cols-2 gap-4" },
                        React.createElement('div', null,
                          React.createElement('label', { htmlFor: "startTime", className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, t('startTime')),
                          React.createElement('input', {
                            type: "time",
                            id: "startTime",
                            value: startTime,
                            onChange: (e) => setStartTime(e.target.value),
                            required: true,
                            className: "mt-1 block w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white"
                          })
                        ),
                        React.createElement('div', null,
                          React.createElement('label', { htmlFor: "endTime", className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, t('endTime')),
                          React.createElement('input', {
                            type: "time",
                            id: "endTime",
                            value: endTime,
                            onChange: (e) => setEndTime(e.target.value),
                            className: "mt-1 block w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white"
                          })
                        )
                    ),
                     React.createElement('div', null,
                      React.createElement('label', { htmlFor: "breakMinutes", className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, t('break')),
                      React.createElement('input', {
                        type: "number",
                        id: "breakMinutes",
                        value: breakMinutes,
                        onChange: (e) => setBreakMinutes(parseInt(e.target.value, 10)),
                        className: "mt-1 block w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white"
                      })
                    )
                  )
                ),
                React.createElement('div', null,
                  React.createElement('label', { htmlFor: "logNotes", className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, t('notes')),
                  React.createElement('textarea', {
                    id: "logNotes",
                    rows: 3,
                    value: notes,
                    onChange: (e) => setNotes(e.target.value),
                    className: "mt-1 block w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-600/50 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white"
                  })
                )
              )
            ),
            React.createElement('div', { className: "px-6 py-4 bg-black/5 dark:bg-black/10 rounded-b-xl flex justify-end space-x-3 rtl:space-x-reverse" },
              React.createElement('button', {
                type: "button",
                onClick: onClose,
                className: "py-2 px-4 border border-gray-300/80 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700/80 dark:text-white dark:border-gray-600/80 dark:hover:bg-gray-700"
              },
                t('cancel')
              ),
              React.createElement('button', {
                type: "submit",
                className: "inline-flex justify-center py-2 px-4 border border-transparent shadow-lg shadow-indigo-500/30 text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              },
                logToEdit ? t('saveChanges') : t('save')
              )
            )
        )
      )
    )
  );
};

export default LogFormModal;
