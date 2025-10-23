import React, { useState, useRef, useEffect } from 'react';
import { FlagARIcon, FlagDEIcon, FlagENIcon, MoonIcon, SunIcon, ProfileIcon, CheckIcon, Bars3Icon } from './Icons.js';

const Header = ({
  user,
  onLogout,
  onProfileClick,
  language,
  setLanguage,
  theme,
  setTheme,
  t,
  setIsMobileMenuOpen,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const languageMenuRef = useRef(null);

  const userName = user ? user.displayName || user.email : t('guest');
  
  const languageOptions = [
    { code: 'en', name: 'English', flag: React.createElement(FlagENIcon, { className: "w-6 h-auto rounded-sm border border-gray-300/50 dark:border-gray-600/50" }) },
    { code: 'ar', name: 'العربية', flag: React.createElement(FlagARIcon, { className: "w-6 h-auto rounded-sm border border-gray-300/50 dark:border-gray-600/50" }) },
    { code: 'de', name: 'Deutsch', flag: React.createElement(FlagDEIcon, { className: "w-6 h-auto rounded-sm border border-gray-300/50 dark:border-gray-600/50" }) },
  ];
  const currentLanguage = languageOptions.find(opt => opt.code === language);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    React.createElement('header', { className: "bg-white/10 dark:bg-black/10 backdrop-blur-lg sticky top-0 z-20 border-b border-white/20 dark:border-black/20" },
      React.createElement('div', { className: "container mx-auto px-4 sm:px-6 lg:px-8" },
        React.createElement('div', { className: "flex items-center justify-between h-16" },
          React.createElement('div', { className: "flex items-center space-x-2" },
             React.createElement('button', {
                onClick: () => setIsMobileMenuOpen(true),
                className: "p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:hidden",
                'aria-label': "Open menu"
              },
                React.createElement(Bars3Icon, { className: "w-6 h-6" })
              ),
            React.createElement('h1', { className: "sm:hidden text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-cairo" },
                t('saati')
            )
          ),
          React.createElement('div', { className: "flex items-center space-x-2 sm:space-x-4" },
            React.createElement('p', { className: "hidden sm:block text-sm text-gray-600 dark:text-gray-300" },
                t('welcome'), ", ", React.createElement('span', { className: "font-semibold text-gray-800 dark:text-white" }, userName)
            ),
            
             React.createElement('div', { className: "relative", ref: languageMenuRef },
              React.createElement('button', {
                onClick: () => setIsLanguageMenuOpen(!isLanguageMenuOpen),
                className: "flex items-center space-x-2 rtl:space-x-reverse px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 dark:bg-black/10 text-gray-800 dark:text-gray-200 backdrop-blur-md border border-white/20 dark:border-black/20 hover:bg-white/20 dark:hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-indigo-500",
                'aria-label': t('language')
              },
                currentLanguage?.flag,
                React.createElement('span', { className: "hidden sm:inline" }, language.toUpperCase())
              ),
              isLanguageMenuOpen && (
                React.createElement('div', { className: "absolute end-0 mt-2 w-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50" },
                  languageOptions.map((lang) => (
                    React.createElement('a', {
                      key: lang.code,
                      href: "#",
                      onClick: (e) => {
                        e.preventDefault();
                        setLanguage(lang.code);
                        setIsLanguageMenuOpen(false);
                      },
                      className: "flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/5"
                    },
                      React.createElement('div', { className: "flex items-center space-x-3 rtl:space-x-reverse" },
                        lang.flag,
                        React.createElement('span', null, lang.name)
                      ),
                      language === lang.code && React.createElement(CheckIcon, { className: "w-5 h-5 text-indigo-500" })
                    )
                  ))
                )
              )
            ),

            React.createElement('button', {
              onClick: () => setTheme(theme === 'light' ? 'dark' : 'light'),
              className: "p-2 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-black/20 hover:bg-white/20 dark:hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-indigo-500",
              'aria-label': t('theme')
            },
              theme === 'light' ? React.createElement(MoonIcon, { className: "w-6 h-6 text-gray-700" }) : React.createElement(SunIcon, { className: "w-6 h-6 text-yellow-400" })
            ),

            React.createElement('div', { className: "relative", ref: profileMenuRef },
                React.createElement('button', {
                    onClick: () => setIsProfileMenuOpen(!isProfileMenuOpen),
                    className: "p-1.5 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-black/20 hover:bg-white/20 dark:hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                },
                    React.createElement(ProfileIcon, { className: "w-6 h-6 text-gray-600 dark:text-gray-300" })
                ),
                isProfileMenuOpen && (
                    React.createElement('div', { className: "absolute end-0 mt-2 w-48 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50" },
                        React.createElement('div', { className: "px-4 py-2 border-b border-gray-900/10 dark:border-gray-50/10" },
                            React.createElement('p', { className: "text-sm text-gray-700 dark:text-gray-300" }, t('welcome')),
                            React.createElement('p', { className: "text-sm font-medium text-gray-900 dark:text-white truncate" }, userName)
                        ),
                        React.createElement('a', {
                            href: "#",
                            onClick: (e) => { e.preventDefault(); onProfileClick(); setIsProfileMenuOpen(false); },
                            className: "block px-4 py-2 text-sm text-gray-700 hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/5"
                        },
                            t('profileSettings')
                        ),
                        React.createElement('a', {
                            href: "#",
                            onClick: (e) => { e.preventDefault(); onLogout(); setIsProfileMenuOpen(false); },
                            className: "block px-4 py-2 text-sm text-gray-700 hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/5"
                        },
                            t('logout')
                        )
                    )
                )
            )
          )
        )
      )
    )
  );
};

export default Header;