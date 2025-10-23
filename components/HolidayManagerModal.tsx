import React, { useState, useEffect } from 'react';
import { ProfileSettings, Holiday } from '../types';
import { AddIcon, DeleteIcon, GlobeAltIcon } from './Icons';
import { fetchPublicHolidays } from '../lib/holidayService';
import { countries } from '../lib/countries';

interface HolidayManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProfileSettings;
  onSave: (newSettings: ProfileSettings) => Promise<void>;
  t: (key: any) => string;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const HolidayManagerModal: React.FC<HolidayManagerModalProps> = ({ isOpen, onClose, settings, onSave, t, showToast }) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Deep copy to avoid mutating the original settings object
      setHolidays(JSON.parse(JSON.stringify(settings.officialHolidays || [])));
      setNewHolidayName('');
      setNewHolidayDate('');
    }
  }, [isOpen, settings.officialHolidays]);

  const handleAddHoliday = () => {
    if (newHolidayName.trim() && newHolidayDate) {
      const newHoliday: Holiday = { name: newHolidayName.trim(), date: newHolidayDate };
      if (holidays.some(h => h.date === newHoliday.date)) {
        alert('A holiday for this date already exists.');
        return;
      }
      const updatedHolidays = [...holidays, newHoliday].sort((a, b) => a.date.localeCompare(b.date));
      setHolidays(updatedHolidays);
      setNewHolidayName('');
      setNewHolidayDate('');
    }
  };

  const handleDeleteHoliday = (date: string) => {
    if (window.confirm(t('confirmDeleteHoliday'))) {
        setHolidays(holidays.filter(h => h.date !== date));
    }
  };

  const handleSave = async () => {
    try {
      await onSave({ ...settings, officialHolidays: holidays });
      showToast(t('saveSuccess'), 'success');
      onClose();
    } catch (error) {
      console.error("Failed to save holidays:", error);
      showToast(t('saveError'), 'error');
    }
  };

  const handleImportHolidays = async () => {
    if (!settings.country) return;
    setIsImporting(true);
    const year = new Date().getFullYear();
    try {
        const fetchedHolidays = await fetchPublicHolidays(settings.country, year);
        
        const existingDates = new Set(holidays.map(h => h.date));
        const newHolidays = fetchedHolidays
            .filter(h => !existingDates.has(h.date))
            .map(h => ({ ...h, imported: true }));
        
        const combinedHolidays = [...holidays, ...newHolidays].sort((a,b) => a.date.localeCompare(b.date));
        setHolidays(combinedHolidays);
        
        const countryName = countries.find(c => c.code === settings.country)?.name || settings.country;
        showToast(t('holidaysImported').replace('{count}', String(newHolidays.length)).replace('{country}', countryName), 'success');

    } catch (error) {
        showToast(t('holidaysImportError'), 'error');
    } finally {
        setIsImporting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[10002] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('officialHolidays')}</h2>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          {/* Import Section */}
          {settings.country && (
            <div className="mb-6 p-4 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">{t('importHolidaysHelp')}</p>
                    <button
                        onClick={handleImportHolidays}
                        disabled={isImporting}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-200 dark:hover:bg-indigo-900 disabled:opacity-50"
                    >
                         {isImporting ? '...' : t('importHolidays').replace('{year}', String(new Date().getFullYear()))}
                    </button>
                </div>
            </div>
          )}
          
          {/* Add Holiday Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 items-end">
            <div className="md:col-span-1">
              <label htmlFor="holidayName" className="block text-sm font-medium text-gray-800 dark:text-gray-200">{t('holidayName')}</label>
              <input
                type="text"
                id="holidayName"
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white"
                placeholder={t('holidayName')}
              />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="holidayDate" className="block text-sm font-medium text-gray-800 dark:text-gray-200">{t('date')}</label>
              <input
                type="date"
                id="holidayDate"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:text-white"
              />
            </div>
            <button
              onClick={handleAddHoliday}
              disabled={!newHolidayName.trim() || !newHolidayDate}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <AddIcon className="w-5 h-5 me-2" />
              {t('addHoliday')}
            </button>
          </div>

          {/* Holiday List */}
          <div className="space-y-2">
            {holidays.length > 0 ? holidays.map(holiday => (
              <div key={holiday.date} className="flex justify-between items-center p-3 rounded-md bg-slate-100 dark:bg-slate-700/50">
                <div className="flex items-center gap-3">
                    {holiday.imported && (
                        // FIX: Wrap icon in a span with a title to provide tooltip, resolving TS error.
                        <span title={t('imported')}>
                            <GlobeAltIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </span>
                    )}
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{holiday.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{holiday.date}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteHoliday(holiday.date)} className="p-1 rounded-md text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-600/50" title={t('deleteHoliday')}>
                  <DeleteIcon className="w-5 h-5" />
                </button>
              </div>
            )) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('noHolidays')}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3 rtl:space-x-reverse">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-slate-600 dark:text-gray-200 dark:border-slate-500 dark:hover:bg-slate-500"
          >
            {t('close')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-lg shadow-indigo-500/30 text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            {t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HolidayManagerModal;
