// Source: nuxt.com/docs/4.x/directory-structure/app/pages#typing-custom-metadata
declare module '#app' {
  interface PageMeta {
    nav?: boolean
    navLabel?: string
    navIcon?: string
    navOrder?: number
  }
}

// Required: must have at least one top-level import or export
// to be treated as a module (not a script file).
export {}
