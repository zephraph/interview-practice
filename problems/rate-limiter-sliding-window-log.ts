/**
 * Implement a Sliding Window Log Rate Limiter
 * 
 * Sliding window log keeps a log of all request timestamps and counts
 * requests within the sliding window. This provides the most accurate
 * rate limiting but requires more memory to store timestamps.
 * 
 * Requirements:
 * - Store timestamps of all requests
 * - Count requests within the sliding window (current time - window size)
 * - Remove outdated timestamps to prevent memory growth
 * - Allow configurable window size and request limit
 * - Return true if request is allowed, false if rate limited
 * 
 * Example: With a 1-minute window and limit of 100:
 * - At 12:00:30, count all requests from 11:59:30 to 12:00:30
 * - At 12:01:00, count all requests from 12:00:00 to 12:01:00
 */

interface SlidingWindowLogRateLimiter {
  /**
   * Check if a request is allowed
   * @param userId - Unique identifier for the user/client
   * @param timestamp - Current timestamp in milliseconds
   * @returns true if request is allowed, false if rate limited
   */
  allowRequest(userId: string, timestamp: number): boolean;
}

function problem_createSlidingWindowLogRateLimiter(
  windowSizeMs: number,
  maxRequests: number
): SlidingWindowLogRateLimiter {
  // TODO: Implement this function
  throw new Error("Not implemented");
}

// Tests
Deno.test("Sliding Window Log Rate Limiter - basic functionality", () => {
  const limiter = problem_createSlidingWindowLogRateLimiter(1000, 3); // 1 second window, 3 requests max
  
  // Requests spread over time
  console.assert(limiter.allowRequest("user1", 0) === true);
  console.assert(limiter.allowRequest("user1", 300) === true);
  console.assert(limiter.allowRequest("user1", 600) === true);
  console.assert(limiter.allowRequest("user1", 900) === false); // 4th request within 1000ms
  
  // After some requests expire from window
  console.assert(limiter.allowRequest("user1", 1100) === true); // First request (at 0) is now outside window
  console.assert(limiter.allowRequest("user1", 1200) === false); // Still have 3 requests in window
  console.assert(limiter.allowRequest("user1", 1400) === true); // Request at 300 is now outside window
});

Deno.test("Sliding Window Log Rate Limiter - exact window boundaries", () => {
  const limiter = problem_createSlidingWindowLogRateLimiter(1000, 2);
  
  console.assert(limiter.allowRequest("user1", 0) === true);
  console.assert(limiter.allowRequest("user1", 500) === true);
  console.assert(limiter.allowRequest("user1", 999) === false); // All requests still in window
  console.assert(limiter.allowRequest("user1", 1000) === true); // First request exactly out of window
  console.assert(limiter.allowRequest("user1", 1499) === false); // Request at 500 still in window
  console.assert(limiter.allowRequest("user1", 1500) === true); // Request at 500 now out of window
});

Deno.test("Sliding Window Log Rate Limiter - multiple users", () => {
  const limiter = problem_createSlidingWindowLogRateLimiter(1000, 2);
  
  // User 1
  console.assert(limiter.allowRequest("user1", 0) === true);
  console.assert(limiter.allowRequest("user1", 100) === true);
  console.assert(limiter.allowRequest("user1", 200) === false);
  
  // User 2 (independent)
  console.assert(limiter.allowRequest("user2", 50) === true);
  console.assert(limiter.allowRequest("user2", 150) === true);
  console.assert(limiter.allowRequest("user2", 250) === false);
  
  // Back to user 1 after window slides
  console.assert(limiter.allowRequest("user1", 1100) === true);
});

Deno.test("Sliding Window Log Rate Limiter - memory cleanup", () => {
  const limiter = problem_createSlidingWindowLogRateLimiter(1000, 3);
  
  // Add many requests
  for (let i = 0; i < 3; i++) {
    console.assert(limiter.allowRequest("user1", i * 100) === true);
  }
  
  // Jump far ahead - old timestamps should be cleaned up
  console.assert(limiter.allowRequest("user1", 10000) === true);
  console.assert(limiter.allowRequest("user1", 10100) === true);
  console.assert(limiter.allowRequest("user1", 10200) === true);
  console.assert(limiter.allowRequest("user1", 10300) === false);
});

Deno.test("Sliding Window Log Rate Limiter - burst handling", () => {
  const limiter = problem_createSlidingWindowLogRateLimiter(5000, 5); // 5 second window, 5 requests
  
  // Burst of requests
  for (let i = 0; i < 5; i++) {
    console.assert(limiter.allowRequest("user1", 1000 + i) === true);
  }
  console.assert(limiter.allowRequest("user1", 1005) === false);
  
  // Still rate limited throughout the window
  console.assert(limiter.allowRequest("user1", 3000) === false);
  console.assert(limiter.allowRequest("user1", 5999) === false);
  
  // First request expires, one more allowed
  console.assert(limiter.allowRequest("user1", 6000) === true);
});