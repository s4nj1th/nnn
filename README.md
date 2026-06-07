# 🧠 NNN – Neural Network Nook

> Build, visualise, and explore neural networks on an infinite interactive canvas.

A modern SaaS web application for visually designing and experimenting with neural network architectures. Built with Next.js 15, React Flow, Supabase, and Framer Motion.

---

## ✨ Features

- **Infinite Canvas** — pan, zoom, multi-select, minimap, snap-to-grid
- **Neuron Types** — Input, Hidden, Output nodes with full property editing
- **Connection Weights** — Visual weight thickness + colour (positive yellow, negative red)
- **Forward Propagation** — Animated step-by-step or auto-run simulation
- **Layer Management** — Group neurons into named layers
- **Projects** — Create, save, duplicate, share, and export projects
- **Example Templates** — 6 pre-built networks (XOR, MLP, CNN, etc.)
- **Dark / Light / System Theme** — Synced to Supabase per user
- **Authentication** — Email/password via Supabase Auth
- **Keyboard Shortcuts** — Full shortcut palette

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/neural-network-nook
cd neural-network-nook
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial.sql` via the Supabase SQL editor
3. Copy your Project URL and Anon key

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗂 Project Structure

```
/app
  /api              API routes (projects, canvas, examples, auth)
  /dashboard        Authenticated dashboard + settings
  /editor/[id]      Full canvas editor
  /examples         Template gallery
  /login            Auth pages
  /signup
/components
  /canvas           React Flow nodes, edges, toolbar, panels
  /theme            ThemeProvider, ThemeToggle, ThemeSync
  /ui               shadcn/ui base components
/features
  /auth             AuthProvider
/hooks              Custom React hooks
/lib
  /supabase         Server + client helpers
  templates.ts      6 pre-built example networks
  utils.ts          Activation functions, helpers
/store              Zustand stores (auth, canvas, simulation, ui, project)
/types              TypeScript types
/supabase
  /migrations       SQL migration scripts
```

---

## 🗄 Database Schema

| Table | Description |
|-------|-------------|
| `users` | User profiles + preferences |
| `projects` | Project metadata |
| `project_data` | Canvas state (JSONB) |
| `project_collaborators` | Sharing roles |
| `activity_logs` | Audit trail |

All tables have Row Level Security enabled.

---

## 🎨 Theme System

The app supports **Light**, **Dark**, and **System** themes using `next-themes`.

- Theme preference synced to Supabase per user (cross-device)
- 5 accent colour variants (Yellow, Blue, Purple, Green, Orange)
- CSS custom properties for all design tokens
- Smooth 200ms transitions, no flash on load

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + S` | Save project |
| `⌘/Ctrl + Z` | Undo |
| `⌘/Ctrl + Shift + Z` | Redo |
| `F` | Fit view |
| `Delete / ⌫` | Delete selected |
| `?` | Show shortcuts modal |

---

## 🚢 Deploy to Vercel

```bash
vercel --prod
```

Set the same environment variables in your Vercel project settings.

---

## 🛠 Tech Stack

- **Framework** — Next.js 15 App Router
- **UI** — React 19, Tailwind CSS, shadcn/ui, Lucide Icons
- **Canvas** — React Flow (@xyflow/react)
- **State** — Zustand + zundo (undo/redo)
- **Animations** — Framer Motion
- **Auth & DB** — Supabase
- **Forms** — React Hook Form + Zod
- **Theme** — next-themes

---

## 📄 License

MIT
