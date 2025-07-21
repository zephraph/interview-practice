# Interview Practice Project

This project is set up for technical interview practice using Deno 2.4.2.

## Project Structure

- `problems/` - Directory containing all interview problems
- Each problem file contains:
  - An empty function wrapper representing the problem to implement. The function name should be prefixed with `problem_`.
  - A series of `Deno.test` tests that verify the solution
  - Everything in a single file per problem

## Requirements

- Deno 2.4.2 or later
- Only use dependencies from JSR or NPM (no HTTP package imports)
- Follow latest Deno best practices

## Usage

To run tests for a specific problem:
```bash
deno test problems/problem-name.ts
```

To run all tests:
```bash
deno test problems/
```

## Adding New Problems

1. Create a new file in the `problems/` directory
2. Add an empty function wrapper for the problem
3. Write comprehensive tests using `Deno.test`
4. Keep everything in a single file

## Problem Implementation Guidelines

- All problems should start with a `throw new Error("Not implemented")` statement somewhere in it.