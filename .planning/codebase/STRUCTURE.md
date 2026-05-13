# Codebase Structure

**Analysis Date:** 2026-05-13

## Directory Layout

```
district-demo/
├── src/                        # Source code directory
│   ├── main.js                # Application entry point
│   ├── App.vue                # Root component
│   ├── style.css              # Global styles
│   ├── components/            # Reusable Vue components
│   │   └── HelloWorld.vue     # Example component
│   └── assets/                # Static assets (images, SVGs)
│       ├── hero.png           # Hero image
│       ├── vite.svg           # Vite logo
│       └── vue.svg            # Vue logo
├── public/                    # Static public assets (served as-is)
│   ├── favicon.svg            # Favicon
│   └── icons.svg              # Icon definitions
├── dist/                      # Built output (generated)
│   └── assets/                # Processed assets
├── index.html                 # HTML entry point
├── vite.config.js             # Vite configuration
├── package.json               # Dependencies and scripts
├── package-lock.json          # Locked dependency versions
└── README.md                  # Project documentation
```

## Directory Purposes

**src/:**
- Purpose: Contains all application source code
- Contains: Vue components, styles, assets, entry point
- Key files: `src/main.js` (bootstrap), `src/App.vue` (root), `src/components/` (components)

**src/components/:**
- Purpose: Reusable Vue Single File Components
- Contains: `.vue` files with template, script, and styles
- Key files: `src/components/HelloWorld.vue` (demo component)

**src/assets/:**
- Purpose: Static image and SVG assets used by components
- Contains: PNG images, SVG logos imported as modules
- Key files: `src/assets/hero.png`, `src/assets/vite.svg`, `src/assets/vue.svg`

**public/:**
- Purpose: Static assets served directly from root without processing
- Contains: Files referenced by absolute paths (e.g., `/icons.svg`)
- Key files: `public/favicon.svg`, `public/icons.svg`
- Note: These are NOT bundled; they're copied as-is to dist

**dist/:**
- Purpose: Built and minified output for deployment
- Contains: HTML, JavaScript bundles, processed assets
- Generated: Yes (via `npm run build`)
- Committed: No (in .gitignore)

## Key File Locations

**Entry Points:**
- `index.html`: HTML document entry point - defines mount target and script loading
- `src/main.js`: JavaScript entry point - initializes Vue app and mounts to DOM
- `src/App.vue`: Application root component - imported by main.js

**Configuration:**
- `vite.config.js`: Vite build tool configuration with Vue plugin
- `package.json`: Dependencies (vue), devDependencies (vite, vue plugin), and npm scripts
- `index.html`: Also contains metadata (viewport, title, favicon)

**Core Logic:**
- `src/App.vue`: Root component that renders HelloWorld
- `src/components/HelloWorld.vue`: Demo component with counter state and UI sections
- `src/style.css`: All global and component styling

**Assets:**
- `src/assets/`: Images imported as modules (bundled with code)
- `public/`: Static files served from root (favicon, icons)

## Naming Conventions

**Files:**
- Vue components: PascalCase with `.vue` extension: `HelloWorld.vue`, `App.vue`
- CSS files: lowercase with `.css` extension: `style.css`
- JavaScript modules: camelCase or descriptive: `main.js`
- Assets: lowercase descriptive names: `hero.png`, `vite.svg`
- Directories: lowercase plural for collections: `components/`, `assets/`

**Directories:**
- Component collection: `components/` (plural)
- Asset collection: `assets/` (plural)
- Root source: `src/` (lowercase)
- Public static: `public/` (lowercase)

**Vue Component Naming:**
- Export names: PascalCase: `HelloWorld`, `App`
- Filenames match export names: `HelloWorld.vue`, `App.vue`

## Where to Add New Code

**New Feature/Page Component:**
- Primary code: `src/components/[FeatureName].vue`
- Import in: `src/App.vue` or parent component
- Styles: Scoped in `<style scoped>` within `.vue` file, or reference from `src/style.css` for shared
- Assets used by feature: Create feature-specific subdirectory in `src/assets/` if large, or place in `src/assets/`

**New Component/Module:**
- Implementation: `src/components/[ComponentName].vue` for Vue components
- Reusable utilities: Create `src/utils/` directory and place JS/TS files there
- Keep related assets in `src/assets/` with clear naming

**Utilities/Helpers:**
- Location: `src/utils/` (directory to be created if needed)
- Naming: `camelCase.js` (e.g., `formatDate.js`, `apiClient.js`)
- Use in components via relative import: `import { formatDate } from '../utils/formatDate.js'`

**Global Styles:**
- Shared CSS: Add to `src/style.css` under appropriate comment sections
- Component-specific: Use scoped styles in the `.vue` file's `<style scoped>` block
- Theme variables: Already defined as CSS custom properties in `:root` in `src/style.css`

**New Assets:**
- Component-bundled assets: `src/assets/[name].[ext]` - imported in components
- Public-served assets: `public/[name].[ext]` - referenced by absolute path (e.g., `/logo.svg`)

## Special Directories

**dist/:**
- Purpose: Build output directory
- Generated: Yes (created by `npm run build`)
- Committed: No (.gitignore includes dist/)

**.git/:**
- Purpose: Git repository metadata
- Generated: Yes (git init)
- Committed: N/A (system directory)

**node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes (npm install)
- Committed: No (.gitignore includes node_modules/)

**.planning/codebase/:**
- Purpose: Codebase analysis documents
- Contains: ARCHITECTURE.md, STRUCTURE.md, and other analysis files
- Committed: Yes (supports development planning)

## File Structure Summary for Navigation

```
To add a new Vue page/feature:
  1. Create src/components/MyFeature.vue
  2. Import in src/App.vue: import MyFeature from './components/MyFeature.vue'
  3. Use in template: <MyFeature />

To add a shared style:
  1. Add CSS to src/style.css under appropriate section
  2. Or use CSS custom properties already defined in :root

To add a utility function:
  1. Create src/utils/myFunction.js
  2. Export the function: export function myFunction() { ... }
  3. Import in component: import { myFunction } from '../utils/myFunction.js'

To add a static asset (logo, favicon, etc.):
  1. For bundled with component: src/assets/name.svg → import in component
  2. For served directly: public/name.svg → reference as /name.svg in templates
```

---

*Structure analysis: 2026-05-13*
