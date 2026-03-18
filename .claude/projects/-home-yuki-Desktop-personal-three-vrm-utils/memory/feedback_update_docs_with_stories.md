---
name: Always update docs with stories
description: When making changes, always update docs/ alongside Storybook stories
type: feedback
---

Always update the docs (`docs/src/content/docs/`) together with Storybook stories when making changes to hooks or components.

**Why:** The user had to remind me to update docs after I'd already updated code and stories. Docs should never lag behind.

**How to apply:** Whenever modifying or adding a hook/component, treat docs + story as a single unit of work — update all three (implementation, story, docs) in the same pass.
