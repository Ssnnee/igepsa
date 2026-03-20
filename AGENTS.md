# AGENTS.md

This file contains essential information for agentic coding assistants working on the IGEPSA project. It includes build/lint/test commands, code style guidelines, and project conventions.

## Project Overview

IGEPSA is a Next.js application built with the T3 stack for managing administrative tasks in a Congolese educational institution. The tech stack includes:

- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Database**: SQLite with Drizzle ORM
- **API**: tRPC for type-safe API routes
- **Styling**: Tailwind CSS v4
- **Package Manager**: pnpm

## Build/Lint/Test Commands

### Development

```bash
# Start development server with Turbo
pnpm dev

# Start development server (standard)
next dev
```

### Build & Production

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Preview production build
pnpm preview
```

### Type Checking

```bash
# Type check only
pnpm typecheck

# Combined lint and type check
pnpm check
```

### Linting

```bash
# Lint code
pnpm lint

# Lint with auto-fix
pnpm lint:fix
```

### Formatting

```bash
# Check formatting
pnpm format:check

# Format code
pnpm format:write
```

### Database

```bash
# Generate migration files
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema changes (development)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

### Testing

**Note**: No test framework is currently configured. When adding tests:

- Use Vitest for unit tests (preferred for T3 stack)
- Use Playwright for E2E tests
- Place test files alongside source files with `.test.ts` extension
- Add test scripts to `package.json`

Example test commands (to be added):

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run a single test file
pnpm test -- path/to/file.test.ts

# Run E2E tests
pnpm test:e2e
```

## Code Style Guidelines

### TypeScript Configuration

- **Strict mode**: Enabled with `noUncheckedIndexedAccess`
- **Target**: ES2022
- **Module resolution**: Bundler (ESNext modules)
- **Path aliases**: `~/*` maps to `./src/*`

### Import Style

- Use type imports for TypeScript types: `import type { User } from '~/types'`
- Group imports by category:
  1. React imports
  2. External libraries
  3. Internal imports (using `~/` alias)
  4. Type imports

Example:

```typescript
import * as React from "react";
import { useState } from "react";
import { z } from "zod";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import type { RouterInputs } from "~/trpc/shared";
```

### Naming Conventions

#### Files and Directories

- **Components**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **Utilities**: camelCase (`utils.ts`, `cn.ts`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Types**: PascalCase with descriptive names (`User.ts`, `PostWithAuthor.ts`)
- **Directories**: kebab-case for route groups, camelCase for utility folders

#### Variables and Functions

- **camelCase** for variables, functions, and methods
- **PascalCase** for React components, types, and interfaces
- **UPPER_SNAKE_CASE** for constants
- **Prefix with `_`** for unused parameters in functions

### React Component Patterns

#### Component Structure

```typescript
interface ComponentProps {
  // Props interface
}

function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic

  return (
    // JSX
  )
}

export { Component }
```

#### Props with Variants (using class-variance-authority)

```typescript
import { cva, type VariantProps } from 'class-variance-authority'

const componentVariants = cva('base-classes', {
  variants: {
    variant: {
      default: 'default-classes',
      secondary: 'secondary-classes',
    },
    size: {
      sm: 'small-classes',
      lg: 'large-classes',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'sm',
  },
})

interface ComponentProps extends VariantProps<typeof componentVariants> {
  // Additional props
}

function Component({ variant, size, className, ...props }: ComponentProps) {
  return (
    <div
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

### Database Schema Patterns

#### Table Definition

```typescript
export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: d.text({ length: 256 }),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);
```

#### Database Queries

- Use Drizzle's query API for complex queries
- Prefer `findFirst()` over manual LIMIT 1
- Use proper ordering with `orderBy()`

### tRPC API Patterns

#### Router Structure

```typescript
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  getData: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Implementation
    }),

  createData: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),
});
```

#### Input Validation

- Always use Zod schemas for input validation
- Use descriptive error messages
- Chain validators for complex requirements

### Styling Conventions

#### Tailwind CSS

- Use Tailwind utility classes
- Combine with `cn()` utility for conditional classes
- Follow mobile-first responsive design
- Use CSS variables for theme colors

#### Component Styling

```typescript
import { cn } from '~/lib/utils'

interface ComponentProps {
  className?: string
}

function Component({ className, ...props }: ComponentProps) {
  return (
    <div
      className={cn('base-styles', className)}
      {...props}
    />
  )
}
```

### Error Handling

#### API Errors

- Use tRPC's built-in error handling
- Throw `TRPCError` for expected errors
- Use appropriate error codes

#### Database Errors

- Handle constraint violations gracefully
- Log unexpected database errors
- Use transactions for multi-step operations

#### UI Error Boundaries

- Implement error boundaries for critical components
- Show user-friendly error messages
- Log errors for debugging

### File Organization

```
src/
├── app/                    # Next.js app router
│   ├── (app)/             # Route groups
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   └── ...               # Feature components
├── lib/                  # Utilities and configurations
├── server/               # Server-side code
│   ├── api/             # tRPC routers
│   └── db/              # Database schema and config
├── styles/              # Global styles
├── trpc/               # tRPC configuration
└── env.js              # Environment variables
```

### ESLint Rules

Key ESLint rules specific to this project:

- `@typescript-eslint/consistent-type-imports`: Prefer inline type imports
- `@typescript-eslint/no-unused-vars`: Warn on unused vars, ignore prefixed with `_`
- `@typescript-eslint/no-misused-promises`: Strict promise handling
- `drizzle/enforce-delete-with-where`: Require WHERE clauses on DELETE operations
- `drizzle/enforce-update-with-where`: Require WHERE clauses on UPDATE operations

### Prettier Configuration

- Uses `prettier-plugin-tailwindcss` for Tailwind class sorting
- Default Prettier settings with Tailwind plugin

### Git Workflow

#### Commit Messages

- Follow conventional commits format
- Use present tense imperative mood
- Examples:
  - `feat: add user authentication`
  - `fix: resolve database connection issue`
  - `refactor: simplify component logic`

#### Branch Naming

- Use descriptive names with prefixes:
  - `feature/` for new features
  - `fix/` for bug fixes
  - `refactor/` for code refactoring
  - `docs/` for documentation updates

### Environment Variables

- Use `@t3-oss/env-nextjs` for type-safe environment variables
- Define all variables in `src/env.js`
- Use `.env.example` as a template

### Security Best Practices

- Never commit secrets or sensitive data
- Use environment variables for configuration
- Validate all user inputs with Zod schemas
- Implement proper authentication and authorization
- Use HTTPS in production
- Keep dependencies updated

### Performance Considerations

- Use React Server Components where possible
- Implement proper loading states
- Use tRPC prefetching for better UX
- Optimize images and assets
- Implement proper caching strategies
- Use database indexes for frequently queried fields

---

This document should be updated whenever project conventions change or new tools are added. All agents working on this codebase should follow these guidelines to maintain code consistency and quality.</content>
<parameter name="filePath">/home/sne/.coding/igepsa/AGENTS.md
