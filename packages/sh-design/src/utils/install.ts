import type { App, Plugin } from 'vue'

export type SFCWithInstall<T> = T & Plugin & { name?: string }

/**
 * Attach an `install` method to a component so it can be registered as a Vue
 * plugin via `app.use(Component)`, while still being importable on-demand.
 */
export function withInstall<T extends { name?: string }>(comp: T): SFCWithInstall<T> {
  const c = comp as SFCWithInstall<T>
  c.install = (app: App): void => {
    const name = c.name
    if (name) {
      app.component(name, c as unknown as Plugin)
    }
  }
  return c
}

/**
 * Build a library-level installer from a list of installable components so the
 * whole library can be registered with a single `app.use(ShDesign)`.
 */
export function makeInstaller(components: Plugin[] = []) {
  const install = (app: App): void => {
    components.forEach((c) => app.use(c))
  }
  return { install }
}
