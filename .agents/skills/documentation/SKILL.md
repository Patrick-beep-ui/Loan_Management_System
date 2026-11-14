---
name: documentation
description: Consult and maintain the project's current module documentation when implementing features, fixing bugs, refactoring, or changing workflows, APIs, data models, or permissions.
---

# Maintain project documentation

Module documentation lives in `.agents/skills/<module>/`: the current docs in
`SKILL.md` and the change history in `CHANGELOG.md`. Resolve paths from the
repository root.

## Before editing

1. Identify the affected modules and locate each one under `.agents/skills/<module>/`.
2. Read their `SKILL.md` to understand the current workflows, business
   rules, data relationships, permissions, and dependencies relevant to the task.
   Consult `CHANGELOG.md` entries when you need the reason behind an earlier change.
3. Inspect the relevant code and tests. If the implementation differs from a
   documented rule, identify whether the task calls for fixing the implementation
   or correcting outdated documentation. Flag disagreements that remain unresolved.
4. If the task expands into another module, read its documentation before editing it.

## Before finishing

1. Review the final diff and identify which documented facts have changed.
2. Edit the existing sections so they describe the resulting implementation.
   Update affected workflows, rules, APIs, data relationships, permissions,
   dependencies, and code references wherever those facts are documented.
3. If a touched module lacks documentation, create `.agents/skills/<module>/SKILL.md`
   with the behavior verified during the task.
4. Add a concise entry at the top of `.agents/skills/<module>/CHANGELOG.md` when
   the change is worth recording. Capture what changed and why, and link to the
   current documentation for details.
5. Verify that the updated documentation matches the final code and tests.
   Report any relevant behavior that remains unverified.

## Changelog entry

### YYYY-MM-DD — Short description

- Change: What changed and why.
- Impact: Affected behavior, routes, data, or dependent modules.
- Verification: Checks performed and their results, or what remains unverified.
