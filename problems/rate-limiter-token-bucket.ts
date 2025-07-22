import { assert } from "@std/assert";

/**
 * Implement a Token Bucket Rate Limiter
 * 
 * Token bucket algorithm allows for burst traffic while maintaining
 * an average rate limit. Tokens are added to the bucket at a constant
 * rate. Each request consumes a token. If no tokens are available,
 * the request is rejected.
 * 
 * Requirements:
 * - Start with a bucket of configurable capacity
 * - Add tokens at a configurable rate (tokens per second)
 * - Each request consumes one token
 * - Bucket has maximum capacity (cannot exceed even if unused)
 * - Calculate tokens based on time elapsed since last request
 * - Support burst traffic up to bucket capacity
 * - Return true if request is allowed, false if rate limited
 * 
 * Example: Bucket capacity 10, refill rate 2 tokens/second:
 * - Start with 10 tokens
 * - 5 rapid requests consume 5 tokens (5 remaining)
 * - After 3 seconds: 5 + (2 * 3) = 10 tokens (capped at capacity)
 * - 12 rapid requests: first 10 succeed, last 2 fail
 */

interface TokenBucketRateLimiter {
  /**
   * Check if a request is allowed
   * @param userId - Unique identifier for the user/client
   * @param timestamp - Current timestamp in milliseconds
   * @returns true if request is allowed, false if rate limited
   */
  allowRequest(userId: string, timestamp: number): boolean;
}

function problem_createTokenBucketRateLimiter(
  bucketCapacity: number,
  refillRatePerSecond: number
): TokenBucketRateLimiter {
  // TODO: Implement this function
  throw new Error("Not implemented");
}

// Tests
Deno.test("Token Bucket Rate Limiter - basic functionality", () => {
  const limiter = problem_createTokenBucketRateLimiter(10, 2); // 10 token capacity, 2 tokens/second
  
  // Initial burst - bucket starts full
  for (let i = 0; i < 10; i++) {
    assert(limiter.allowRequest("user1", 0) === true);
  }
  assert(limiter.allowRequest("user1", 0) === false); // Bucket empty
  
  // After 1 second, 2 tokens refilled
  assert(limiter.allowRequest("user1", 1000) === true);
  assert(limiter.allowRequest("user1", 1000) === true);
  assert(limiter.allowRequest("user1", 1000) === false);
  
  // After 5 more seconds, 10 tokens refilled (capped at capacity)
  for (let i = 0; i < 10; i++) {
    assert(limiter.allowRequest("user1", 6000) === true);
  }
  assert(limiter.allowRequest("user1", 6000) === false);
});

Deno.test("Token Bucket Rate Limiter - refill calculation", () => {
  const limiter = problem_createTokenBucketRateLimiter(5, 1); // 5 token capacity, 1 token/second
  
  // Use all tokens
  for (let i = 0; i < 5; i++) {
    assert(limiter.allowRequest("user1", 0) === true);
  }
  
  // Partial refill after 0.5 seconds (should have 0 tokens, not enough for a request)
  assert(limiter.allowRequest("user1", 500) === false);
  
  // After 1.5 seconds total, should have 1 token
  assert(limiter.allowRequest("user1", 1500) === true);
  assert(limiter.allowRequest("user1", 1500) === false);
  
  // After 2.5 more seconds (4 seconds total), should have 2 tokens
  assert(limiter.allowRequest("user1", 4000) === true);
  assert(limiter.allowRequest("user1", 4000) === true);
  assert(limiter.allowRequest("user1", 4000) === false);
});

Deno.test("Token Bucket Rate Limiter - capacity cap", () => {
  const limiter = problem_createTokenBucketRateLimiter(3, 2); // 3 token capacity, 2 tokens/second
  
  // Don't use any tokens for 10 seconds
  // Should still have only 3 tokens (not 20)
  assert(limiter.allowRequest("user1", 10000) === true);
  assert(limiter.allowRequest("user1", 10000) === true);
  assert(limiter.allowRequest("user1", 10000) === true);
  assert(limiter.allowRequest("user1", 10000) === false);
});

Deno.test("Token Bucket Rate Limiter - multiple users", () => {
  const limiter = problem_createTokenBucketRateLimiter(3, 1);
  
  // User 1 uses all tokens
  assert(limiter.allowRequest("user1", 0) === true);
  assert(limiter.allowRequest("user1", 0) === true);
  assert(limiter.allowRequest("user1", 0) === true);
  assert(limiter.allowRequest("user1", 0) === false);
  
  // User 2 has full bucket
  assert(limiter.allowRequest("user2", 0) === true);
  assert(limiter.allowRequest("user2", 0) === true);
  assert(limiter.allowRequest("user2", 0) === true);
  assert(limiter.allowRequest("user2", 0) === false);
  
  // After 2 seconds, both users get 2 tokens
  assert(limiter.allowRequest("user1", 2000) === true);
  assert(limiter.allowRequest("user1", 2000) === true);
  assert(limiter.allowRequest("user1", 2000) === false);
  
  assert(limiter.allowRequest("user2", 2000) === true);
  assert(limiter.allowRequest("user2", 2000) === true);
  assert(limiter.allowRequest("user2", 2000) === false);
});

Deno.test("Token Bucket Rate Limiter - fractional tokens", () => {
  const limiter = problem_createTokenBucketRateLimiter(10, 0.5); // 0.5 tokens/second
  
  // Use all tokens
  for (let i = 0; i < 10; i++) {
    assert(limiter.allowRequest("user1", 0) === true);
  }
  
  // After 1 second, should have 0.5 tokens (not enough)
  assert(limiter.allowRequest("user1", 1000) === false);
  
  // After 2 seconds, should have 1 token
  assert(limiter.allowRequest("user1", 2000) === true);
  assert(limiter.allowRequest("user1", 2000) === false);
  
  // After 10 more seconds (12 total), should have 5 tokens
  for (let i = 0; i < 5; i++) {
    assert(limiter.allowRequest("user1", 12000) === true);
  }
  assert(limiter.allowRequest("user1", 12000) === false);
});