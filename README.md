# Ajaia Docs 📝

A lightweight, full-stack collaborative document editing system built with Next.js 15, Tiptap, Prisma, and Tailwind CSS. Built as an AI-native document management platform supporting rich-text editing, debounced auto-save persistence, client-side file imports, and isolated access sharing.

---

## 🚀 Key Features

* **Rich-Text Document Editor:** Full editing capabilities using Tiptap (ProseMirror engine) supporting Bold, Italic, Underline, Headings (H1/H2), Bulleted Lists, and Numbered Lists.
* **Debounced Auto-Save:** Real-time persistence using debounced HTTP `PATCH` requests (1000ms delay) with explicit status indicators (**Saving...**, **Saved**, **Save error**).
* **Client-Side File Import:** Fast ingestion of `.txt` and `.md` files directly into document drafts using the browser `FileReader` API.
* **Granular Access Control & Sharing:** Grant document permissions to team members via email address with strict backend API isolation (401/403 access boundaries).
* **Simulated Identity Switcher:** Native header dropdown enabling reviewers to instantly test multi-user owner/collaborator flows without registering multiple accounts.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Text Editor Engine:** Tiptap Editor (`@tiptap/react`, `@tiptap/starter-kit`)
* **ORM & Database:** Prisma ORM with SQLite (Local) / PostgreSQL (Production)
* **Testing:** Vitest

---

## 📋 Local Setup Instructions

### Prerequisites

Ensure you have the following installed on your machine:
* **Node.js:** v18.17.0 or higher
* **npm** or **pnpm** or **yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/TitinSDev/ajaia-docs.git](https://github.com/TitinSDev/ajaia-docs.git)
   cd ajaia-docs

1. Install dependencies:

```bash
npm install --legacy-peer-deps
```
## Set up Environment Variables:
Create a .env file in the project root directory:

Code snippet
```bash
DATABASE_URL="file:./dev.db"
Initialize Database Schema & Seed Data:
Run Prisma migrations and seed default test users (alice@ajaia.com, bob@ajaia.com):
```

```bash
    npx prisma db push
    npx prisma db seed
```


 # Start the Development Server:
```bash
npm run dev

Open http://localhost:3000 in your browser.
```
# 🧪 Running Automated Tests
Run the Vitest test suite to verify route protection, missing header handling (401), and access boundaries (403):

```bash
npm vitest run
```
# 👤 Test Credentials & User Roles
To review document sharing workflows without registering external emails:

Use the Simulate Identity dropdown in the top navigation bar.

Switch between seeded user accounts:

Alice (Document Owner): alice@ajaia.com

Bob (Collaborator): bob@ajaia.com

# 📁 Project Structure
```bash
├── app/
│   ├── api/
│   │   └── documents/
│   │       ├── route.ts                 # List/Create Documents
│   │       └── [id]/
│   │           ├── route.ts             # Fetch/Update Document Content
│   │           └── share/
│   │               └── route.ts         # Document Sharing Handler
│   ├── documents/
│   │   └── [id]/page.tsx                # Editor View
│   └── page.tsx                         # Main Dashboard
├── components/
│   ├── Editor.tsx                       # Tiptap Rich-Text Editor Component
│   ├── Navbar.tsx                       # Navigation & Identity Switcher
│   ├── ShareModal.tsx                   # Sharing Modal Component
│   └── ImportModal.tsx                  # File Upload/Import Modal
├── prisma/
│   └── schema.prisma                    # Database Models (User, Document, DocShare)
├── __tests__/
│   └── access.test.ts                   # Vitest Route Protection Tests
├── ARCHITECTURE.md                      # Architecture & Technical Tradeoffs
├── AI_WORKFLOW.md                       # AI Tools Usage & Engineering Decisions
└── SUBMISSION.md                        # Final Submission Manifest
```
# 📝 License
This project is open-source and available under the MIT License