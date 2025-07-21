#!/usr/bin/env -S deno run --allow-run --allow-read --allow-write

interface ProblemResult {
  file: string;
  name: string;
  passed: boolean;
  bigO?: {
    time: string;
    space: string;
    optimal: boolean;
    analysis: string;
  };
}

interface CacheEntry {
  hash: string;
  bigO: ProblemResult["bigO"];
}

interface Cache {
  [filePath: string]: CacheEntry;
}

const CACHE_FILE = ".analysis-cache.json";

async function getFileHash(filePath: string): Promise<string> {
  const content = await Deno.readTextFile(filePath);
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function loadCache(): Promise<Cache> {
  try {
    const cacheContent = await Deno.readTextFile(CACHE_FILE);
    return JSON.parse(cacheContent);
  } catch {
    return {};
  }
}

async function saveCache(cache: Cache): Promise<void> {
  await Deno.writeTextFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function runTests(problemFile: string): Promise<boolean> {
  const command = new Deno.Command("deno", {
    args: ["test", problemFile],
    stdout: "piped",
    stderr: "piped",
  });

  const { success } = await command.output();
  return success;
}

async function analyzeBigO(problemFile: string, cache: Cache): Promise<ProblemResult["bigO"]> {
  const fileHash = await getFileHash(problemFile);
  
  // Check cache first
  const cached = cache[problemFile];
  if (cached && cached.hash === fileHash) {
    return cached.bigO;
  }

  const code = await Deno.readTextFile(problemFile);
  
  const prompt = `Analyze the Big O complexity of this implementation. 
  
Code:
${code}

Please provide:
1. Time complexity (e.g., O(n), O(n log n), O(n²))
2. Space complexity (e.g., O(1), O(n))  
3. Whether this is optimal for this problem
4. Brief explanation of why

Format your response as JSON:
{
  "time": "O(n)",
  "space": "O(1)", 
  "optimal": true,
  "analysis": "This uses a hash map for O(1) lookups, making it optimal"
}`;

  const command = new Deno.Command("claude", {
    args: ["--print", prompt],
    stdout: "piped",
    stderr: "piped",
  });

  try {
    const { stdout } = await command.output();
    const response = new TextDecoder().decode(stdout);
    
    // Extract JSON from Claude's response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      
      // Cache the result
      cache[problemFile] = {
        hash: fileHash,
        bigO: result
      };
      
      return result;
    }
  } catch (error) {
    console.error(`Error analyzing ${problemFile}:`, error);
  }

  return undefined;
}

function getPerformanceColor(optimal: boolean | undefined): string {
  if (optimal === undefined) return "\x1b[37m"; // White
  if (optimal === true) return "\x1b[32m"; // Green
  // For now, treat non-optimal as red. Could add yellow for "close" later
  return "\x1b[31m"; // Red
}

function resetColor(): string {
  return "\x1b[0m";
}

async function main() {
  const problemsDir = "problems";
  const results: ProblemResult[] = [];
  const cache = await loadCache();

  try {
    for await (const entry of Deno.readDir(problemsDir)) {
      if (entry.isFile && entry.name.endsWith(".ts")) {
        const filePath = `${problemsDir}/${entry.name}`;
        const problemName = entry.name.replace(".ts", "");
        
        const passed = await runTests(filePath);
        
        const result: ProblemResult = {
          file: filePath,
          name: problemName,
          passed,
        };

        if (passed) {
          result.bigO = await analyzeBigO(filePath, cache);
        }

        results.push(result);
      }
    }
    
    // Save cache after processing all files
    await saveCache(cache);
  } catch (error) {
    console.error("Error reading problems directory:", error);
    Deno.exit(1);
  }

  // Display summary
  console.log("=".repeat(50));
  console.log("📊 PROBLEM ANALYSIS SUMMARY");
  console.log("=".repeat(50));

  for (const result of results) {
    if (!result.passed) {
      // Gray out non-passing problems
      console.log(`\x1b[90m❌ ${result.name}${resetColor()}`);
    } else if (result.bigO) {
      const color = getPerformanceColor(result.bigO.optimal);
      const optimalText = result.bigO.optimal ? "✅ OPTIMAL" : "⚠️  SUBOPTIMAL";
      
      console.log(`${color}✅ ${result.name}${resetColor()}`);
      console.log(`   Time: ${color}${result.bigO.time}${resetColor()}, Space: ${color}${result.bigO.space}${resetColor()}`);
      console.log(`   ${color}${optimalText}${resetColor()}`);
      console.log(`   ${result.bigO.analysis}`);
    } else {
      console.log(`✅ ${result.name} (analysis failed)`);
    }
    console.log();
  }

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const optimalCount = results.filter(r => r.bigO?.optimal === true).length;

  console.log(`📈 Results: ${passedCount}/${totalCount} passing, ${optimalCount} optimal`);
}

if (import.meta.main) {
  main();
}