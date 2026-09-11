# AI-Native Workflow Note

## AI Tooling Stack Used
- **Cursor / GitHub Copilot:** Inline code autocompletion, Tiptap toolbar component generation, and Prisma schema boilerplate.
- **Claude 3.5 Sonnet / Gemini:** Architectural design validation, mock data generation scripts, and Vitest access control unit test design.

---

## Where AI Materially Accelerated Delivery

1. **Prisma Schema & Migration Scaffolding:**
   - Prompting the data models for `User`, `Document`, and `DocShare` with unique constraints allowed scaffolding the relational database in under 10 minutes.

2. **Tiptap Toolbar Assembly:**
   - Generating standard UI control bindings for Tiptap editor commands (bold, italic, list states) saved ~45 minutes of manual UI wiring.

3. **Client-Side File Parsing:**
   - Prompted browser-native `FileReader` logic for handling `.txt` and `.md` file imports.

---

## AI Suggestions Changed or Rejected

- **Rejected: WebSockets for Real-time Editing**
  - *Context:* Initial AI prompts suggested integrating Socket.io or Supabase Realtime for document editing.
  - *Reasoning:* Implementing real-time multiplayer editing within a 4-6 hour timebox risks operational stability. I rejected this and opted for a debounced auto-save strategy with access boundary checks instead.

- **Changed: Insecure Document Access Routes**
  - *Context:* AI-generated Next.js API route templates originally fetched documents by ID without checking the caller's user context.
  - *Correction:* Replaced raw lookup queries with `checkAccess()` middleware logic that verifies `ownerId === userId` or active `DocShare` membership before yielding data.

---

## Verification Strategy & Reliability
- **Automated Verification:** Written Vitest unit test suite covering HTTP 401 and 403 authorization edge cases.
- **Manual Verification:** Tested cross-user isolation using the simulated header switcher: created documents as Alice, verified Bob could not access them via direct URL, granted permission to Bob, and verified Bob gained editing access.