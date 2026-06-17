<div align="center">
  <h1>NNN - Neural Network Nook</h1>
  <p>NN on a canvas.</p>
</div>

A modern SaaS web application for visually designing and experimenting with neural network architectures. Built with Next.js 15, React Flow, Supabase, and Framer Motion.

## Screenshots

<div align="center">
    <picture >
        <source media="(prefers-color-scheme: dark)" srcset="public/screenshot-dark.png" />
        <img src="public/screenshot-light.png" alt="App screenshot" width="400"/>
    </picture>
</div>

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/s4nj1th/nnn
cd nnn
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

## Database Schema

| Table                   | Description                 |
| ----------------------- | --------------------------- |
| `users`                 | User profiles + preferences |
| `projects`              | Project metadata            |
| `project_data`          | Canvas state (JSONB)        |
| `project_collaborators` | Sharing roles               |
| `activity_logs`         | Audit trail                 |

All tables have Row Level Security enabled.

## Theme System

The app supports **Light**, **Dark**, and **System** themes using `next-themes`.

- Theme preference synced to Supabase per user (cross-device)
- 5 accent colour variants (Yellow, Blue, Purple, Green, Orange)
- CSS custom properties for all design tokens
- Smooth 200ms transitions, no flash on load

## Tech Stack

- **Framework** — Next.js 15 App Router
- **UI** — React 19, Tailwind CSS, shadcn/ui, Lucide Icons
- **Canvas** — React Flow (@xyflow/react)
- **State** — Zustand + zundo (undo/redo)
- **Animations** — Framer Motion
- **Auth & DB** — Supabase
- **Forms** — React Hook Form + Zod
- **Theme** — next-themes

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
