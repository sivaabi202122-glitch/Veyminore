/**
 * AROWGO — SaveManager
 *
 * Handles persistent local storage for player progress and settings.
 * Operates offline with zero external dependencies.
 */
import { SaveData, GameSettings, DEFAULT_SETTINGS, BoardState } from '@/data/types';

const STORAGE_KEY = 'arowgo_save_v1';

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch {
    // Storage might be restricted
  }
  return null;
}

export class SaveManager {
  private static instance: SaveManager;
  private data: SaveData;

  private constructor() {
    this.data = this.load();
  }

  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  /**
   * Load save data from storage, falling back to defaults.
   */
  private load(): SaveData {
    const storage = getStorage();
    if (storage) {
      try {
        const raw = storage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<SaveData>;
          return {
            currentLevelId: parsed.currentLevelId || 'level_001',
            completedLevels: Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [],
            inProgressBoard: parsed.inProgressBoard,
            settings: {
              ...DEFAULT_SETTINGS,
              ...(parsed.settings || {}),
            },
            savedAt: parsed.savedAt || new Date().toISOString(),
          };
        }
      } catch (e) {
        console.warn('Failed to load save data from storage:', e);
      }
    }

    return {
      currentLevelId: 'level_001',
      completedLevels: [],
      settings: { ...DEFAULT_SETTINGS },
      savedAt: new Date().toISOString(),
    };
  }

  /**
   * Save current data to storage.
   */
  private persist(): void {
    const storage = getStorage();
    if (storage) {
      try {
        this.data.savedAt = new Date().toISOString();
        storage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.warn('Failed to persist save data to storage:', e);
      }
    }
  }

  /**
   * Check if a level is unlocked.
   * Level 1 is always unlocked. Other levels are unlocked if the previous level is completed.
   */
  isLevelUnlocked(levelId: string, allLevelIds: string[]): boolean {
    const index = allLevelIds.indexOf(levelId);
    if (index <= 0) return true;
    const prevLevelId = allLevelIds[index - 1];
    return this.data.completedLevels.includes(prevLevelId);
  }

  /**
   * Check if a level has been completed.
   */
  isLevelCompleted(levelId: string): boolean {
    return this.data.completedLevels.includes(levelId);
  }

  /**
   * Record a level completion.
   */
  completeLevel(levelId: string): void {
    if (!this.data.completedLevels.includes(levelId)) {
      this.data.completedLevels.push(levelId);
    }
    this.persist();
  }

  /**
   * Get current settings.
   */
  getSettings(): GameSettings {
    return { ...this.data.settings };
  }

  /**
   * Update settings.
   */
  updateSettings(updates: Partial<GameSettings>): void {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
    };
    this.persist();
  }

  /**
   * Save in-progress board state.
   */
  saveInProgress(boardState: BoardState | undefined): void {
    this.data.inProgressBoard = boardState;
    this.persist();
  }

  /**
   * Get daily streak info.
   */
  getDailyStreak() {
    return (
      this.data.dailyStreak || {
        currentStreak: 0,
        maxStreak: 0,
        lastCompletedDate: '',
        completedDates: [],
      }
    );
  }

  /**
   * Check if today's daily challenge has been completed.
   */
  isDailyCompleted(dateStr: string): boolean {
    const streak = this.getDailyStreak();
    return streak.completedDates.includes(dateStr);
  }

  /**
   * Record completion of daily challenge and calculate streak.
   */
  completeDailyChallenge(dateStr: string): { newStreak: number; isNewMax: boolean } {
    const streak = this.getDailyStreak();
    if (streak.completedDates.includes(dateStr)) {
      return { newStreak: streak.currentStreak, isNewMax: false };
    }

    let newStreak = 1;
    if (streak.lastCompletedDate) {
      const lastDate = new Date(streak.lastCompletedDate);
      const curDate = new Date(dateStr);
      const diffDays = Math.round((curDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        newStreak = streak.currentStreak + 1;
      } else if (diffDays === 0) {
        newStreak = streak.currentStreak;
      }
    }

    const isNewMax = newStreak > streak.maxStreak;
    const maxStreak = Math.max(newStreak, streak.maxStreak);

    this.data.dailyStreak = {
      currentStreak: newStreak,
      maxStreak,
      lastCompletedDate: dateStr,
      completedDates: [...streak.completedDates, dateStr],
    };
    this.persist();

    return { newStreak, isNewMax };
  }

  /**
   * Get in-progress board state.
   */
  getInProgress(): BoardState | undefined {
    return this.data.inProgressBoard;
  }

  /**
   * Reset all progress.
   */
  resetProgress(): void {
    this.data = {
      currentLevelId: 'level_001',
      completedLevels: [],
      settings: { ...DEFAULT_SETTINGS },
      savedAt: new Date().toISOString(),
    };
    this.persist();
  }
}
