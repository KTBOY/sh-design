/*
 * @Author: zlc
 * @Date: 2026-08-22 16:54:16
 * @LastEditTime: 2026-08-22 17:37:40
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \sh-ui\docs\.vitepress\theme\components\uni-demo.ts
 */
/**
 * shukelab H5 站点地址解析：
 * - 开发态联调本地 uni-app H5 dev server（shukelab `npm run dev:h5`，
 *   端口见其 manifest.json h5.devServer.port）；
 * - 生产态指向 GitHub Pages 部署地址（shukelab 仓库 .github/workflows/deploy-h5.yml 自动发布）。
 * import.meta.env.DEV
  ? 'http://localhost:5175/shukelab/'
  : 'https://ktboy.github.io/shukelab/'
 */
export const uniH5Origin ='https://ktboy.github.io/shukelab/' 

/** 页面路径（pages.json 中的 path）→ hash 路由完整地址；传入完整 http(s) 地址时原样返回 */
export function resolveUniSrc(src: string): string {
  return /^https?:\/\//.test(src) ? src : uniH5Origin + '#' + src
}
