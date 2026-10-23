import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createServer } from 'vite'

// 使用站点已有的 Vite 转译 TS，不额外引入测试运行时或改动构建配置。
const server = await createServer({
  configFile: false,
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true, include: [] }
})
after(() => server.close())

const base = '/docs/.vitepress/theme/'
const { ALL_TOOLS } = await server.ssrLoadModule(`${base}products/meta.ts`)
const { LANDMARKS } = await server.ssrLoadModule(`${base}components/toolcity/scene/landmarks.ts`)
const { createDistrict } = await server.ssrLoadModule(
  `${base}components/toolcity/scene/district.ts`
)
const ids = ALL_TOOLS.map((tool) => tool.id)

function transforms(group) {
  const result = []
  group.traverse((object) => {
    result.push(
      ...object.position.toArray(),
      ...object.quaternion.toArray(),
      ...object.scale.toArray()
    )
  })
  return result
}

test('产品标识唯一，七个地标都有真实产品与有效链接', () => {
  assert.equal(new Set(ids).size, ALL_TOOLS.length)
  assert.deepEqual([...ids].sort(), Object.keys(LANDMARKS).sort())
  for (const tool of ALL_TOOLS) {
    assert.ok(tool.id && tool.name && tool.desc)
    assert.ok(tool.links.length > 0)
    for (const link of tool.links) {
      assert.ok(link.internal ? link.href.startsWith('/') : /^https:\/\//.test(link.href))
    }
  }
})

test('调整产品顺序不改变建筑坐标；子集和未知产品不会错配', () => {
  const original = createDistrict(ids)
  const reordered = createDistrict([...ids].reverse())
  const subset = createDistrict([ids[2], 'unmapped-product'])
  try {
    assert.equal(original.anchors.size, ids.length)
    for (const id of ids) {
      assert.deepEqual(original.anchors.get(id).toArray(), reordered.anchors.get(id).toArray())
    }
    assert.deepEqual([...subset.anchors.keys()], [ids[2]])
  } finally {
    original.dispose()
    reordered.dispose()
    subset.dispose()
  }
})

test('地标可拾取，选择动画结束后归位，切换产品不留下形变', () => {
  const district = createDistrict(ids)
  try {
    const pickableIds = new Set()
    for (const root of district.pickables) {
      let object = root
      while (object && !object.userData.toolId) object = object.parent
      assert.ok(object && ids.includes(object.userData.toolId))
      pickableIds.add(object.userData.toolId)
    }
    assert.deepEqual([...pickableIds].sort(), [...ids].sort())
    for (const id of ids) {
      district.setSelection(id)
      district.setHover(id)
      district.animate(id, 1)
      const baseline = transforms(district.group)
      district.animate(id, 0.5)
      district.animate(id, 1)
      const settled = transforms(district.group)
      assert.equal(settled.length, baseline.length)
      assert.ok(
        settled.every((value, index) => Math.abs(value - baseline[index]) < 1e-6),
        id
      )
      district.setHover(null)
    }
    district.setSelection(null)
  } finally {
    district.dispose()
  }
})

test('卸载时几何体和材质均只释放一次', () => {
  const district = createDistrict(ids)
  const resources = new Set()
  district.group.traverse((object) => {
    if (object.geometry) resources.add(object.geometry)
    if (object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      for (const material of materials) resources.add(material)
    }
  })
  assert.ok(resources.size > 0)
  const disposed = new Map()
  for (const resource of resources) {
    resource.addEventListener('dispose', () => {
      disposed.set(resource, (disposed.get(resource) ?? 0) + 1)
    })
  }
  district.dispose()
  district.dispose()
  for (const resource of resources) assert.equal(disposed.get(resource), 1)
})
