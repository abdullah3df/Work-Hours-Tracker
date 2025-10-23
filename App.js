import React, { useState, useEffect, useCallback } from 'react';
import { getTranslator } from './lib/i18n.js';
import useLocalStorage from './hooks/useLocalStorage.js';
import LoginPage from './components/LoginPage.js';
import MainApp from './MainApp.js';
import LoadingSpinner from './components/LoadingSpinner.js';
import { ToastContainer } from './components/Toast.js';

// Make firebase available from the global scope

const App = () => {
  const [language, setLanguage] = useLocalStorage('saati-language', 'ar');
  const [theme, setTheme] = useLocalStorage('saati-theme', 'light');
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useLocalStorage('saati-is-guest', false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [toasts, setToasts] = useState([]);

  const t = useCallback(getTranslator(language), [language]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };


  useEffect(() => {
    const root = window.document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [language, theme]);
  
  useEffect(() => {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      setFirebaseInitialized(true);
      const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        setUser(user);
        if (user) {
          setIsGuest(false); // If user logs in, they are no longer a guest
        }
        setLoadingAuth(false);
      });
      return () => unsubscribe(); // Cleanup subscription on unmount
    } else {
        // Handle case where firebase is not initialized
        setLoadingAuth(false);
    }
  }, [setIsGuest]);


  const handleLogout = () => {
      if (user) {
         firebase.auth().signOut();
      }
      setIsGuest(false);
  }

  if (loadingAuth) {
    return (
        React.createElement('div', { className: "min-h-screen flex items-center justify-center" },
            React.createElement(LoadingSpinner, null)
        )
    );
  }
  
  const showMainApp = user || isGuest;

  return (
    React.createElement(React.Fragment, null,
      React.createElement(ToastContainer, { toasts: toasts, onRemoveToast: removeToast }),
      !showMainApp ? (
          React.createElement('div', { className: "smooth-scroll" },
            React.createElement(LoginPage, { 
                language: language, 
                setLanguage: setLanguage,
                theme: theme,
                setTheme: setTheme,
                t: t,
                firebaseInitialized: firebaseInitialized,
                onGuestLogin: () => setIsGuest(true)
            })
          )
      ) : (
        React.createElement(MainApp, { 
            user: user, 
            onLogout: handleLogout,
            language: language,
            setLanguage: setLanguage,
            theme: theme,
            setTheme: setTheme,
            t: t,
            showToast: showToast
        })
      )
    )
  );
};

export default App;