/**
 * Mobile Audio Handler
 * FIX 1: Handles mobile audio issues when screen turns off or app switches
 * Implements wake lock and mobile-specific audio policies
 */

export class MobileAudioHandler {
  private wakeLock: any = null;
  private audioContext: AudioContext | null = null;
  private isActive = false;

  /**
   * Check if the device is mobile
   */
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * Request wake lock to keep screen active during call
   * Prevents screen from turning off which can interrupt audio
   */
  async requestWakeLock(): Promise<void> {
    if (!this.isMobileDevice()) {
      console.log('[MobileAudio] Not a mobile device, skipping wake lock');
      return;
    }

    // Check if Wake Lock API is supported
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        console.log('[MobileAudio] Wake lock acquired successfully');

        this.wakeLock.addEventListener('release', () => {
          console.log('[MobileAudio] Wake lock released');
        });
      } catch (error) {
        console.error('[MobileAudio] Failed to acquire wake lock:', error);
        // Don't throw - allow call to proceed even if wake lock fails
      }
    } else {
      console.warn('[MobileAudio] Wake Lock API not supported on this device');
    }
  }

  /**
   * Release wake lock when call ends
   */
  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
        console.log('[MobileAudio] Wake lock released manually');
      } catch (error) {
        console.error('[MobileAudio] Failed to release wake lock:', error);
      }
    }
  }

  /**
   * Initialize audio context for mobile
   * Helps maintain audio stream during app switching
   */
  initializeAudioContext(): void {
    if (!this.isMobileDevice()) {
      return;
    }

    try {
      // Create AudioContext if it doesn't exist
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioContext && AudioContextClass) {
        this.audioContext = new AudioContextClass();
        console.log('[MobileAudio] AudioContext initialized');
      }

      // Resume audio context if suspended (common on mobile)
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('[MobileAudio] AudioContext resumed');
        });
      }
    } catch (error) {
      console.error('[MobileAudio] Failed to initialize AudioContext:', error);
    }
  }

  /**
   * Handle visibility change (app switching, screen lock)
   */
  setupVisibilityHandler(): void {
    if (!this.isMobileDevice()) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[MobileAudio] App backgrounded - maintaining audio');
        // Keep audio context alive
        if (this.audioContext && this.audioContext.state === 'running') {
          // Audio context should continue running
          console.log('[MobileAudio] AudioContext still running in background');
        }
      } else {
        console.log('[MobileAudio] App foregrounded - resuming');
        // Resume audio context if needed
        if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume().then(() => {
            console.log('[MobileAudio] AudioContext resumed after foreground');
          });
        }

        // Re-request wake lock if it was released
        if (this.isActive && !this.wakeLock) {
          this.requestWakeLock();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Return cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }

  /**
   * Start mobile audio handling for a call
   */
  async startCall(): Promise<() => void> {
    this.isActive = true;
    console.log('[MobileAudio] Starting mobile audio handling');

    // Request wake lock
    await this.requestWakeLock();

    // Initialize audio context
    this.initializeAudioContext();

    // Setup visibility handler
    const cleanupVisibility = this.setupVisibilityHandler();

    // Return cleanup function
    return async () => {
      this.isActive = false;
      await this.releaseWakeLock();
      if (cleanupVisibility) {
        cleanupVisibility();
      }
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      console.log('[MobileAudio] Mobile audio handling stopped');
    };
  }

  /**
   * Handle page unload (ensure cleanup)
   */
  setupUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      this.releaseWakeLock();
    });
  }
}

// Singleton instance
export const mobileAudioHandler = new MobileAudioHandler();
