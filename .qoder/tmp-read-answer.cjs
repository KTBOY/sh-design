const fs = require('fs')
const html = fs.readFileSync('d:/my/git/sh-ui/.qoder/sylva-source.html', 'utf8')
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
console.log('script blocks:', blocks.length)
blocks.forEach((b, i) => {
  const s = b[1]
  console.log('\n#', i, 'len:', s.length, 'has liquid:', s.includes('liquid'), 'has THREE:', s.includes('THREE'))
  console.log('head:', s.trim().slice(0, 180).replace(/\s+/g, ' '))
})
// 找出所有 liquid-metal JS 位置
const lm = html.indexOf('data-liquid-metal')
console.log('\nHTML liquid-metal 首次出现:', lm)
