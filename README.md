# Aztec Vite React TypeScript Starter

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)  
[![Node.js](https://img.shields.io/badge/Node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)

---

## Overview

**Aztec** is a modern, production‑ready starter kit for building web applications with **Vite**, **React**, **TypeScript**, and **Tailwind CSS**.  
It ships with:
- Fast hot‑module‑replacement development server powered by Vite.
- Type‑safe React components.
- Utility‑first styling via Tailwind.
- Integrated **Supabase** client for authentication, database, and storage.
- Pre‑configured ESLint + Prettier for code quality.
- Ready‑to‑deploy production builds.

---

## Features

-  Vite 5 dev server with instant HMR.
-  TypeScript for static typing.
-  Tailwind CSS for rapid UI development.
-  Supabase client pre‑wired (`src/lib/supabase.ts`).
-  ESLint + Prettier with recommended rules.
-  Ready scripts for dev, build, preview, and linting.
-  Well‑organized project structure.

---

##  Tech Stack

| Category | Tool |
|----------|------|
| Bundler | **Vite 5** |
| UI Library | **React 18** |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS** |
| Backend | **Supabase** |
| Linting | **ESLint**, **Prettier** |
| Testing (optional) | **Vitest**, **React Testing Library** |

---

##  Prerequisites

- **Node.js** ≥ 18 (download from [nodejs.org](https://nodejs.org/))
- **npm**, **pnpm**, or **yarn**
- **Git** for version control

## Getting Started
```bash
# Clone the repository
git clone https://github.com/your‑username/aztec.git
cd aztec

# Install dependencies
npm install

# Start the development server
npm run dev
```
Open your browser at `http://localhost:5173` to see the app running.

## Scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Starts Vite dev server with hot‑module replacement |
| `npm run build` | Produces an optimized production build in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint across the codebase |
| `npm run lint:fix` | Auto‑fix lint errors where possible |

## Project Structure
```
Aztec/
├─ src/                # Source files (React components, hooks, etc.)
│   ├─ main.tsx       # App entry point
│   └─ ...
├─ supabase/           # Supabase client configuration
├─ public/             # Static assets (favicon, images)
├─ index.html          # HTML template used by Vite
├─ tailwind.config.js  # Tailwind configuration
├─ eslint.config.js    # ESLint configuration
└─ vite.config.ts      # Vite configuration (TS)
```

## Development Workflow
1. **Edit components** in `src/` – Vite refreshes the browser instantly.
2. **Style with Tailwind** – Utility classes map directly to CSS.
3. **Run lint** – `npm run lint` keeps code quality high.
4. **Write tests** – Add unit/integration tests in a `__tests__/` folder (not included by default).

## Building for Production
```bash
npm run build
```
The output is placed in the `dist/` directory, ready to be served by any static host (Netlify, Vercel, etc.).

## Deploying
You can deploy the `dist/` folder to any static hosting provider. Example for Vercel:
```bash
npm install -g vercel
vercel
```
Follow the prompts to link the project and deploy.

## Contributing
Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request. Ensure lint passes and code is type‑checked.

## License
This project is licensed under the **MIT License** – see the `LICENSE` file for details.
