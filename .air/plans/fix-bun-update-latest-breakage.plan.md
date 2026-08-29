# Plan: Fix Broken Application After `bun update --latest`

## 1. Goal
Restore the application to a working state by reverting the incompatible dependency updates introduced by `bun update --latest`, restoring `bun.lock`, and verifying that `bun run typecheck` and `bun dev` execute cleanly.

## 2. Approach
Running `bun update --latest` updated project dependencies to invalid or breaking major versions (such as `typescript: 7.0.2`, `next: 16.2.10`, and breaking releases for `lucide-react`, `axios`, `react-day-picker`, `ai`, `zod`, and `prisma`). In addition, it deleted `bun.lock` and created `package-lock.json`. When Next.js started, it detected `package-lock.json`, attempted to use `npm install -D typescript`, and got stuck in a loop because `typescript: 7.0.2` is not a valid TypeScript release.

To fix this, we will:
1. Revert `package.json` [package.json](air-file://77flb57195fc1g0uq6p9/D%3A/projects/api-client/package.json?type=file&root=D%3A), `next.config.ts` [next.config.ts](air-file://77flb57195fc1g0uq6p9/D%3A/projects/api-client/next.config.ts?type=file&root=D%3A), and `biome.json` [biome.json](air-file://77flb57195fc1g0uq6p9/D%3A/projects/api-client/biome.json?type=file&root=D%3A) back to `HEAD`.
2. Delete the untracked `package-lock.json`.
3. Run `bun install` to reinstall node_modules and regenerate `bun.lock`.
4. Run `bun run db:generate` to regenerate Prisma client.
5. Verify `bun run typecheck` and test starting `bun dev`.

## 3. File Changes

- `package.json` [package.json](air-file://77flb57195fc1g0uq6p9/D%3A/projects/api-client/package.json?type=file&root=D%3A) (**Modify** / Revert to `HEAD`): Restore original dependency versions.
- `next.config.ts` [next.config.ts](air-file://77flb57195fc1g0uq6p9/D%3A/projects/api-client/next.config.ts?type=file&root=D%3A) (**Modify** / Revert to `HEAD`): Restore original Next.js configuration.
- `biome.json` [biome.json](air-file://77flb57195fc1g0uq6p9/D%3A/projects/api-client/biome.json?type=file&root=D%3A) (**Modify** / Revert to `HEAD`): Restore original Biome configuration.
- `package-lock.json` (**Delete**): Remove untracked npm lockfile.
- `bun.lock` (**Create**): Re-generated automatically by `bun install`.

## 4. Implementation Steps

### Task 1: Revert configuration files and remove npm lockfile
- Execute `git checkout HEAD -- package.json next.config.ts biome.json` to restore files.
- Delete `package-lock.json`.

### Task 2: Reinstall dependencies and generate Prisma client
- Run `bun install` to reinstall valid dependency versions and create `bun.lock`.
- Run `bun run db:generate` to generate Prisma client bindings.

### Task 3: Validate application build and type checking
- Run `bun run typecheck` to confirm zero TypeScript compilation errors.
- Start `bun dev` briefly to confirm Next.js starts cleanly without prompting for missing packages.

## 5. Acceptance Criteria
- [ ] `package.json` contains original dependency definitions (e.g. `typescript: ^5.9.3`, `next: 16.2.1`).
- [ ] `package-lock.json` is removed and `bun.lock` is created.
- [ ] `bun install` executes successfully.
- [ ] `bun run db:generate` completes without errors.
- [ ] `bun run typecheck` passes with exit code 0 and no TypeScript errors.
- [ ] `bun dev` starts without getting stuck or invoking npm.

## 6. Verification Steps
- Run `bun run typecheck` and verify exit code 0.
- Run `bun dev` and verify dev server readiness.

## 7. Risks & Mitigations
- **Risk**: Residual compiled output or stale dependencies in `node_modules` or `.next`.
- **Mitigation**: If installation errors occur, clear `node_modules` and `.next` before running `bun install`.
