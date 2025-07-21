/**
 * Implement a Fixed Window Rate Limiter
 * 
 * Fixed window rate limiting divides time into fixed-size windows and tracks
 * the number of requests in each window. If the limit is exceeded within a
 * window, subsequent requests are rejected until the next window begins.
 * 
 * Requirements:
 * - Track requests per fixed time window
 * - Allow configurable window size and request limit
 * - Return true if request is allowed, false if rate limited
 * - Handle concurrent requests correctly
 * 
 * Example: With a 1-minute window and limit of 100:
 * - Requests 1-100 in first minute: all allowed
 * - Request 101 in first minute: rejected
 * - Request 102 at start of second minute: allowed (new window)
 */

interface FixedWindowRateLimiter {
  /**
   * Check if a request is allowed
   * @param userId - Unique identifier for the user/client
   * @param timestamp - Current timestamp in milliseconds
   * @returns true if request is allowed, false if rate limited
   */
  allowRequest(userId: string, timestamp: number): boolean;
}

function problem_createFixedWindowRateLimiter(
  windowSizeMs: number,
  maxRequests: number
): FixedWindowRateLimiter {
  // TODO: Implement this function
  throw new Error("Not implemented");
}

// Tests
Deno.test("Fixed Window Rate Limiter - basic functionality", () => {
  const limiter = problem_createFixedWindowRateLimiter(1000, 3); // 1 second window, 3 requests max
  
  // First window: requests should be allowed up to limit
  console.assert(limiter.allowRequest("user1", 0) === true);
  console.assert(limiter.allowRequest("user1", 100) === true);
  console.assert(limiter.allowRequest("user1", 200) === true);
  console.assert(limiter.allowRequest("user1", 300) === false); // Exceeds limit
  console.assert(limiter.allowRequest("user1", 900) === false); // Still in same window
  
  // New window: counter should reset
  console.assert(limiter.allowRequest("user1", 1000) === true);
  console.assert(limiter.allowRequest("user1", 1100) === true);
  console.assert(limiter.allowRequest("user1", 1200) === true);
  console.assert(limiter.allowRequest("user1", 1300) === false);
});

Deno.test("Fixed Window Rate Limiter - multiple users", () => {
  const limiter = problem_createFixedWindowRateLimiter(1000, 2);
  
  // Different users have independent limits
  console.assert(limiter.allowRequest("user1", 0) === true);
  console.assert(limiter.allowRequest("user1", 100) === true);
  console.assert(limiter.allowRequest("user1", 200) === false);
  
  console.assert(limiter.allowRequest("user2", 50) === true);
  console.assert(limiter.allowRequest("user2", 150) === true);
  console.assert(limiter.allowRequest("user2", 250) === false);
});

Deno.test("Fixed Window Rate Limiter - window boundaries", () => {
  const limiter = problem_createFixedWindowRateLimiter(5000, 1); // 5 second window, 1 request
  
  // Test exact window boundaries
  console.assert(limiter.allowRequest("user1", 0) === true);
  console.assert(limiter.allowRequest("user1", 4999) === false); // Still in first window
  console.assert(limiter.allowRequest("user1", 5000) === true); // New window starts
  console.assert(limiter.allowRequest("user1", 9999) === false);
  console.assert(limiter.allowRequest("user1", 10000) === true); // Third window
});

Deno.test("Fixed Window Rate Limiter - cleanup old windows", () => {
  const limiter = problem_createFixedWindowRateLimiter(1000, 2);
  
  // Simulate long time gaps to test memory cleanup
  console.assert(limiter.allowRequest("user1", 0) === true);
  console.assert(limiter.allowRequest("user1", 100) === true);
  
  // Jump far ahead in time
  console.assert(limiter.allowRequest("user1", 100000) === true);
  console.assert(limiter.allowRequest("user1", 100100) === true);
  console.assert(limiter.allowRequest("user1", 100200) === false);
});