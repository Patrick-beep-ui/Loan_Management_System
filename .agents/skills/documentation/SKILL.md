---
name: documentation
description: Read and update project documentation and module changelogs when implementing features, fixing bugs, or changing APIs, schemas, or business rules.
---

# Project documentation

Resolve documentation paths from the repository root.

## Before editing

1. Read `docs/README.md` and follow the links for every affected module.
2. Read the module documentation and recent changelog entries. Look for
   business rules, dependencies, and previous decisions that affect the task.
3. Check those details against the current code and tests. If the docs are
   missing or outdated, use the code and tests to establish current behavior.

## Before finishing

1. Review the final diff and update any documentation that describes
   behavior changed by the implementation.
2. Add one entry per affected module for changes to behavior, public APIs,
   database schemas, permissions, or operational steps. Skip changelog
   entries for formatting-only changes.
3. Add new entries at the top of `docs/<module>/CHANGELOG.md`. Create the
   changelog if needed. If you add a module, link it from `docs/README.md`.
4. For a change that spans modules, describe the impact on each module
   and link to related entries when that helps explain the dependency.

## Changelog entry

### YYYY-MM-DD — Short description

- Change: What changed and why.
- Impact: Affected behavior, routes, data, or dependent modules.
- Verification: Checks performed and their results, or what remains unverified.