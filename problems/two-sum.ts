import { assertEquals } from "@std/assert";

/**
 * Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
 * You may assume that each input would have exactly one solution, and you may not use the same element twice.
 * You can return the answer in any order.
 */
function problem_twoSum(nums: number[], target: number): number[] {
  // TODO: Implement this function
  throw new Error("Not implemented");
}

Deno.test("twoSum - basic case", () => {
  const nums = [2, 7, 11, 15];
  const target = 9;
  const result = problem_twoSum(nums, target);
  assertEquals(nums[result[0]] + nums[result[1]], target);
});

Deno.test("twoSum - different order", () => {
  const nums = [3, 2, 4];
  const target = 6;
  const result = problem_twoSum(nums, target);
  assertEquals(nums[result[0]] + nums[result[1]], target);
});

Deno.test("twoSum - same number twice", () => {
  const nums = [3, 3];
  const target = 6;
  const result = problem_twoSum(nums, target);
  assertEquals(nums[result[0]] + nums[result[1]], target);
});

Deno.test("twoSum - negative numbers", () => {
  const nums = [-1, -2, -3, -4, -5];
  const target = -8;
  const result = problem_twoSum(nums, target);
  assertEquals(nums[result[0]] + nums[result[1]], target);
});

Deno.test("twoSum - larger array", () => {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const target = 17;
  const result = problem_twoSum(nums, target);
  assertEquals(nums[result[0]] + nums[result[1]], target);
});
