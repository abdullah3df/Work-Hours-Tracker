import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from './Icons.js';

const toastIcons = {
  success: React.createElement(CheckCircleIcon, { className: "w-6 h-6 text-green-500" }),
  error: React.createElement(XCircleIcon, { className: "w-6 h-6 text-red-500" }),
};

const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000); // 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onRemove]);

  return (
    React.createElement('div', { className: "max-w-sm w-full bg-glass-bg-light dark:bg-glass-bg-dark backdrop-blur-lg shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border border-glass-border-light dark:border-glass-border-dark" },
      React.createElement('div', { className: "p-4" },
        React.createElement('div', { className: "flex items-start" },
          React.createElement('div', { className: "flex-shrink-0" },
            toastIcons[toast.type]
          ),
          React.createElement('div', { className: "ms-3 w-0 flex-1 pt-0.5" },
            React.createElement('p', { className: "text-sm font-medium text-gray-900 dark:text-white" }, toast.message)
          ),
          React.createElement('div', { className: "ms-4 flex-shrink-0 flex" },
            React.createElement('button', {
              onClick: () => onRemove(toast.id),
              className: "bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
            },
              React.createElement('span', { className: "sr-only" }, "Close"),
              React.createElement(XMarkIcon, { className: "h-5 w-5", 'aria-hidden': "true" })
            )
          )
        )
      )
    )
  );
};

export const ToastContainer = ({ toasts, onRemoveToast }) => {
    return (
        React.createElement('div', { className: "fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[10000]" },
            React.createElement('div', { className: "w-full flex flex-col items-center space-y-4 sm:items-end" },
                toasts.map((toast) => (
                    React.createElement(Toast, { key: toast.id, toast: toast, onRemove: onRemoveToast })
                ))
            )
        )
    );
}
