import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { storage, CACHE_KEYS } from '../utils/storage';

const AppContext = createContext(null);

const initialState = {
  userProfile: null,
  todayPlan: null,
  checkins: [],
  userWords: {},
  wordBank: [],
  settings: {},
  isOnboarded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PROFILE': {
      const userProfile = action.payload;
      return {
        ...state,
        userProfile,
        isOnboarded: true,
      };
    }
    case 'SET_PLAN':
      return { ...state, todayPlan: action.payload };
    case 'TOGGLE_TASK': {
      const { taskId, completed } = action.payload;
      if (!state.todayPlan) return state;
      const tasks = state.todayPlan.tasks.map(t =>
        t.id === taskId ? { ...t, isCompleted: completed } : t
      );
      return { ...state, todayPlan: { ...state.todayPlan, tasks } };
    }
    case 'ADD_CHECKIN': {
      const date = action.payload;
      if (state.checkins.includes(date)) return state;
      return { ...state, checkins: [...state.checkins, date] };
    }
    case 'UPDATE_WORD': {
      const { wordId, record } = action.payload;
      return {
        ...state,
        userWords: { ...state.userWords, [wordId]: record },
      };
    }
    case 'SET_WORD_BANK':
      return { ...state, wordBank: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    // Load from localStorage on init
    const userProfile = storage.get(CACHE_KEYS.USER_PROFILE);
    const todayPlan = storage.get(`${CACHE_KEYS.TODAY_PLAN}`);
    const checkins = storage.get(CACHE_KEYS.CHECK_INS) || [];
    const userWords = storage.get(CACHE_KEYS.USER_WORDS) || {};
    const wordBank = storage.get(CACHE_KEYS.WORD_BANK) || [];
    const settings = storage.get(CACHE_KEYS.SETTINGS) || {};

    return {
      ...init,
      userProfile,
      todayPlan,
      checkins,
      userWords,
      wordBank,
      settings,
      isOnboarded: !!userProfile,
    };
  });

  // Auto-persist to localStorage on state changes
  useEffect(() => {
    if (state.userProfile) {
      storage.set(CACHE_KEYS.USER_PROFILE, state.userProfile);
    }
  }, [state.userProfile]);

  useEffect(() => {
    if (state.todayPlan) {
      storage.set(CACHE_KEYS.TODAY_PLAN, state.todayPlan);
    }
  }, [state.todayPlan]);

  useEffect(() => {
    storage.set(CACHE_KEYS.CHECK_INS, state.checkins);
  }, [state.checkins]);

  useEffect(() => {
    storage.set(CACHE_KEYS.USER_WORDS, state.userWords);
  }, [state.userWords]);

  useEffect(() => {
    if (state.wordBank.length > 0) {
      storage.set(CACHE_KEYS.WORD_BANK, state.wordBank);
    }
  }, [state.wordBank]);

  useEffect(() => {
    storage.set(CACHE_KEYS.SETTINGS, state.settings);
  }, [state.settings]);

  const setProfile = useCallback((profile) => {
    dispatch({ type: 'SET_PROFILE', payload: profile });
  }, []);

  const setPlan = useCallback((plan) => {
    dispatch({ type: 'SET_PLAN', payload: plan });
  }, []);

  const toggleTask = useCallback((taskId, completed) => {
    dispatch({ type: 'TOGGLE_TASK', payload: { taskId, completed } });
  }, []);

  const addCheckin = useCallback((date) => {
    dispatch({ type: 'ADD_CHECKIN', payload: date });
  }, []);

  const updateWord = useCallback((wordId, record) => {
    dispatch({ type: 'UPDATE_WORD', payload: { wordId, record } });
  }, []);

  const setWordBank = useCallback((bank) => {
    dispatch({ type: 'SET_WORD_BANK', payload: bank });
  }, []);

  const updateSettings = useCallback((s) => {
    dispatch({ type: 'SET_SETTINGS', payload: s });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET' });
    storage.clearAll();
  }, []);

  const value = {
    ...state,
    setProfile,
    setPlan,
    toggleTask,
    addCheckin,
    updateWord,
    setWordBank,
    updateSettings,
    resetAll,
    dispatch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
