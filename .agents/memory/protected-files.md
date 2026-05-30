---
name: Protected files — never modify or delete
description: Files manually configured for Vercel deployment that must never be touched
---

The following files must NEVER be modified or deleted under any circumstances. They are manually configured for Vercel deployment:

- `vercel.json` (root)
- `artifacts/mockup-sandbox/vite.config.ts`
- `artifacts/wallpaper-minimal/vite.config.ts`
- `api/tsconfig.json`

**Why:** These files have been hand-tuned for Vercel deployment. Any change breaks production deployment.

**How to apply:** Before editing any config file, check this list first. If a task seems to require changing one of these, refuse and flag it to the user instead.
