/**
 * Implement a Sliding Window Counter Rate Limiter
 * 
 * Sliding window counter is a hybrid approach that combines fixed windows
 * with weighted counting. It estimates the request count in the sliding
 * window by using the previous window's count and current window's count.
 * 
 * Formula: 
 * requests = (previous_window_count * overlap_percentage) + current_window_count
 * 
 * Requirements:
 * - Track request counts for current and previous fixed windows
 * - Calculate overlap between sliding window and fixed windows
 * - Use weighted average based on overlap percentage
 * - More memory efficient than sliding window log
 * - Return true if request is allowed, false if rate limited
 * 
 * Example: With 1-minute fixed windows and limit of 100:
 * - Previous window (11:59:00-12:00:00): 80 requests
 * - Current window (12:00:00-12:01:00): 30 requests  
 * - At 12:00:15 (25% into current window):
 *   - 75% of sliding window overlaps with previous: 80 * 0.75 = 60
 *   - 25% of sliding window is in current: 30
 *   - Total estimate: 60 + 30 = 90 (under limit, allow)
 */

interface SlidingWindowCounterRateLimiter {
  /**
   * Check if a request is allowed
   * @param userId - Unique identifier for the user/client
   * @param timestamp - Current timestamp in milliseconds
   * @returns true if request is allowed, false if rate limited
   */
  allowRequest(userId: string, timestamp: number): boolean;
}

function problem_createSlidingWindowCounterRateLimiter(
  windowSizeMs: number,
  maxRequests: number
): SlidingWindowCounterRateLimiter {
  // TODO: Implement this function
  throw new Error("Not implemented");
}

// Tests
Deno.test("Sliding Window Counter Rate Limiter - basic functionality", () => {
  const limiter = problem_createSlidingWindowCounterRateLimiter(1000, 10); // 1 second window, 10 requests max
  
  // Fill first window
  for (let i = 0; i < 8; i++) {
    console.assert(limiter.allowRequest("user1", 100 + i * 100) === true);
  }
  
  // Move to next window - should use weighted average
  console.assert(limiter.allowRequest("user1", 1100) === true);
  console.assert(limiter.allowRequest("user1", 1200) === true);
  
  // At 1200ms: 20% into new window
  // Previous window: 8 requests * 0.8 = 6.4
  // Current window: 2 requests
  // Total: ~8.4, should still allow
  console.assert(limiter.allowRequest("user1", 1200) === true);
  
  // Continue adding until limit
  console.assert(limiter.allowRequest("user1", 1201) === true);
  console.assert(limiter.allowRequest("user1", 1202) === false); // Should exceed weighted limit
});

Deno.test("Sliding Window Counter Rate Limiter - window transition", () => {
  const limiter = problem_createSlidingWindowCounterRateLimiter(1000, 5);
  
  // Max out first window
  for (let i = 0; i < 5; i++) {
    console.assert(limiter.allowRequest("user1", 200 + i * 100) === true);
  }
  console.assert(limiter.allowRequest("user1", 700) === false);
  
  // Right at window boundary - previous window weight is 0
  console.assert(limiter.allowRequest("user1", 1200) === true); // New window, count resets
});

Deno.test("Sliding Window Counter Rate Limiter - weighted calculation accuracy", () => {
  const limiter = problem_createSlidingWindowCounterRateLimiter(1000, 10);
  
  // Previous window: 8 requests
  for (let i = 0; i < 8; i++) {
    console.assert(limiter.allowRequest("user1", i * 100) === true);
  }
  
  // At 1500ms (50% into new window)
  // Previous: 8 * 0.5 = 4
  // Current: 0
  // Total: 4 (under limit)
  console.assert(limiter.allowRequest("user1", 1500) === true);
  console.assert(limiter.allowRequest("user1", 1501) === true);
  
  // Now have 2 in current window
  // Previous: 8 * 0.5 = 4
  // Current: 2
  // Total: 6
  console.assert(limiter.allowRequest("user1", 1502) === true);
  console.assert(limiter.allowRequest("user1", 1503) === true);
  console.assert(limiter.allowRequest("user1", 1504) === true);
  console.assert(limiter.allowRequest("user1", 1505) === true);
  
  // Total should be around 10, next should fail
  console.assert(limiter.allowRequest("user1", 1506) === false);
});

Deno.test("Sliding Window Counter Rate Limiter - multiple users", () => {
  const limiter = problem_createSlidingWindowCounterRateLimiter(1000, 3);
  
  // User 1
  console.assert(limiter.allowRequest("user1", 0) === true);
  console.assert(limiter.allowRequest("user1", 100) === true);
  console.assert(limiter.allowRequest("user1", 200) === true);
  console.assert(limiter.allowRequest("user1", 300) === false);
  
  // User 2 (independent)
  console.assert(limiter.allowRequest("user2", 50) === true);
  console.assert(limiter.allowRequest("user2", 150) === true);
  console.assert(limiter.allowRequest("user2", 250) === true);
  console.assert(limiter.allowRequest("user2", 350) === false);
});

Deno.test("Sliding Window Counter Rate Limiter - long time gaps", () => {
  const limiter = problem_createSlidingWindowCounterRateLimiter(1000, 5);
  
  console.assert(limiter.allowRequest("user1", 0) === true);
  console.assert(limiter.allowRequest("user1", 100) === true);
  
  // Jump multiple windows ahead
  console.assert(limiter.allowRequest("user1", 5000) === true);
  console.assert(limiter.allowRequest("user1", 5100) === true);
  console.assert(limiter.allowRequest("user1", 5200) === true);
  console.assert(limiter.allowRequest("user1", 5300) === true);
  console.assert(limiter.allowRequest("user1", 5400) === true);
  console.assert(limiter.allowRequest("user1", 5500) === false);
});