# Interview Practice

This project is set up for technical interview practice using Deno 2.4.2.

## Getting Started

This project uses [mise](https://mise.jdx.dev/) as the preferred way to interact with the repository. Mise will handle setting up the correct Deno version and environment.

### Prerequisites

Install mise if you haven't already:
```bash
curl https://mise.run | sh
```

### Setup

1. Clone the repository
2. Navigate to the project directory
3. Run `mise install` to install the correct Deno version
4. You're ready to go!

## Project Structure

- `problems/` - Directory containing all interview problems
- `solutions/` - Generated solutions from problem implementations
- `scripts/` - Utility scripts for analyzing and extracting solutions

Each problem file contains:
- An empty function wrapper representing the problem to implement (prefixed with `problem_`)
- A series of `Deno.test` tests that verify the solution
- Everything in a single file per problem

## Usage

### Running Tests

To run tests for a specific problem:
```bash
mise exec -- deno test problems/problem-name.ts
```

To run all tests:
```bash
mise exec -- deno test problems/
```

### Alternative (without mise)

If you prefer not to use mise, ensure you have Deno 2.4.2+ installed:

```bash
deno test problems/problem-name.ts  # Specific problem
deno test problems/                 # All problems
```

## Adding New Problems

1. Create a new file in the `problems/` directory
2. Add an empty function wrapper for the problem
3. Write comprehensive tests using `Deno.test`
4. Keep everything in a single file

## Requirements

- Deno 2.4.2 or later (automatically managed by mise)
- Only use dependencies from JSR or NPM (no HTTP package imports)
- Follow latest Deno best practices