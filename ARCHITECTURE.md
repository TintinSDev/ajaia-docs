# Architecture & Technical Tradeoffs

## Overview
Ajaia Docs is built as an AI-native, lightweight collaborative document editing system designed for speed, usability, and deterministic access control.

The system uses a modern TypeScript full-stack architecture based on Next.js (App Router), Tailwind CSS, Tiptap, Prisma ORM, and SQLite.

---

## Technical Stack & Architecture

┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Router                     │
├──────────────────────────────┬──────────────────────────────┤
│       Client Components      │        Server / APIs         │
│  - Editor.tsx (Tiptap Engine)│  - /api/documents (GET, POST)│
│  - Navbar.tsx (Identity Sim) │  - /api/documents/[id] (PATCH│
│  - ShareModal.tsx            │  - /api/documents/[id]/share │
└──────────────┬───────────────┴──────────────┬───────────────┘
│                              │
▼                              ▼
Browser FileReader             Prisma ORM (SQLite / PG)
(.txt / .md Import)            (User, Document, DocShare)

### 1. Document Editing Engine (Tiptap)
- **Choice:** Integrated Tiptap built on top of ProseMirror.
- **Why:** Offers standard JSON/HTML serialization, extensible schema controls, and headless rendering.
- **Formatting Supported:** Bold, Italic, Underline, Headings (H1, H2), Bullet Lists, and Numbered Lists.
- **Save Strategy:** Debounced `PATCH` requests (1-second timer) to minimize API spam while maintaining auto-save capabilities.

### 2. File Upload & Ingestion Workflow
- **Choice:** Direct client-side file reading (`FileReader` API) for `.txt` and `.md` files.
- **Why:** Avoids external cloud storage buckets (e.g., S3), keeping deployment costs zero and setup instantaneous while satisfying file workflow requirements.

### 3. Identity Simulation vs. Auth
- **Choice:** Simulated identity switcher in the header via `x-user-id` HTTP headers and `localStorage`.
- **Why:** Full Auth (Clerk, NextAuth) introduces friction for reviewers. A simulated user switcher allows reviewers to switch between document owners and collaborators in a single click without setting up temporary email accounts.

### 4. Data Persistence & Access Model
- **Database Schema:**
  - `User`: Pre-seeded default users (`alice@ajaia.com`, `bob@ajaia.com`).
  - `Document`: Stores `title`, raw `content` string (HTML format), and `ownerId`.
  - `DocShare`: Explicit join table enforcing many-to-many document access grants.
- **Access Control Logic:** API route handlers verify that the requesting user (`x-user-id`) matches either `Document.ownerId` OR exists in `DocShare` records for that document ID before returning content or accepting updates.

---

## Architectural Tradeoffs & Prioritization

| Feature Area | Prioritized Approach | Explicitly Deprioritized | Reason for Decision |
| :--- | :--- | :--- | :--- |
| **Real-time Sync** | Single-user auto-save with state syncing | WebSockets / Yjs / OT | Real-time CRDT/OT synchronization adds significant infrastructure overhead beyond the 4–6 hour scope. |
| **Auth** | Mocked session header switcher | Multi-factor JWT/Session Auth | Focuses evaluator time on core document creation, file import, and authorization logic. |
| **Storage** | Native database text storage | AWS S3 / Cloudflare R2 | Text and Markdown parsing direct to database avoids cloud configuration overhead for reviewers. |

---

## Verification & Automated Testing
- End-to-end access validation is covered by Vitest suite (`__tests__/access.test.ts`), verifying that:
  1. Requests missing user headers return `401 Unauthorized`.
  2. Unshared third-party users receive `403 Forbidden`.
  3. Document owners and authorized collaborators receive `200 OK`.