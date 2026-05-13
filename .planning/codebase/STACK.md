# Technology Stack

**Analysis Date:** 2026-05-13

## Languages

**Primary:**
- JavaScript (ES6+) - Vue components and configuration

**Secondary:**
- HTML - Template markup in `.vue` files
- CSS - Styling in `src/style.css`

## Runtime

**Environment:**
- Node.js (tested with v24.14.0)

**Package Manager:**
- npm
- Lockfile: Present (`package-lock.json`)

## Frameworks

**Core:**
- Vue 3 (^3.5.34) - Frontend UI framework using Composition API and Single File Components (SFCs)

**Build/Dev:**
- Vite (^8.0.12) - Fast build tool and dev server
- @vitejs/plugin-vue (^6.0.6) - Vue 3 support for Vite

**Deployment:**
- gh-pages (^6.3.0) - GitHub Pages deployment utility

## Key Dependencies

**Critical:**
- vue (^3.5.34) - Core framework for reactive UI components

**Infrastructure:**
- gh-pages (^6.3.0) - Enables deployment to GitHub Pages via `npm run deploy` command

## Configuration

**Environment:**
- Module type: ES6 modules (`"type": "module"` in `package.json`)
- Base path: `/district-demo/` (configured in `vite.config.js`)

**Build:**
- Vite configuration: `vite.config.js`
  - Uses Vue plugin for SFC compilation
  - Configured for GitHub Pages deployment with base path

**Entry Points:**
- HTML entry: `index.html`
- JavaScript entry: `src/main.js`
- Root Vue component: `src/App.vue`

## Project Scripts

**Available Commands:**
```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Build for production to dist/
npm run preview   # Preview production build locally
npm run deploy    # Build and deploy to GitHub Pages
```

## Platform Requirements

**Development:**
- Node.js (tested on v24.14.0 and likely compatible with v16+)
- npm (v6+)
- Modern browser with ES6 support

**Production:**
- Static hosting via GitHub Pages
- No server-side runtime required

## Project Type

- **Type:** Single Page Application (SPA)
- **Scope:** Demonstration/template project
- **Version:** 0.0.0
- **Private:** Yes (not published to npm)

---

*Stack analysis: 2026-05-13*
