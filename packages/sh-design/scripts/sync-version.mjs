// Regenerates src/version.ts from package.json so the exported `version`
// always matches the published version.
//
// Wired into package.json:
//   - "build":   runs before every build (dist stays correct)
//   - "version": runs during `npm version`, then stages version.ts so the
//                bump commit includes it automatically.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const pkgPath = resolve(here, '../package.json')
const outPath = resolve(here, '../src/version.ts')

const { version } = JSON.parse(readFileSync(pkgPath, 'utf8'))

const content = `// This file is auto-generated from package.json by scripts/sync-version.mjs.
// Do not edit manually — run \`npm version\` or \`pnpm build\` to update it.
export const version = '${version}'
`

writeFileSync(outPath, content, 'utf8')
console.log(`[sync-version] src/version.ts -> ${version}`)
