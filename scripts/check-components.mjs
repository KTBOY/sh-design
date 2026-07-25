// Checks that every component under packages/sh-design/src/components is
// referenced in the three places that must stay in sync when a component is
// added / renamed / removed:
//   1. README.md          — components table row
//   2. docs/components/   — the component's doc page
//   3. docs/.vitepress/config.ts — sidebar entry
// Exits non-zero with a per-component report when anything is missing.
// Wired into release.bat; can also be run manually: node scripts/check-components.mjs
import fs from 'node:fs'

const componentsDir = 'packages/sh-design/src/components'
const dirs = fs
  .readdirSync(componentsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)

const readme = fs.readFileSync('README.md', 'utf8')
const config = fs.readFileSync('docs/.vitepress/config.ts', 'utf8')

let bad = 0
for (const name of dirs) {
  const problems = []
  if (!readme.includes(`/components/${name}`)) problems.push('README.md 组件表缺少条目')
  if (!fs.existsSync(`docs/components/${name}.md`)) problems.push(`缺少文档页 docs/components/${name}.md`)
  if (!config.includes(`/components/${name}`)) problems.push('config.ts 侧边栏缺少入口')
  if (problems.length) {
    bad++
    console.error(`[${name}] ${problems.join('；')}`)
  }
}

if (bad) {
  console.error(`\n共 ${bad} 个组件信息不同步，请补齐后重试。`)
  process.exit(1)
}
console.log(`组件信息同步检查通过（${dirs.length} 个组件：${dirs.join(', ')}）。`)
