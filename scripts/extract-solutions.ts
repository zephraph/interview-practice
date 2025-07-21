#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

import { parse } from "jsr:@std/path";
import { exists } from "jsr:@std/fs";

interface SolutionCache {
  [problemPath: string]: {
    hash: string;
    solutionPath: string;
  };
}

const SOLUTION_CACHE_FILE = ".solution-cache.json";

async function getFileHash(filePath: string): Promise<string> {
  const content = await Deno.readTextFile(filePath);
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function loadSolutionCache(): Promise<SolutionCache> {
  try {
    const cacheContent = await Deno.readTextFile(SOLUTION_CACHE_FILE);
    return JSON.parse(cacheContent);
  } catch {
    return {};
  }
}

async function saveSolutionCache(cache: SolutionCache): Promise<void> {
  await Deno.writeTextFile(SOLUTION_CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function findProblemFiles(): Promise<string[]> {
  const problemFiles: string[] = [];
  
  for await (const dirEntry of Deno.readDir("problems")) {
    if (dirEntry.isFile && dirEntry.name.endsWith(".ts")) {
      problemFiles.push(`problems/${dirEntry.name}`);
    }
  }
  
  return problemFiles;
}

async function runTests(filePath: string): Promise<boolean> {
  const cmd = new Deno.Command("deno", {
    args: ["test", filePath],
    stdout: "piped",
    stderr: "piped",
  });
  
  const { success } = await cmd.output();
  return success;
}

async function resetProblemToThrow(problemPath: string, originalContent: string) {
  const resetContent = originalContent.replace(
    /^(function problem_\w+\([^)]*\): [^{]+ \{)[\s\S]*?^(\})/gm,
    (match, funcStart, funcEnd) => {
      return `${funcStart}
  // TODO: Implement this function
  throw new Error("Not implemented");
${funcEnd}`;
    }
  );
  
  await Deno.writeTextFile(problemPath, resetContent);
  console.log(`Reset problem: ${problemPath}`);
}

async function extractSolution(problemPath: string, cache: SolutionCache) {
  const content = await Deno.readTextFile(problemPath);
  const { name } = parse(problemPath);
  
  console.log(`Processing: ${problemPath}`);
  
  // Check if we've already extracted this exact solution
  const currentHash = await getFileHash(problemPath);
  const cached = cache[problemPath];
  
  if (cached && cached.hash === currentHash) {
    console.log(`Solution already extracted: ${cached.solutionPath}`);
    return cached.solutionPath;
  }
  
  // Run tests to see if the solution works
  const testsPass = await runTests(problemPath);
  
  if (!testsPass) {
    console.log(`Tests failed for ${problemPath}, skipping`);
    return null;
  }
  
  console.log(`Tests pass for ${problemPath}, saving as solution`);
  
  // Generate unique solution filename with truncated hash (first 8 chars)
  const truncatedHash = currentHash.substring(0, 8);
  const solutionPath = `solutions/${name}-${truncatedHash}.ts`;
  
  // Copy the solved problem to solutions directory
  await Deno.writeTextFile(solutionPath, content);
  console.log(`Copied solution to: ${solutionPath}`);
  
  // Update cache with new solution
  cache[problemPath] = {
    hash: currentHash,
    solutionPath: solutionPath
  };
  
  // Reset the problem to just the function signature with throw
  await resetProblemToThrow(problemPath, content);
  
  // Stage both files with git
  const gitAdd = new Deno.Command("git", {
    args: ["add", problemPath, solutionPath],
    stdout: "piped",
    stderr: "piped",
  });
  
  const { success } = await gitAdd.output();
  if (success) {
    console.log(`Staged files: ${problemPath}, ${solutionPath}`);
  } else {
    console.warn("Failed to stage files with git");
  }
  
  return solutionPath;
}

async function main() {
  try {
    // Check if solutions directory exists, create if not
    if (!(await exists("solutions"))) {
      await Deno.mkdir("solutions", { recursive: true });
    }
    
    const cache = await loadSolutionCache();
    const problemFiles = await findProblemFiles();
    
    if (problemFiles.length === 0) {
      console.log("No problem files found.");
      return;
    }
    
    console.log(`Found ${problemFiles.length} problem file(s), checking for solutions...`);
    
    let extractedCount = 0;
    for (const problemPath of problemFiles) {
      const result = await extractSolution(problemPath, cache);
      if (result) {
        extractedCount++;
      }
    }
    
    console.log(`\nExtracted ${extractedCount} solution(s).`);
    
    // Save cache after processing all problems
    await saveSolutionCache(cache);
    
  } catch (error) {
    console.error("Error:", error.message);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}