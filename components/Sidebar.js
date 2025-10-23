import React from 'react';
import { DashboardIcon, ListBulletIcon, QuestionMarkCircleIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChartBarIcon, SparklesIcon } from './Icons.js';

const Sidebar = ({ 
  t, 
  onHelpClick, 
  isCollapsed, 
  toggleSidebar, 
  language, 
  onLinkClick,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'dashboard', icon: DashboardIcon, href: '#dashboard' },
    { id: 'logs-and-tasks', label: 'logsAndTasks', icon: ListBulletIcon, href: '#logs-and-tasks' },
    { id: 'analytics', label: 'analytics', icon: ChartBarIcon, href: '#analytics' },
    { id: 'ai-insights', label: 'aiInsights', icon: SparklesIcon, href: '#ai-insights' },
  ];

  const CollapseIcon = language === 'ar' ? ChevronDoubleRightIcon : ChevronDoubleLeftIcon;
  const ExpandIcon = language === 'ar' ? ChevronDoubleLeftIcon : ChevronDoubleRightIcon;
  
  const handleLinkClick = (href) => {
    onLinkClick(href);
    setIsMobileMenuOpen(false);
  }

  const sidebarContent = (
    React.createElement('div', { className: "h-full px-3 py-4 flex flex-col justify-between" },
      React.createElement('div', null,
        React.createElement('div', { className: `flex items-center mb-5 h-16 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'ps-2.5'}` },
            React.createElement('h1', { className: `text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-cairo whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100 sm:opacity-100'}` },
              t('saati')
            )
        ),
        React.createElement('ul', { className: "space-y-2 font-medium" },
          menuItems.map(item => (
            React.createElement('li', { key: item.id, className: "relative group" },
              React.createElement('a', {
                href: item.href,
                onClick: (e) => {
                  e.preventDefault();
                  handleLinkClick(item.href);
                },
                title: isCollapsed ? t(item.label) : '',
                className: "flex items-center p-2 text-gray-800 rounded-lg dark:text-white hover:bg-black/10 dark:hover:bg-white/10 group overflow-hidden cursor-pointer"
              },
                React.createElement(item.icon, { className: "w-6 h-6 flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" }),
                React.createElement('span', { className: `ms-3 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 sm:opacity-100' : 'opacity-100'}` },
                  t(item.label)
                )
              ),
              isCollapsed && (
                React.createElement('div', { className: "absolute start-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900/80 dark:bg-gray-700/80 backdrop-blur-sm text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50" },
                  t(item.label)
                )
              )
            )
          ))
        )
      ),
      
      React.createElement('div', { className: "flex flex-col" },
          React.createElement('div', { className: "relative group" },
              React.createElement('button', { onClick: () => { onHelpClick(); setIsMobileMenuOpen(false); }, id: "tour-trigger", title: isCollapsed ? t('help') : '', className: "w-full flex items-center p-2 text-gray-800 rounded-lg dark:text-white hover:bg-black/10 dark:hover:bg-white/10 group overflow-hidden" },
                  React.createElement(QuestionMarkCircleIcon, { className: "w-6 h-6 flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" }),
                  React.createElement('span', { className: `ms-3 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 sm:opacity-100' : 'opacity-100'}` }, t('help'))
              ),
               isCollapsed && (
                React.createElement('div', { className: "absolute start-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900/80 dark:bg-gray-700/80 backdrop-blur-sm text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50" },
                  t('help')
                )
              )
          ),
           React.createElement('div', { className: "relative group mt-2 border-t border-gray-900/10 dark:border-white/10 pt-2 hidden sm:block" },
              React.createElement('button', { onClick: toggleSidebar, title: isCollapsed ? t('expandSidebar') : t('collapseSidebar'), className: "w-full flex items-center p-2 text-gray-800 rounded-lg dark:text-white hover:bg-black/10 dark:hover:bg-white/10 group overflow-hidden" },
                  isCollapsed 
                      ? React.createElement(ExpandIcon, { className: "w-6 h-6 flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" }) 
                      : React.createElement(CollapseIcon, { className: "w-6 h-6 flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" })
                  ,
                  React.createElement('span', { className: `ms-3 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}` }, isCollapsed ? t('expandSidebar') : t('collapseSidebar'))
              ),
               isCollapsed && (
                React.createElement('div', { className: "absolute start-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900/80 dark:bg-gray-700/80 backdrop-blur-sm text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50" },
                  t('expandSidebar')
                )
              )
          )
      )
    )
  );

  return (
    React.createElement(React.Fragment, null,
      isMobileMenuOpen && (
        React.createElement('div', {
          className: "bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30 sm:hidden",
          onClick: () => setIsMobileMenuOpen(false)
        })
      ),
      React.createElement('aside', {
        id: "app-sidebar", 
        className: `fixed top-0 start-0 z-40 h-screen transition-transform duration-300 ease-in-out bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border-e border-white/30 dark:border-white/10 w-64
        ${isCollapsed ? 'sm:w-20' : 'sm:w-64'} 
        ${isMobileMenuOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')} 
        sm:translate-x-0`,
        'aria-label': "Sidebar"
      },
        sidebarContent
      )
    )
  );
};

export default Sidebar;
