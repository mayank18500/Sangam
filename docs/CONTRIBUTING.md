# Contributing & Engineering Standards — SANGAM

**Product Name:** Sangam  
**Tagline:** Where Travel Inventory Comes Together  
**Document Version:** 1.1.0  
**Status:** Active Engineering Guide  
**Last Updated:** November 2026  
**Related Documents:** [SETUP.md](SETUP.md) • [ARCHITECTURE.md](ARCHITECTURE.md) • [ROADMAP.md](ROADMAP.md)

---

## 1. Development Workflow & Git Branching Strategy

Sangam enforces a structured GitFlow-inspired branching model to allow three or more developers to work simultaneously without merge conflicts or broken mainline builds.

### 1.1 Branch Hierarchy
```
main (Production / Tagged Releases)
  │
  └── develop (Shared Integration & Staging)
       │
       ├── feature/frontend-<feature-name>      # Member 1 (UI / Client)
       ├── feature/backend-<feature-name>       # Member 2 (Express / Database)
       ├── feature/intelligence-<feature-name>  # Member 3 (FastAPI / Matching Engine)
       └── bugfix/<ticket-or-issue-name>        # Hotfixes
```

### 1.2 Core Branch Rules
1. **Never commit directly to `main` or `develop`:** All work must be conducted in dedicated feature branches branched off `develop`.
2. **Submit PRs to `develop`:** Pull requests must target `develop`. Merges into `main` occur only at release milestones after full automated test verification.
3. **Branch Syncing:** Before submitting a Pull Request, rebase or merge the latest changes from `develop` into your feature branch to resolve any conflicting changes.

---

## 2. Branch Naming & Commit Message Conventions

### 2.1 Branch Naming Scheme
Use lowercase with forward slashes and hyphens:
- `feature/frontend-<description>` (e.g., `feature/frontend-recharts-overlap`)
- `feature/backend-<description>` (e.g., `feature/backend-hotel-import-pagination`)
- `feature/intelligence-<description>` (e.g., `feature/intelligence-haversine-decay`)
- `bugfix/<description>` (e.g., `bugfix/fix-null-city-mismatch`)
- `docs/<description>` (e.g., `docs/update-api-reference`)

### 2.2 Conventional Commits Specification
Commits must adhere to the Conventional Commits specification:
```
<type>(<scope>): <short imperative summary>

[optional detailed description]

[optional issue reference]
```

#### Allowed Types:
- `feat`: A new user-facing or API feature.
- `fix`: A bug fix in existing logic.
- `docs`: Documentation additions or revisions.
- `style`: Formatting, missing semicolons, whitespace (no logic changes).
- `refactor`: Code reorganization that neither adds a feature nor fixes a bug.
- `perf`: Code changes improving computational performance.
- `test`: Adding or refactoring automated tests.
- `chore`: Build scripts, dependencies, configuration tweaks.

#### Examples:
```bash
git commit -m "feat(matching): add haversine distance decay to entity matcher"
git commit -m "fix(server): handle null star rating in canonical entity detail"
git commit -m "docs(api): document multi-criteria offer ranking endpoint"
```

---

## 3. Pull Request & Code Review Process

1. **Self-Review Checklist Before Opening PR:**
   - [ ] All new and existing tests pass (`npm test` in `server`, `pytest` in `intelligence`).
   - [ ] TypeScript compiles cleanly without errors (`npm run build` in `client` and `server`).
   - [ ] No hardcoded secrets, private keys, or environment URLs committed.
   - [ ] No destructive schema alterations without backwards compatibility.
2. **Pull Request Description Template:**
   - **Summary of Changes:** What was implemented and why?
   - **Service Affected:** Client, Server, or Intelligence?
   - **Testing Conducted:** Exact commands executed and output summary.
   - **Screenshots / CLI Output:** For UI updates, attach preview captures.
3. **Review Requirements:**
   - Every PR requires at least one approval from another team member before merging.
   - Squash-and-merge is preferred to maintain a clean linear commit history on `develop`.

---

## 4. TypeScript & Node.js Coding Standards

Applicable to `client/` and `server/`:

1. **Strict Type Checking:**
   - `strict: true` is enforced across all `tsconfig.json` configurations.
   - Avoid `any` whenever possible. Use explicit interfaces or generics.
   - Prefix unused parameters with an underscore (e.g., `_req: Request`).
2. **Schema Validation:**
   - All inbound controller parameters must be validated with Zod schemas.
   - Avoid manual type assertions (`as Type`) when parsing HTTP bodies.
3. **Error Handling:**
   - Never silence errors with empty `catch` blocks.
   - Pass exceptions to Express `next(err)` to trigger centralized handling in `errorHandler.ts`.
4. **File Naming:**
   - React components and pages: `PascalCase.tsx` (e.g., `SuppliersPage.tsx`).
   - Utility and module files: `camelCase.ts` (e.g., `supplierService.ts`).
   - Routes and controllers: `kebab-case.routes.ts` or `<domain>.routes.ts`.

---

## 5. Python & FastAPI Coding Standards

Applicable to `intelligence/`:

1. **Type Annotations & Validation:**
   - Every function signature must have explicit type annotations for parameters and return types.
   - Use Pydantic v2 `BaseModel` for all request and response schemas.
2. **Deterministic Computations:**
   - Floating-point calculations (scores, distances) must be explicitly rounded (`round(score, 4)`) to avoid arbitrary decimal discrepancies across platforms.
   - Bounded values must use `max(0.0, min(1.0, val))` to ensure probability constraints.
3. **Clean Code & Formatting:**
   - Follow PEP 8 style guidelines.
   - Keep module imports grouped: standard library, third-party libraries, local app modules.

---

## 6. Database Migration & Schema Guidelines

1. **Non-Destructive Principle:**
   - Never drop tables or columns holding raw supplier data (`rawData`, `externalId`).
   - Use nullable foreign keys for unconfirmed associations (`canonicalEntityId String?`).
2. **Schema Alterations:**
   - Modify `server/prisma/schema.prisma`.
   - In local development, execute `npx prisma db push` to synchronize your active database.
   - Before submitting PRs affecting schema, generate migration scripts:
     ```bash
     cd server
     npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
     ```
3. **Seed Integrity:**
   - Whenever adding a new model or enum, update `server/prisma/seed.ts` with representative synthetic sample records for both Hotels and Sightseeing.

---

## 7. Testing Expectations

All team members are expected to maintain comprehensive automated test coverage:

| Scope | Tool | Target Coverage | Execution Command |
|---|---|---|---|
| **Server Routes & DB** | Vitest + Supertest | Critical paths (Health, Auth, Suppliers, Inventory, Analytics) | `cd server && npm test` |
| **Python Matching Engine** | Pytest | Normalization functions, token set ratio, geo distance, offer ranker | `cd intelligence && pytest` |
| **Frontend UI Build** | Vite + `tsc` | Zero TypeScript compiler errors | `cd client && npm run build` |

---

## 8. Issue Reporting & Bug Triage

When reporting a bug, create a GitHub Issue providing:
1. **Clear Title:** Concise description of the failure.
2. **Environment:** OS version, Node version, Python version.
3. **Reproduction Steps:** Step-by-step CLI commands or UI clicks to reproduce.
4. **Expected vs Actual Behavior:** What should have happened vs what occurred.
5. **Logs / Stacktrace:** Full log output from task log or terminal.

---

## 9. Related Documentation Links

- [Developer Setup Guide](SETUP.md)
- [System Architecture](ARCHITECTURE.md)
- [Product Roadmap](ROADMAP.md)

