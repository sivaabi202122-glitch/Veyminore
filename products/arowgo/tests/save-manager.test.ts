import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '../src/services/SaveManager';

// Mock localStorage for Node test environment
class MockLocalStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }
}

describe('SaveManager', () => {
  let saveManager: SaveManager;

  beforeEach(() => {
    (globalThis as unknown as { localStorage: Storage }).localStorage = new MockLocalStorage();
    saveManager = SaveManager.getInstance();
    saveManager.resetProgress();
  });

  it('initializes with default values and level 1 unlocked', () => {
    const allLevels = ['level_001', 'level_002', 'level_003'];
    expect(saveManager.isLevelUnlocked('level_001', allLevels)).toBe(true);
    expect(saveManager.isLevelUnlocked('level_002', allLevels)).toBe(false);
    expect(saveManager.isLevelCompleted('level_001')).toBe(false);
  });

  it('completing a level unlocks the next level', () => {
    const allLevels = ['level_001', 'level_002', 'level_003'];
    saveManager.completeLevel('level_001');

    expect(saveManager.isLevelCompleted('level_001')).toBe(true);
    expect(saveManager.isLevelUnlocked('level_002', allLevels)).toBe(true);
    expect(saveManager.isLevelUnlocked('level_003', allLevels)).toBe(false);
  });

  it('updates and persists settings', () => {
    saveManager.updateSettings({ soundEnabled: false });
    expect(saveManager.getSettings().soundEnabled).toBe(false);

    saveManager.updateSettings({ soundEnabled: true, hapticsEnabled: false });
    const settings = saveManager.getSettings();
    expect(settings.soundEnabled).toBe(true);
    expect(settings.hapticsEnabled).toBe(false);
  });

  it('resets progress cleanly', () => {
    saveManager.completeLevel('level_001');
    saveManager.completeLevel('level_002');
    saveManager.resetProgress();

    expect(saveManager.isLevelCompleted('level_001')).toBe(false);
    expect(saveManager.isLevelCompleted('level_002')).toBe(false);
  });
});
