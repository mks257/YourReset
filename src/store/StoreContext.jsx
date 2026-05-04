import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEMES } from '../constants/themes';
import { REAL } from '../constants/healthData';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [themeIdx, setThemeIdx] = useState(0);
  const [charType, setCharType] = useState('female');
  const [health, setHealth] = useState({
    steps: 5943,
    kcal: 210,
    rhr: REAL.rhr,
    exMin: REAL.exMin,
    weight: REAL.weight,
    age: REAL.age,
    stepGoal: REAL.stepGoal,
    kcalGoal: REAL.kcalGoal,
  });
  const [done, setDone] = useState({});
  const [tab, setTab] = useState('dashboard');
  const [syncTime, setSyncTime] = useState(new Date());
  const [gutWeekLog, setGutWeekLog] = useState({});

  const T = THEMES[themeIdx];

  // Poll simulation
  useEffect(() => {
    const id = setInterval(() => {
      setHealth(p => ({
        ...p,
        steps: p.steps + Math.floor(Math.random() * 55 + 8),
        kcal: p.kcal + Math.floor(Math.random() * 7 + 1),
      }));
      setSyncTime(new Date());
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const toggleDone = (dayIdx, exId) => {
    const key = `${dayIdx}-${exId}`;
    setDone(p => ({ ...p, [key]: !p[key] }));
  };

  const value = {
    themeIdx, setThemeIdx,
    T,
    charType, setCharType,
    health, setHealth,
    done, toggleDone,
    gutWeekLog, setGutWeekLog,
    tab, setTab,
    syncTime
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
