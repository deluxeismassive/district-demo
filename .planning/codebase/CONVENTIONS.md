# Coding Conventions

**Analysis Date:** 2026-05-13

## Naming Patterns

**Files:**
- Vue components use PascalCase with `.vue` extension: `HelloWorld.vue`, `App.vue`
- JavaScript modules use camelCase with `.js` extension: `main.js`
- CSS files use lowercase with `.css` extension: `style.css`
- Asset files (SVG, PNG) use kebab-case: `hero.png`, `vite.svg`, `vue.svg`

**Functions:**
- Not extensively used in current codebase. Vue Composition API reactive variables use camelCase: `count`
- Event handlers use camelCase with "on" prefix in templates: `@click="count++"`

**Variables:**
- Reactive variables (Composition API `ref()`) use camelCase: `const count = ref(0)`
- CSS custom properties use kebab-case with double dashes: `--text`, `--bg`, `--accent`
- ID selectors in HTML use kebab-case: `id="center"`, `id="next-steps"`, `id="social"`
- Class selectors in CSS use camelCase or BEM-like patterns: `.counter`, `.hero`, `.button-icon`

**Types:**
- Not applicable - project uses plain JavaScript, not TypeScript

## Code Style

**Formatting:**
- No formatter configured (Prettier not installed)
- Consistent indentation: 2 spaces observed across all files
- Line length: varies, up to ~100+ characters observed

**Linting:**
- No linter configured (ESLint not installed)
- Code quality relies on manual review

## Import Organization

**Order:**
1. Framework imports: `import { createApp } from 'vue'`
2. Local style imports: `import './style.css'`
3. Local component imports: `import App from './App.vue'`

**Path Aliases:**
- No path aliases configured
- Uses relative paths: `./App.vue`, `../assets/vite.svg`

## Error Handling

**Patterns:**
- Not extensively implemented in current codebase
- Vue error handling would use try-catch blocks if needed (none present)
- No custom error classes or error boundary components implemented

## Logging

**Framework:** None

**Patterns:**
- No logging framework configured
- Would use `console.*` methods if needed (none present in current code)

## Comments

**When to Comment:**
- Minimal comments in current codebase
- Code is self-documenting through clear naming and structure
- Vue template uses HTML comments where needed: `<!-- example -->`

**JSDoc/TSDoc:**
- Not used - project does not use TypeScript or strict JSDoc enforcement

## Function Design

**Size:** 
- Components are simple and focused
- Logic is minimal within components
- HelloWorld.vue has single reactive variable and template rendering

**Parameters:**
- Vue components use props for passing data (none currently used in HelloWorld)
- Composition API uses reactive refs instead of function parameters for state

**Return Values:**
- Vue `<script setup>` does not explicitly return (implicit export)
- Functions would return values if created (none in current code)

## Module Design

**Exports:**
- Vue SFCs (Single File Components) are default exports: `export default` in implicit setup syntax
- JavaScript module exports application instance setup
- Components imported as ES6 imports: `import HelloWorld from './components/HelloWorld.vue'`

**Barrel Files:**
- Not used in current project structure

---

*Convention analysis: 2026-05-13*
