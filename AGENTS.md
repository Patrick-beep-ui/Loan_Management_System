## Project documentation

At the start of each session, read `README.md` for the project
overview and module map.

For every implementation task, follow the workflow in
`.agents/skills/documentation/SKILL.md`.

Before editing a module, read its current documentation and the
relevant documentation for any dependencies affected by the task.

Before finishing, review the final diff and update the documentation
in the same change. Every implementation change requires this review.
If the documented behavior and code references still match, the review
is sufficient.

## Module documentation

The current documentation for each module lives in
`.agents/skills/<module>/SKILL.md`. The module's change history lives in
`.agents/skills/<module>/CHANGELOG.md`.

For every implementation task, read `.agents/skills/documentation/SKILL.md`.
Before editing, identify the affected modules and open their `SKILL.md`
files directly from the repository root. Follow the same rule if the task
expands into another module.

Before finishing, review the final diff and update each affected module's
`SKILL.md` so it describes the current implementation. Record what changed
and why in the module's `CHANGELOG.md` when the change warrants an entry.