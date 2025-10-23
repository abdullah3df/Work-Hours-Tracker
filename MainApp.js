import React, { useState } from 'react';
import Header from './components/Header.js';
import TimeTracker from './components/TimeTracker.js';
import LogManager from './components/LogManager.js';
import ProfileModal from './components/ProfileModal.js';
import LogFormModal from './components/LogFormModal.js';
import ReportModal from './components/ReportModal.js';
import { useUserData } from './components/useUserData.js';
import LoadingSpinner from './components/LoadingSpinner.js';
import Reminders from './components/Reminders.js';
import Sidebar from './components/Sidebar.js';
import TourGuide from './components/TourGuide.js';
import useLocalStorage from './hooks/useLocalStorage.js';
import WorkHoursChart from './components/WorkHoursChart.js';
import HolidayManagerModal from './components/HolidayManagerModal.js';
import AIInsights from './components/AIInsights.js';


const MainApp = ({ user, onLogout, language, setLanguage, theme, setTheme, t, showToast }) => {
  const { logs, profile, tasks, loadingData, addLog, saveLog, deleteLog, saveProfile, saveTask, deleteTask } = useUserData(user);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogFormModalOpen, setIsLogFormModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [logToEdit, setLogToEdit] = useState(null);
  const [logFormDefaultType, setLogFormDefaultType] = useState('work');
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);


  const [tourCompleted, setTourCompleted] = useLocalStorage('saati-tour-completed-v1', false);
  const [runTour, setRunTour] = useState(!tourCompleted);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage('saati-sidebar-collapsed', false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tourSteps = [
    { target: '#dashboard-widget', content: t('tourStep1') },
    { target: '#logs-widget', content: t('tourStep3') },
    { target: '#reminders-widget', content: t('tourStep4') },
    { target: '#analytics-widget', content: t('tourStep2') },
    { target: '#ai-insights-widget', content: t('tourStep6') },
    { target: '#tour-trigger', content: t('tourStep5'), position: 'right' },
  ];

  const handleOpenLogForm = (log, type) => {
    setLogToEdit(log);
    if (!log && type) {
        setLogFormDefaultType(type);
    }
    setIsLogFormModalOpen(true);
  }
  
  const handleSetRunTour = (isRunning) => {
    if (isRunning) {
        setIsSidebarCollapsed(false); // Ensure sidebar is expanded for tour
        setIsMobileMenuOpen(false); // Ensure mobile menu is closed
    }
    if (!isRunning) { // Tour is being stopped/finished
        setTourCompleted(true);
    }
    setRunTour(isRunning);
  }

  const handleLinkClick = (href) => {
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      // Use block: 'start' to align the top of the element with the top of the scrollable container
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    React.createElement('div', { className: "min-h-screen bg-transparent flex" },
      React.createElement(Sidebar, { 
        t: t, 
        onHelpClick: () => handleSetRunTour(true), 
        isCollapsed: isSidebarCollapsed,
        toggleSidebar: () => setIsSidebarCollapsed(!isSidebarCollapsed),
        language: language,
        onLinkClick: handleLinkClick,
        isMobileMenuOpen: isMobileMenuOpen,
        setIsMobileMenuOpen: setIsMobileMenuOpen
      }),
      
      React.createElement('div', { className: `smooth-scroll flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'sm:ms-20' : 'sm:ms-64'} ${isMobileMenuOpen ? 'overflow-hidden' : ''}` },
        React.createElement(Header, { 
          user: user,
          onLogout: onLogout,
          onProfileClick: () => setIsProfileModalOpen(true),
          language: language,
          setLanguage: setLanguage,
          theme: theme,
          setTheme: setTheme,
          t: t,
          setIsMobileMenuOpen: setIsMobileMenuOpen
        }),
        
        React.createElement('main', { className: "pb-8" },
          loadingData ? (
            React.createElement('div', { className: "flex justify-center items-center py-20" },
              React.createElement(LoadingSpinner, null)
            )
          ) : (
            React.createElement('div', { className: "container mx-auto px-4 sm:px-6 lg:px-8" },
              React.createElement('div', { id: "dashboard", className: "mt-8" },
                React.createElement('div', { id: "dashboard-widget" }, React.createElement(TimeTracker, { addLog: addLog, profile: profile, t: t, showToast: showToast, language: language }))
              ),
              React.createElement('div', { id: "logs-and-tasks", className: "mt-8" },
                React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-3 gap-8" },
                  React.createElement('div', { className: "lg:col-span-2", id: "logs-widget" },
                    React.createElement(LogManager, { 
                        logs: logs,
                        profile: profile,
                        onAdd: (type) => handleOpenLogForm(null, type),
                        onEdit: (log) => handleOpenLogForm(log),
                        onDelete: deleteLog,
                        onGenerateReport: () => setIsReportModalOpen(true),
                        t: t,
                        language: language,
                        showToast: showToast
                    })
                  ),
                  React.createElement('div', { className: "lg:col-span-1", id: "reminders-widget" },
                    React.createElement(Reminders, {
                      tasks: tasks,
                      saveTask: saveTask,
                      deleteTask: deleteTask,
                      t: t,
                      showToast: showToast
                    })
                  )
                )
              ),
               React.createElement('div', { id: "analytics", className: "mt-8" },
                React.createElement('div', { id: "analytics-widget" },
                    React.createElement(WorkHoursChart, { logs: logs, profile: profile, t: t, language: language })
                )
              ),
              React.createElement('div', { id: "ai-insights", className: "mt-8" },
                React.createElement('div', { id: "ai-insights-widget" },
                    React.createElement(AIInsights, { logs: logs, profile: profile, t: t, language: language })
                )
              )
            )
          )
        )
      ),

      React.createElement(TourGuide, { run: runTour, setRun: handleSetRunTour, steps: tourSteps, t: t }),

      React.createElement(ProfileModal, { 
        isOpen: isProfileModalOpen,
        onClose: () => setIsProfileModalOpen(false),
        settings: profile,
        onSave: saveProfile,
        t: t,
        showToast: showToast,
        onManageHolidays: () => setIsHolidayModalOpen(true)
      }),

      React.createElement(HolidayManagerModal, {
        isOpen: isHolidayModalOpen,
        onClose: () => setIsHolidayModalOpen(false),
        settings: profile,
        onSave: saveProfile,
        t: t,
        showToast: showToast
      }),

      React.createElement(LogFormModal, {
        isOpen: isLogFormModalOpen,
        onClose: () => {
          setIsLogFormModalOpen(false);
          setLogToEdit(null); // Clear logToEdit on close
          setLogFormDefaultType('work'); // Reset default type
        },
        onSave: saveLog,
        logToEdit: logToEdit,
        defaultType: logFormDefaultType,
        t: t,
        showToast: showToast
      }),

      React.createElement(ReportModal, {
        isOpen: isReportModalOpen,
        onClose: () => setIsReportModalOpen(false),
        logs: logs,
        profile: profile,
        t: t,
        language: language,
        user: user
      })
    )
  );
};

export default MainApp;