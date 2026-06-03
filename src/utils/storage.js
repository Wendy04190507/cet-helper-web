// utils/storage.js — localStorage wrapper

const PREFIX = 'cet_';

export const CACHE_KEYS = {
  USER_PROFILE:  'user_profile',
  TODAY_PLAN:    'today_plan',
  WORD_BANK:     'word_bank',
  USER_WORDS:    'user_words',
  CHECK_INS:     'check_ins',
  TASK_RECORDS:  'task_records',
  SETTINGS:      'settings',
};

export const storage = {
  get(key, def = null) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v ? JSON.parse(v) : def;
    } catch {
      return def;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('缓存写入失败:', key, e);
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (e) {
      console.error('缓存删除失败:', key, e);
    }
  },

  clearAll() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('缓存清除失败:', e);
    }
  },
};
