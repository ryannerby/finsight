interface RateLimitEntry {
  dealId: string;
  lastRequest: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly WINDOW_MS = 60000; // 1 minute

  isAllowed(dealId: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(dealId);

    if (!entry) {
      this.limits.set(dealId, { dealId, lastRequest: now });
      return true;
    }

    const timeSinceLastRequest = now - entry.lastRequest;
    
    if (timeSinceLastRequest >= this.WINDOW_MS) {
      entry.lastRequest = now;
      return true;
    }

    return false;
  }

  getTimeRemaining(dealId: string): number {
    const entry = this.limits.get(dealId);
    if (!entry) return 0;

    const timeSinceLastRequest = Date.now() - entry.lastRequest;
    return Math.max(0, this.WINDOW_MS - timeSinceLastRequest);
  }

  // Clean up old entries to prevent memory leaks
  cleanup() {
    const now = Date.now();
    for (const [dealId, entry] of this.limits.entries()) {
      if (now - entry.lastRequest > this.WINDOW_MS * 10) { // Keep for 10 minutes
        this.limits.delete(dealId);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Clean up every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000); 