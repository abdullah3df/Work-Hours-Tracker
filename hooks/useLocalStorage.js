import React, { useState, useEffect, useCallback } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);

        if (parsed === null) {
          return initialValue;
        }

        // If initialValue is an object (but not an array), and parsed value is also an object, merge them.
        if (typeof initialValue === 'object' && !Array.isArray(initialValue) && initialValue !== null &&
            typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
          return { ...initialValue, ...parsed };
        }
        
        // If initialValue is an array, and parsed value is also an array, use parsed.
        if (Array.isArray(initialValue) && Array.isArray(parsed)) {
          return parsed;
        }

        // For primitives, check if types match.
        if (typeof initialValue !== 'object' && typeof parsed === typeof initialValue) {
            return parsed;
        }
        
        // If we reach here, there's a type mismatch. Discard the stored value.
        console.warn(`Data in localStorage for key "${key}" has an unexpected format. Using initial value.`);
        return initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(prevValue => {
        const valueToStore = value instanceof Function ? value(prevValue) : value;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      });
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          if (e.newValue) {
            setStoredValue(JSON.parse(e.newValue));
          } else {
             // Value was removed from localStorage in another tab
            setStoredValue(initialValue);
          }
        } catch (error) {
          console.error(error)
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);
  
  return [storedValue, setValue];
}

export default useLocalStorage;