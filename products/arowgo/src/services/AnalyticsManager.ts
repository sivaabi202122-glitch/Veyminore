/**
 * AROWGO — AnalyticsManager
 *
 * Privacy-first lightweight telemetry logger and event queue.
 * Strictly adheres to Masterplan Section 11:
 * - Collects only essential gameplay progression and stability metrics
 * - Zero PII, no location tracking, no device fingerprinting
 * - Works offline by queueing events locally
 */

export type AnalyticsEventName =
  | 'app_open'
  | 'tutorial_started'
  | 'tutorial_completed'
  | 'level_started'
  | 'level_completed'
  | 'level_failed'
  | 'hint_used'
  | 'undo_used'
  | 'daily_challenge_started'
  | 'daily_challenge_completed'
  | 'rewarded_ad_offered'
  | 'rewarded_ad_completed'
  | 'purchase_completed';

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  timestamp: string;
  payload?: Record<string, string | number | boolean>;
}

const STORAGE_KEY = 'arowgo_analytics_queue_v1';
const MAX_QUEUE_SIZE = 100;

export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private queue: AnalyticsEvent[] = [];

  private constructor() {
    this.loadQueue();
  }

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  private loadQueue(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.queue = JSON.parse(raw);
        }
      }
    } catch {
      this.queue = [];
    }
  }

  private persistQueue(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue.slice(-MAX_QUEUE_SIZE)));
      }
    } catch {
      // Ignore write errors
    }
  }

  /**
   * Log an event.
   */
  logEvent(name: AnalyticsEventName, payload?: Record<string, string | number | boolean>): void {
    const event: AnalyticsEvent = {
      name,
      timestamp: new Date().toISOString(),
      payload,
    };

    this.queue.push(event);
    if (this.queue.length > MAX_QUEUE_SIZE) {
      this.queue.shift();
    }
    this.persistQueue();

    // In development mode, log to console for verification
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics] ${name}`, payload || '');
    }
  }

  /**
   * Get all queued events (for telemetry dispatch or debugging).
   */
  getQueuedEvents(): AnalyticsEvent[] {
    return [...this.queue];
  }

  /**
   * Clear processed events.
   */
  clearQueue(): void {
    this.queue = [];
    this.persistQueue();
  }
}
