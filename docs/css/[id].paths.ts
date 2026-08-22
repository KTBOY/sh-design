import { EFFECTS } from '../.vitepress/theme/showcase/meta'

// 动态路由：为 meta.ts 里每个特效生成 /css/<id> 静态详情页
export default {
  paths() {
    return EFFECTS.map((e) => ({ params: { id: e.id } }))
  }
}
