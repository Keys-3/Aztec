# Aztec Vite React TypeScript Starter

## Overview
Aztec is a modern web development starter kit built with **Vite**, **React**, **TypeScript**, and **Tailwind CSS**. It includes an integrated **Supabase** client for backend services, a full ESLint setup for code quality, and a ready‑to‑go development environment.

## Features
-  Fast dev server powered by Vite 5
-  Type‑safe React components with TypeScript
-  Utility‑first styling using Tailwind CSS
-  Pre‑configured ESLint and Prettier
-  Supabase client for authentication, database, and storage
-  Ready for production builds and deployment

## Prerequisites
- **Node.js** (v18 or newer) – [download](https://nodejs.org/)
- **npm** (comes with Node) or **pnpm**/**yarn** if you prefer
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
