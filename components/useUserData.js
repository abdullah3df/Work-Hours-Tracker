import React, { useState, useEffect, useRef } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { v4 as uuidv4 } from 'uuid';

const defaultProfile = {
  workDaysPerWeek: 5,
  workHoursPerDay: 8,
  defaultBreakMinutes: 30,
  annualVacationDays: 20,
  officialHolidays: [],
  country: '',
};

export function useUserData(user) {
  // Local state for guests
  const [localLogs, setLocalLogs] = useLocalStorage('saati-guest-logs', []);
  const [localProfile, setLocalProfile] = useLocalStorage('saati-guest-profile', defaultProfile);
  const [localTasks, setLocalTasks] = useLocalStorage('saati-guest-tasks', []);

  // Firestore state for logged-in users
  const [firestoreLogs, setFirestoreLogs] = useState([]);
  const [firestoreProfile, setFirestoreProfile] = useState(defaultProfile);
  const [firestoreTasks, setFirestoreTasks] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const guestDataMigrated = useRef(false);

  useEffect(() => {
    if (user && typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      setLoadingData(true);
      guestDataMigrated.current = false; // Reset for user switch
      const db = firebase.firestore();
      const userDocRef = db.collection('users').doc(user.uid);

      // Subscribe to profile changes
      const unsubscribeProfile = userDocRef.onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          const holidays = data.officialHolidays;
          // Data migration for old string[] holidays format or corrupted data
          if (Array.isArray(holidays) && holidays.length > 0 && typeof holidays[0] === 'string') {
            data.officialHolidays = holidays.map((dateStr) => ({ date: dateStr, name: 'Holiday', imported: false }));
          } else if (!Array.isArray(holidays)) {
            // If holidays is not an array (e.g. null, object from old error), reset it.
            data.officialHolidays = [];
          }
          setFirestoreProfile({ ...defaultProfile, ...data });
        } else {
          userDocRef.set(defaultProfile);
          setFirestoreProfile(defaultProfile);
        }
      }, (error) => console.error("Error fetching profile:", error));

      // Subscribe to log changes
      const logsCollectionRef = userDocRef.collection('logs');
      const unsubscribeLogs = logsCollectionRef.onSnapshot((snapshot) => {
        const logsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setFirestoreLogs(logsData);
      }, (error) => console.error("Error fetching logs:", error));

      // Subscribe to task changes
      const tasksCollectionRef = userDocRef.collection('tasks');
      const unsubscribeTasks = tasksCollectionRef.onSnapshot((snapshot) => {
        const tasksData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setFirestoreTasks(tasksData);
      }, (error) => console.error("Error fetching tasks:", error));
      
      // Combine loading state logic
      Promise.all([
          userDocRef.get(),
          logsCollectionRef.get(),
          tasksCollectionRef.get()
      ]).then(() => setLoadingData(false)).catch(() => setLoadingData(false));


      return () => {
        unsubscribeProfile();
        unsubscribeLogs();
        unsubscribeTasks();
      };
    } else {
      // Guest user logic
      if (!guestDataMigrated.current) {
        setLocalProfile(prevProfile => {
            if (!prevProfile) return defaultProfile; 
            
            const holidays = prevProfile.officialHolidays;
            let needsUpdate = false;
            let migratedOrFixedHolidays = holidays;

            if (Array.isArray(holidays) && holidays.length > 0 && typeof (holidays)[0] === 'string') {
                migratedOrFixedHolidays = (holidays).map(dateStr => ({ date: dateStr, name: 'Holiday', imported: false }));
                needsUpdate = true;
            } else if (!Array.isArray(holidays)) {
                migratedOrFixedHolidays = [];
                needsUpdate = true;
            }

            if (needsUpdate) {
                return { ...prevProfile, officialHolidays: migratedOrFixedHolidays };
            }
            
            return prevProfile;
        });
        guestDataMigrated.current = true;
      }
      setLoadingData(false);
    }
  }, [user, setLocalProfile]);

  const logs = user ? firestoreLogs : localLogs;
  const profile = user ? firestoreProfile : localProfile;
  const tasks = user ? firestoreTasks : localTasks;

  const getCollection = (collectionName) => {
      return firebase.firestore().collection('users').doc(user.uid).collection(collectionName);
  }

  const addLog = async (newLog) => {
    if (user) {
      await getCollection('logs').add(newLog);
    } else {
      setLocalLogs(prev => [...prev, { id: uuidv4(), ...newLog }]);
    }
  };

  const saveLog = async (logData) => {
    if (user) {
      const logsCollection = getCollection('logs');
      if ('id' in logData && logData.id) {
        const { id, ...dataToUpdate } = logData;
        await logsCollection.doc(id).update(dataToUpdate);
      } else {
        await logsCollection.add(logData);
      }
    } else {
      if ('id' in logData && logData.id) {
        setLocalLogs(prev => prev.map(l => l.id === logData.id ? logData : l));
      } else {
        setLocalLogs(prev => [...prev, { id: uuidv4(), ...logData }]);
      }
    }
  };

  const deleteLog = async (id) => {
    if (user) {
      await getCollection('logs').doc(id).delete();
    } else {
      setLocalLogs(prev => prev.filter(l => l.id !== id));
    }
  };

  const saveProfile = async (newSettings) => {
    if (user) {
      await firebase.firestore().collection('users').doc(user.uid).set(newSettings, { merge: true });
    } else {
      setLocalProfile(newSettings);
    }
  };

  const saveTask = async (taskData) => {
    if (user) {
        const tasksCollection = getCollection('tasks');
        if ('id' in taskData && taskData.id) {
            const { id, ...dataToUpdate } = taskData;
            await tasksCollection.doc(id).update(dataToUpdate);
        } else {
            await tasksCollection.add(taskData);
        }
    } else {
        if ('id' in taskData && taskData.id) {
            setLocalTasks(prev => prev.map(t => t.id === taskData.id ? taskData : t));
        } else {
            setLocalTasks(prev => [...prev, { id: uuidv4(), ...taskData }]);
        }
    }
  };

  const deleteTask = async (id) => {
    if (user) {
        await getCollection('tasks').doc(id).delete();
    } else {
        setLocalTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  return { logs, profile, tasks, loadingData, addLog, saveLog, deleteLog, saveProfile, saveTask, deleteTask };
}