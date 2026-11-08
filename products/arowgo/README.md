# AROWGO

> Think. Clear. Go.

A casual logic puzzle game where players clear directional arrow tiles from a board. An arrow can exit only if its path to the board boundary is unobstructed.

## Status

**Pre-production** — Sprint 0 (Foundation)

## Stack

- **Phaser 3** — 2D game framework
- **TypeScript** — type-safe game logic
- **Vite** — fast dev server and builds
- **Vitest** — unit testing

## Getting Started

```bash
# From the monorepo root
pnpm install

# From this directory
pnpm dev      # Start dev server on localhost:3000
pnpm build    # Production build
pnpm test     # Run unit tests
pnpm typecheck # Type checking
```

## Architecture

Game logic (systems/) is decoupled from rendering (scenes/) for testability.

```
src/
├── game/
│   ├── scenes/    # Phaser scenes (Boot, Menu, Game, Result)
│   ├── systems/   # Pure logic (PathChecker, MoveResolver, etc.)
│   └── objects/   # Game objects (ArrowTile, GridCell)
├── data/          # TypeScript types and interfaces
├── services/      # SaveManager, AudioManager
├── config/        # Game and Phaser configuration
└── main.ts        # Entry point
```

## Level Format

Levels are data-driven via `public/levels/levels.json`. See `src/data/types.ts` for the schema.

## Part of [Veyminore](../../README.md)
