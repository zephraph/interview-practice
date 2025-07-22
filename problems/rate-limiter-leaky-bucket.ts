import { assertEquals } from "@std/assert";

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
  leakRatePerSecond: number,
): LeakyBucketRateLimiter {
  const userLimits = new Map<
    string,
    { lastLeakTime: number; queueSize: number }
  >();

  return {
    allowRequest(userId, timestamp) {
      const userLimit = userLimits.get(userId);

      if (!userLimit) {
        userLimits.set(userId, {
          lastLeakTime: timestamp,
          queueSize: 1,
        });
        return true;
      }

      // Calculate time elapsed since last leak processing
      const timeSinceLastLeak = timestamp - userLimit.lastLeakTime;

      // Calculate how many requests should leak based on time elapsed
      const requestsToLeak = Math.floor(
        (timeSinceLastLeak / 1000) * leakRatePerSecond,
      );

      // Apply the leaks to reduce queue size
      userLimit.queueSize = Math.max(0, userLimit.queueSize - requestsToLeak);

      // Update lastLeakTime to current timestamp when we leak
      if (requestsToLeak > 0) {
        userLimit.lastLeakTime = timestamp;
      }

      // Check if we can add the new request
      if (userLimit.queueSize < bucketCapacity) {
        userLimit.queueSize++;
        return true;
      }

      return false;
    },
  };
}

// Tests
Deno.test("Leaky Bucket Rate Limiter - basic functionality", () => {
  const limiter = problem_createLeakyBucketRateLimiter(5, 2); // 5 capacity, 2 requests/second leak

  // Fill the bucket
  for (let i = 0; i < 5; i++) {
    assertEquals(
      limiter.allowRequest("user1", 0),
      true,
      `Request ${i + 1} should be allowed when filling bucket`,
    );
  }
  assertEquals(
    limiter.allowRequest("user1", 0),
    false,
    "Request should be rejected when bucket is full",
  );

  // After 1 second, 2 requests should have leaked
  assertEquals(
    limiter.allowRequest("user1", 1000),
    true,
    "First request after 1 second should be allowed (2 leaked)",
  );
  assertEquals(
    limiter.allowRequest("user1", 1000),
    true,
    "Second request after 1 second should be allowed (2 leaked)",
  );
  assertEquals(
    limiter.allowRequest("user1", 1000),
    false,
    "Third request should be rejected (bucket full again)",
  );

  // After 2.5 seconds from start, 5 requests should have leaked total
  // We had 7 requests by this point (5 initial + 2 at t=1000)
  // So 7 - 5 = 2 remain, meaning we can add 3 more to reach capacity of 5
  for (let i = 0; i < 3; i++) {
    assertEquals(
      limiter.allowRequest("user1", 2500),
      true,
      `Request ${i + 1} should be allowed after 2.5 seconds (5 total leaked, 2 remain)`,
    );
  }
  assertEquals(
    limiter.allowRequest("user1", 2500),
    false,
    "Request should be rejected after filling bucket at 2.5 seconds",
  );
});

Deno.test("Leaky Bucket Rate Limiter - continuous leak", () => {
  const limiter = problem_createLeakyBucketRateLimiter(3, 1); // 3 capacity, 1 request/second

  // Add 3 requests
  assertEquals(
    limiter.allowRequest("user1", 0),
    true,
    "First request should be allowed",
  );
  assertEquals(
    limiter.allowRequest("user1", 0),
    true,
    "Second request should be allowed",
  );
  assertEquals(
    limiter.allowRequest("user1", 0),
    true,
    "Third request should be allowed (bucket full)",
  );

  // After 0.5 seconds, no space yet (leak happens at 1-second intervals)
  assertEquals(
    limiter.allowRequest("user1", 500),
    false,
    "Request at 0.5s should be rejected (no leak yet)",
  );

  // After 1 second, 1 request leaked
  assertEquals(
    limiter.allowRequest("user1", 1000),
    true,
    "Request at 1s should be allowed (1 leaked)",
  );
  assertEquals(
    limiter.allowRequest("user1", 1000),
    false,
    "Second request at 1s should be rejected (bucket full)",
  );

  // After 2 seconds, another leaked
  assertEquals(
    limiter.allowRequest("user1", 2000),
    true,
    "Request at 2s should be allowed (1 more leaked)",
  );
  assertEquals(
    limiter.allowRequest("user1", 2000),
    false,
    "Second request at 2s should be rejected (bucket full)",
  );

  // After 3 seconds, another leaked
  assertEquals(
    limiter.allowRequest("user1", 3000),
    true,
    "Request at 3s should be allowed (1 more leaked)",
  );
  assertEquals(
    limiter.allowRequest("user1", 3000),
    false,
    "Second request at 3s should be rejected (bucket full)",
  );
});

Deno.test("Leaky Bucket Rate Limiter - empty bucket behavior", () => {
  const limiter = problem_createLeakyBucketRateLimiter(5, 2);

  // Add one request
  assertEquals(
    limiter.allowRequest("user1", 0),
    true,
    "Initial request should be allowed",
  );

  // After 10 seconds, bucket should be empty
  // Should accept up to 5 new requests
  for (let i = 0; i < 5; i++) {
    assertEquals(
      limiter.allowRequest("user1", 10000),
      true,
      `Request ${i + 1} should be allowed after 10s (bucket emptied)`,
    );
  }
  assertEquals(
    limiter.allowRequest("user1", 10000),
    false,
    "6th request should be rejected (bucket full)",
  );
});

Deno.test("Leaky Bucket Rate Limiter - multiple users", () => {
  const limiter = problem_createLeakyBucketRateLimiter(2, 1);

  // User 1
  assertEquals(
    limiter.allowRequest("user1", 0),
    true,
    "User1: first request should be allowed",
  );
  assertEquals(
    limiter.allowRequest("user1", 0),
    true,
    "User1: second request should be allowed",
  );
  assertEquals(
    limiter.allowRequest("user1", 0),
    false,
    "User1: third request should be rejected (bucket full)",
  );

  // User 2 (independent bucket)
  assertEquals(
    limiter.allowRequest("user2", 0),
    true,
    "User2: first request should be allowed",
  );
  assertEquals(
    limiter.allowRequest("user2", 0),
    true,
    "User2: second request should be allowed",
  );
  assertEquals(
    limiter.allowRequest("user2", 0),
    false,
    "User2: third request should be rejected (bucket full)",
  );

  // After 1 second, both users can add 1 more
  assertEquals(
    limiter.allowRequest("user1", 1000),
    true,
    "User1: should allow 1 request after 1s (1 leaked)",
  );
  assertEquals(
    limiter.allowRequest("user1", 1000),
    false,
    "User1: second request at 1s should be rejected",
  );

  assertEquals(
    limiter.allowRequest("user2", 1000),
    true,
    "User2: should allow 1 request after 1s (1 leaked)",
  );
  assertEquals(
    limiter.allowRequest("user2", 1000),
    false,
    "User2: second request at 1s should be rejected",
  );
});

Deno.test("Leaky Bucket Rate Limiter - fractional leak rates", () => {
  const limiter = problem_createLeakyBucketRateLimiter(5, 0.5); // 0.5 requests/second

  // Fill bucket
  for (let i = 0; i < 5; i++) {
    assertEquals(
      limiter.allowRequest("user1", 0),
      true,
      `Request ${i + 1} should be allowed when filling bucket`,
    );
  }
  assertEquals(
    limiter.allowRequest("user1", 0),
    false,
    "6th request should be rejected (bucket full)",
  );

  // After 1 second, only 0.5 requests leaked (none completed)
  assertEquals(
    limiter.allowRequest("user1", 1000),
    false,
    "Request at 1s should be rejected (only 0.5 leaked, none completed)",
  );

  // After 2 seconds, 1 request leaked
  assertEquals(
    limiter.allowRequest("user1", 2000),
    true,
    "Request at 2s should be allowed (1 request leaked)",
  );
  assertEquals(
    limiter.allowRequest("user1", 2000),
    false,
    "Second request at 2s should be rejected (bucket full)",
  );

  // After 10 seconds, 5 requests total leaked (10s * 0.5/s = 5)
  // We had 6 requests by this point (5 initial + 1 at t=2000)
  // So 6 - 5 = 1 remains, meaning we can add 4 more to reach capacity of 5
  for (let i = 0; i < 4; i++) {
    assertEquals(
      limiter.allowRequest("user1", 10000),
      true,
      `Request ${i + 1} at 10s should be allowed (5 total leaked, 1 remains)`,
    );
  }
  assertEquals(
    limiter.allowRequest("user1", 10000),
    false,
    "5th request at 10s should be rejected (bucket full)",
  );
});

Deno.test("Leaky Bucket Rate Limiter - steady state throughput", () => {
  const limiter = problem_createLeakyBucketRateLimiter(10, 2); // 2 requests/second

  // Simulate steady traffic at exactly leak rate
  // Should always succeed as we match the leak rate
  for (let i = 0; i < 10; i++) {
    assertEquals(
      limiter.allowRequest("user1", i * 500),
      true,
      `Request ${i + 1} at ${i * 500}ms should be allowed (matches leak rate)`,
    ); // 2 per second
  }

  // Now burst 10 more - should fill the bucket
  for (let i = 0; i < 10; i++) {
    assertEquals(
      limiter.allowRequest("user1", 5000),
      true,
      `Burst request ${i + 1} at 5s should be allowed`,
    );
  }
  assertEquals(
    limiter.allowRequest("user1", 5000),
    false,
    "11th burst request should be rejected (bucket full)",
  );
});
