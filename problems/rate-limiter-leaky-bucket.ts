/**
 * Implement a Leaky Bucket Rate Limiter
 * 
 * Leaky bucket algorithm processes requests at a constant rate,
 * regardless of burst traffic. Incoming requests are added to a queue
 * (bucket) and processed at a fixed rate (leak rate). If the bucket
 * is full, new requests are rejected.
 * 
 * Requirements:
 * - Maintain a queue of requests (with timestamps)
 * - Process/leak requests at a constant rate
 * - Queue has maximum capacity
 * - New requests are rejected if queue is full
 * - Process queued requests based on leak rate before checking new ones
 * - Return true if request can be queued/processed, false if rejected
 * 
 * Example: Bucket capacity 10, leak rate 2 requests/second:
 * - 15 requests arrive instantly
 * - First 10 are queued, last 5 rejected
 * - After 1 second: 2 requests processed, 8 in queue
 * - 2 new requests can now be added
 * - Ensures steady output rate regardless of input pattern
 */

interface LeakyBucketRateLimiter {
  /**
   * Check if a request is allowed
   * @param userId - Unique identifier for the user/client
   * @param timestamp - Current timestamp in milliseconds
   * @returns true if request can be queued/processed, false if rejected
   */
  allowRequest(userId: string, timestamp: number): boolean;
}

function problem_createLeakyBucketRateLimiter(
  bucketCapacity: number,
  leakRatePerSecond: number
): LeakyBucketRateLimiter {
  // TODO: Implement this function
  throw new Error("Not implemented");
}

// Tests
Deno.test("Leaky Bucket Rate Limiter - basic functionality", () => {
  const limiter = problem_createLeakyBucketRateLimiter(5, 2); // 5 capacity, 2 requests/second leak
  
  // Fill the bucket
  for (let i = 0; i < 5; i++) {
    console.assert(limiter.allowRequest("user1", 0) === true);
  }
  console.assert(limiter.allowRequest("user1", 0) === false); // Bucket full
  
  // After 1 second, 2 requests should have leaked
  console.assert(limiter.allowRequest("user1", 1000) === true);
  console.assert(limiter.allowRequest("user1", 1000) === true);
  console.assert(limiter.allowRequest("user1", 1000) === false); // Bucket full again
  
  // After 2.5 seconds from start, 5 requests should have leaked
  for (let i = 0; i < 5; i++) {
    console.assert(limiter.allowRequest("user1", 2500) === true);
  }
  console.assert(limiter.allowRequest("user1", 2500) === false);
});

Deno.test("Leaky Bucket Rate Limiter - continuous leak", () => {
  const limiter = problem_createLeakyBucketRateLimiter(3, 1); // 3 capacity, 1 request/second
  
  // Add 3 requests
  console.assert(limiter.allowRequest("user1", 0) === true);
  console.assert(limiter.allowRequest("user1", 0) === true);
  console.assert(limiter.allowRequest("user1", 0) === true);
  
  // After 0.5 seconds, no space yet (leak happens at 1-second intervals)
  console.assert(limiter.allowRequest("user1", 500) === false);
  
  // After 1 second, 1 request leaked
  console.assert(limiter.allowRequest("user1", 1000) === true);
  console.assert(limiter.allowRequest("user1", 1000) === false);
  
  // After 2 seconds, another leaked
  console.assert(limiter.allowRequest("user1", 2000) === true);
  console.assert(limiter.allowRequest("user1", 2000) === false);
  
  // After 3 seconds, another leaked
  console.assert(limiter.allowRequest("user1", 3000) === true);
  console.assert(limiter.allowRequest("user1", 3000) === false);
});

Deno.test("Leaky Bucket Rate Limiter - empty bucket behavior", () => {
  const limiter = problem_createLeakyBucketRateLimiter(5, 2);
  
  // Add one request
  console.assert(limiter.allowRequest("user1", 0) === true);
  
  // After 10 seconds, bucket should be empty
  // Should accept up to 5 new requests
  for (let i = 0; i < 5; i++) {
    console.assert(limiter.allowRequest("user1", 10000) === true);
  }
  console.assert(limiter.allowRequest("user1", 10000) === false);
});

Deno.test("Leaky Bucket Rate Limiter - multiple users", () => {
  const limiter = problem_createLeakyBucketRateLimiter(2, 1);
  
  // User 1
  console.assert(limiter.allowRequest("user1", 0) === true);
  console.assert(limiter.allowRequest("user1", 0) === true);
  console.assert(limiter.allowRequest("user1", 0) === false);
  
  // User 2 (independent bucket)
  console.assert(limiter.allowRequest("user2", 0) === true);
  console.assert(limiter.allowRequest("user2", 0) === true);
  console.assert(limiter.allowRequest("user2", 0) === false);
  
  // After 1 second, both users can add 1 more
  console.assert(limiter.allowRequest("user1", 1000) === true);
  console.assert(limiter.allowRequest("user1", 1000) === false);
  
  console.assert(limiter.allowRequest("user2", 1000) === true);
  console.assert(limiter.allowRequest("user2", 1000) === false);
});

Deno.test("Leaky Bucket Rate Limiter - fractional leak rates", () => {
  const limiter = problem_createLeakyBucketRateLimiter(5, 0.5); // 0.5 requests/second
  
  // Fill bucket
  for (let i = 0; i < 5; i++) {
    console.assert(limiter.allowRequest("user1", 0) === true);
  }
  console.assert(limiter.allowRequest("user1", 0) === false);
  
  // After 1 second, only 0.5 requests leaked (none completed)
  console.assert(limiter.allowRequest("user1", 1000) === false);
  
  // After 2 seconds, 1 request leaked
  console.assert(limiter.allowRequest("user1", 2000) === true);
  console.assert(limiter.allowRequest("user1", 2000) === false);
  
  // After 10 seconds, 5 requests leaked (2.5 leaked, but we had 5 queued)
  for (let i = 0; i < 5; i++) {
    console.assert(limiter.allowRequest("user1", 10000) === true);
  }
  console.assert(limiter.allowRequest("user1", 10000) === false);
});

Deno.test("Leaky Bucket Rate Limiter - steady state throughput", () => {
  const limiter = problem_createLeakyBucketRateLimiter(10, 2); // 2 requests/second
  
  // Simulate steady traffic at exactly leak rate
  // Should always succeed as we match the leak rate
  for (let i = 0; i < 10; i++) {
    console.assert(limiter.allowRequest("user1", i * 500) === true); // 2 per second
  }
  
  // Now burst 10 more - should fill the bucket
  for (let i = 0; i < 10; i++) {
    console.assert(limiter.allowRequest("user1", 5000) === true);
  }
  console.assert(limiter.allowRequest("user1", 5000) === false);
});