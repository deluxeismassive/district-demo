<!-- GSD:project-start source:PROJECT.md -->
## Project

**District Demo Portal**

A sales demo web portal for edtech that displays school district data across multiple sections — discovery (app/domain usage), DPA status, risk position, and 1EdTech compliance data. Built as a clickable mockup with fully synthetic data, shown by sales reps to district admin prospects. Needs to iterate same-day as sales requirements change.

**Core Value:** Sales reps can walk a district admin prospect through a realistic, data-rich portal that makes the value of the product immediately tangible — and any section can be changed within hours for a specific demo.

### Constraints

- **Tech stack**: Vue 3 + Vite — already established, do not introduce conflicting frameworks
- **Deployment**: Static GitHub Pages — no server, no SSR, no backend calls
- **Data**: All data is mocked/synthetic — no Druid, DPA API, or 1EdTech API connections in this demo
- **Iteration speed**: Mock data and section content must be changeable by a developer in under an hour
- **Auth**: None — portal opens directly with no login
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- JavaScript (ES6+) - Vue components and configuration
- HTML - Template markup in `.vue` files
- CSS - Styling in `src/style.css`
## Runtime
- Node.js (tested with v24.14.0)
- npm
- Lockfile: Present (`package-lock.json`)
## Frameworks
- Vue 3 (^3.5.34) - Frontend UI framework using Composition API and Single File Components (SFCs)
- Vite (^8.0.12) - Fast build tool and dev server
- @vitejs/plugin-vue (^6.0.6) - Vue 3 support for Vite
- gh-pages (^6.3.0) - GitHub Pages deployment utility
## Key Dependencies
- vue (^3.5.34) - Core framework for reactive UI components
- gh-pages (^6.3.0) - Enables deployment to GitHub Pages via `npm run deploy` command
## Configuration
- Module type: ES6 modules (`"type": "module"` in `package.json`)
- Base path: `/district-demo/` (configured in `vite.config.js`)
- Vite configuration: `vite.config.js`
- HTML entry: `index.html`
- JavaScript entry: `src/main.js`
- Root Vue component: `src/App.vue`
## Project Scripts
## Platform Requirements
- Node.js (tested on v24.14.0 and likely compatible with v16+)
- npm (v6+)
- Modern browser with ES6 support
- Static hosting via GitHub Pages
- No server-side runtime required
## Project Type
- **Type:** Single Page Application (SPA)
- **Scope:** Demonstration/template project
- **Version:** 0.0.0
- **Private:** Yes (not published to npm)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Vue components use PascalCase with `.vue` extension: `HelloWorld.vue`, `App.vue`
- JavaScript modules use camelCase with `.js` extension: `main.js`
- CSS files use lowercase with `.css` extension: `style.css`
- Asset files (SVG, PNG) use kebab-case: `hero.png`, `vite.svg`, `vue.svg`
- Not extensively used in current codebase. Vue Composition API reactive variables use camelCase: `count`
- Event handlers use camelCase with "on" prefix in templates: `@click="count++"`
- Reactive variables (Composition API `ref()`) use camelCase: `const count = ref(0)`
- CSS custom properties use kebab-case with double dashes: `--text`, `--bg`, `--accent`
- ID selectors in HTML use kebab-case: `id="center"`, `id="next-steps"`, `id="social"`
- Class selectors in CSS use camelCase or BEM-like patterns: `.counter`, `.hero`, `.button-icon`
- Not applicable - project uses plain JavaScript, not TypeScript
## Code Style
- No formatter configured (Prettier not installed)
- Consistent indentation: 2 spaces observed across all files
- Line length: varies, up to ~100+ characters observed
- No linter configured (ESLint not installed)
- Code quality relies on manual review
## Import Organization
- No path aliases configured
- Uses relative paths: `./App.vue`, `../assets/vite.svg`
## Error Handling
- Not extensively implemented in current codebase
- Vue error handling would use try-catch blocks if needed (none present)
- No custom error classes or error boundary components implemented
## Logging
- No logging framework configured
- Would use `console.*` methods if needed (none present in current code)
## Comments
- Minimal comments in current codebase
- Code is self-documenting through clear naming and structure
- Vue template uses HTML comments where needed: `<!-- example -->`
- Not used - project does not use TypeScript or strict JSDoc enforcement
## Function Design
- Components are simple and focused
- Logic is minimal within components
- HelloWorld.vue has single reactive variable and template rendering
- Vue components use props for passing data (none currently used in HelloWorld)
- Composition API uses reactive refs instead of function parameters for state
- Vue `<script setup>` does not explicitly return (implicit export)
- Functions would return values if created (none in current code)
## Module Design
- Vue SFCs (Single File Components) are default exports: `export default` in implicit setup syntax
- JavaScript module exports application instance setup
- Components imported as ES6 imports: `import HelloWorld from './components/HelloWorld.vue'`
- Not used in current project structure
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Vue 3 Composition API with `<script setup>` syntax
- Module-based imports with ES modules
- Client-side rendering with no server-side logic
- Asset management through Vite's module bundling
- Static deployment (GitHub Pages compatible)
## Layers
- Purpose: Render UI components and handle user interactions
- Location: `src/components/`, `src/App.vue`
- Contains: Vue Single File Components (SFC) with templates, scripts, and styles
- Depends on: Vue 3 framework, local asset imports
- Used by: Browser DOM mounting via `src/main.js`
- Purpose: Initialize Vue application and mount to DOM
- Location: `src/main.js`
- Contains: Vue app creation and root component mounting
- Depends on: Vue 3 createApp, App.vue root component
- Used by: Browser via `index.html` script tag
- Purpose: Global styles and CSS variable definitions
- Location: `src/style.css`
- Contains: CSS custom properties, responsive design, component-specific styles
- Depends on: CSS3 features (custom properties, media queries, nested selectors)
- Used by: All components through cascading
- Purpose: Image and SVG resources for UI rendering
- Location: `src/assets/` (source), `public/` (public directory)
- Contains: Logo images, framework assets, utility SVGs
- Depends on: None
- Used by: Components via static imports and public path references
## Data Flow
- Local reactive state only: `const count = ref(0)` in `HelloWorld.vue`
- No global state management (Pinia/Vuex)
- State mutations through event handlers: `@click="count++"`
- Each component manages its own isolated state
- Relative imports in components resolve through Vite module graph
- SVG/PNG assets imported as modules: `import viteLogo from '../assets/vite.svg'`
- Public directory assets referenced via absolute path: `/icons.svg`
- Vite processes and bundles all imports into output
## Key Abstractions
- Purpose: Encapsulate UI, state, and behavior as reusable units
- Examples: `src/App.vue`, `src/components/HelloWorld.vue`
- Pattern: Vue Single File Components with `<script setup>` Composition API
- Purpose: Create observable data that triggers re-renders on mutation
- Examples: `const count = ref(0)` in HelloWorld component
- Pattern: Vue 3 Composition API `ref()` for primitive values
- Purpose: Bind data and events to DOM
- Examples: `{{ count }}` for data, `@click="count++"` for events, `:src="viteLogo"` for bindings
- Pattern: Vue template syntax with interpolation and directives
## Entry Points
- Location: `index.html`
- Triggers: Browser page load
- Responsibilities: 
- Location: `src/main.js`
- Triggers: Loaded from `index.html` script tag
- Responsibilities:
- Location: `src/App.vue`
- Triggers: Mounted by `main.js`
- Responsibilities:
## Error Handling
- No explicit error boundaries implemented
- No error state management visible
- No try-catch blocks in source components
- Browser console will show module resolution errors or Vue runtime errors
## Cross-Cutting Concerns
- Desktop breakpoint: 1024px width threshold
- Mobile adjustments: Font size, padding, layout direction changes
- Viewport meta tag set in `index.html` for proper mobile rendering
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
