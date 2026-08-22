import { SKILLS } from '../.vitepress/theme/showcase/meta'

// 动态路由：为 meta.ts 里每个 skill 生成 /skills/<id> 静态详情页
export default {
  paths() {
    return SKILLS.map((s) => ({ params: { id: s.id } }))
  }
}
