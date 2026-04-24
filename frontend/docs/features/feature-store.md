You are a senior React developer. I need you to analyze my React project structure and create a detailed migration guide for adding Zustand state management.

## Your Task
Read through all files in the `src/` directory carefully, then generate a markdown file to be saved at `docs/features/zustand-migration.md`.

## Analysis Requirements
Before writing the guide, analyze:
1. All files in `src/context/` — identify what state each Context manages
2. All files in `src/pages/` and `src/components/` — identify components that:
   - Lift state up unnecessarily (prop drilling 2+ levels)
   - Fetch the same data in multiple places
   - Have complex local state that's shared across siblings
3. All files in `src/services/` — understand the API layer
4. `src/App.jsx` and routing structure

## Decision Criteria
Only recommend Zustand for state that meets at least one of these:
- Shared across 3+ unrelated components
- Currently lives in Context and causes unnecessary re-renders
- Needs to persist across route navigation
- Involves async data fetching used in multiple places

Do NOT recommend Zustand for:
- Local UI state (modals, toggles, form inputs)
- State only used within one component or its direct children

## Output Format
Generate `docs/features/zustand-migration.md` with these exact sections:

### 1. Executive Summary
- Current state management approach
- Problems identified
- What will be migrated to Zustand and why

### 2. Zustand Setup
- Installation command
- Recommended folder structure under `src/stores/`
- Base configuration

### 3. Store Definitions (one subsection per store)
For each store:
- **Why this needs a store** (reference specific files/components you found)
- **State shape** with TypeScript-style annotations
- **Full store implementation** using Zustand with `immer` middleware
- **List of files that need to be updated**

### 4. Migration Steps (per store)
For each store, provide:
- Step-by-step instructions
- Before/after code examples using actual code from the project
- How to remove the corresponding Context if applicable

### 5. Component Update Guide
For each component that needs changes:
- File path
- What to remove (Context hooks, prop drilling)
- What to add (Zustand hook)
- Full updated component code

### 6. Potential Pitfalls
- Specific gotchas based on this project's patterns
- How to avoid stale state issues
- Performance tips (selectors, shallow comparison)

## Constraints
- Use Zustand v5 syntax
- Use `immer` middleware for complex nested state
- Keep Axios service layer untouched — stores call services, not raw fetch
- Write all code examples in JSX (not TSX)
- Be specific — reference actual file names and component names found in src/
- Write the entire markdown file in Vietnamese, including all explanations, comments, and section headings. Code blocks remain in English/JSX as-is.