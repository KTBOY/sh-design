interface Box {
  left: number
  top: number
  width: number
  height: number
}

interface Clip {
  left: number
  top: number
  right: number
  bottom: number
}

interface Flow {
  owner: Element
  rects: Box[]
  clip: Clip
  grouped: boolean
  shape: boolean
  theme: string
}

interface Block extends Box {
  radius: string
  clip: Clip
  theme: string
}

const hiddenAttribute = 'data-sh-skeleton-hidden'
const groupAttribute = 'data-sh-skeleton-group'
const widthAttribute = 'data-sh-skeleton-width'
const heightAttribute = 'data-sh-skeleton-height'
const themeProperties = [
  '--sh-skeleton-bg',
  '--sh-skeleton-highlight',
  '--sh-skeleton-duration',
  '--sh-radius-sm'
] as const
const mediaTags = new Set([
  'IMG',
  'VIDEO',
  'CANVAS',
  'IFRAME',
  'SVG',
  'INPUT',
  'TEXTAREA',
  'SELECT'
])
const skippedTags = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'BR', 'WBR', 'NOSCRIPT'])

/** 提示只接受正数像素值（可带 px），不让百分比或无效输入改变真实布局。 */
function readSize(el: Element, name: string) {
  const raw = el.getAttribute(name)?.trim() ?? ''
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)(?:px)?$/.test(raw)) return undefined
  const size = Number.parseFloat(raw)
  return Number.isFinite(size) && size > 0 ? size : undefined
}

/** 小字号单位与正文共享视觉行，换行后的片段仍保留为独立条。 */
function mergeLines(rects: Box[]) {
  const lines: Box[] = []
  for (const rect of rects.sort((a, b) => a.top - b.top || a.left - b.left)) {
    const line = lines.find((item) => {
      const overlap =
        Math.min(item.top + item.height, rect.top + rect.height) - Math.max(item.top, rect.top)
      return overlap > Math.min(item.height, rect.height) / 2
    })
    if (!line) {
      lines.push({ ...rect })
      continue
    }
    const right = Math.max(line.left + line.width, rect.left + rect.width)
    const bottom = Math.max(line.top + line.height, rect.top + rect.height)
    line.left = Math.min(line.left, rect.left)
    line.top = Math.min(line.top, rect.top)
    line.width = right - line.left
    line.height = bottom - line.top
  }
  return lines
}

/** 保留 CSS 尺寸的小数，并用实际边框盒校正浏览器扣除的滚动条宽度。 */
function borderSize(style: CSSStyleDeclaration, axis: 'width' | 'height', offsetSize: number) {
  const sides = axis === 'width' ? ['left', 'right'] : ['top', 'bottom']
  let size = Number.parseFloat(style[axis])
  if (style.boxSizing !== 'border-box') {
    for (const side of sides) {
      size += Number.parseFloat(style.getPropertyValue(`padding-${side}`)) || 0
      size += Number.parseFloat(style.getPropertyValue(`border-${side}-width`)) || 0
    }
  }
  return Number.isFinite(size) ? size + (offsetSize - Math.round(size)) : offsetSize
}

/** 私有 DOM 控制器：仅加载期间按需合帧，读完整棵内容树后再统一写绘制层。 */
export function createDeepSkeleton(host: HTMLElement) {
  const doc = host.ownerDocument
  const view = doc.defaultView!
  const colorScheme = view.matchMedia('(prefers-color-scheme: dark)')
  const layer = doc.createElement('div')
  layer.className = 'sh-skeleton-deep__layer'
  layer.setAttribute('aria-hidden', 'true')
  const originalBusy = host.getAttribute('aria-busy')
  host.setAttribute('aria-busy', 'true')
  host.appendChild(layer)

  const hidden = new Map<Element, string | null>()
  const observed = new Set<Element>()
  let frame = 0
  let stopped = false

  /** 事件只标记一次待测量帧，不启动常驻轮询。 */
  function schedule() {
    if (!stopped && !frame) frame = view.requestAnimationFrame(measure)
  }

  const resizeObserver = new ResizeObserver(schedule)
  const mutationObserver = new MutationObserver((records) => {
    if (
      records.some((record) => {
        if (layer.contains(record.target)) return false
        if (record.type === 'attributes' && record.attributeName === hiddenAttribute) return false
        if (record.type === 'childList') {
          return [...record.addedNodes, ...record.removedNodes].some((node) => node !== layer)
        }
        return true
      })
    )
      schedule()
  })

  function observeMutations() {
    mutationObserver.observe(host, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true
    })
    // 局部 token 可能引用根主题变量；祖先换肤也要重新解析，但不观察兄弟子树。
    for (let ancestor = host.parentElement; ancestor; ancestor = ancestor.parentElement) {
      mutationObserver.observe(ancestor, { attributes: true })
    }
    if (doc.head) {
      mutationObserver.observe(doc.head, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      })
    }
  }

  function restoreHidden(el: Element, original: string | null) {
    if (original === null) el.removeAttribute(hiddenAttribute)
    else el.setAttribute(hiddenAttribute, original)
  }

  /** 视口坐标减去宿主内边框原点，再除缩放；绘制层用 scroll 偏移抵消宿主滚动。 */
  function measure() {
    frame = 0
    if (stopped) return
    const hostStyle = view.getComputedStyle(host)
    const hostRect = host.getBoundingClientRect()
    const scaleX = hostRect.width / borderSize(hostStyle, 'width', host.offsetWidth) || 1
    const scaleY = hostRect.height / borderSize(hostStyle, 'height', host.offsetHeight) || 1
    const originX = hostRect.left + host.clientLeft * scaleX
    const originY = hostRect.top + host.clientTop * scaleY
    const width = host.clientWidth
    const height = host.clientHeight
    const scrollLeft = host.scrollLeft
    const scrollTop = host.scrollTop
    const viewport: Clip = { left: 0, top: 0, right: width, bottom: height }
    const flows: Flow[] = []
    const elements = new Set<Element>([host])
    const nextHidden = new Set<Element>()
    const styles = new Map<Element, CSSStyleDeclaration>([[host, hostStyle]])
    const range = doc.createRange()

    function styleOf(el: Element) {
      let style = styles.get(el)
      if (!style) {
        style = view.getComputedStyle(el)
        styles.set(el, style)
      }
      return style
    }

    /** @description 只传来源作用域与宿主不同的已解析 token，共同主题继续由 CSS 继承。 */
    function readTheme(style: CSSStyleDeclaration): string {
      return themeProperties
        .map((name) => {
          const value = style.getPropertyValue(name).trim()
          if (value === hostStyle.getPropertyValue(name).trim()) return ''
          return `${name}:${value || 'initial'};`
        })
        .join('')
    }

    function toBox(rect: DOMRect): Box {
      return {
        left: (rect.left - originX) / scaleX,
        top: (rect.top - originY) / scaleY,
        width: rect.width / scaleX,
        height: rect.height / scaleY
      }
    }

    function visibleBox(box: Box, clip: Clip): Box | undefined {
      const left = Math.max(box.left, clip.left)
      const top = Math.max(box.top, clip.top)
      const right = Math.min(box.left + box.width, clip.right)
      const bottom = Math.min(box.top + box.height, clip.bottom)
      return right > left && bottom > top
        ? { left, top, width: right - left, height: bottom - top }
        : undefined
    }

    function newFlow(owner: Element, clip: Clip, grouped = false, shape = false): Flow {
      const flow = { owner, clip, grouped, shape, theme: readTheme(styleOf(owner)), rects: [] }
      flows.push(flow)
      return flow
    }

    /** contents 没有自身盒子；普通 flex/grid 子项各有文本流，只有显式 group 才跨项合行。 */
    function walk(el: Element, inherited: Flow, parentClip: Clip) {
      if (
        el.classList.contains('sh-skeleton-deep__layer') ||
        skippedTags.has(el.tagName.toUpperCase())
      )
        return
      const style = styleOf(el)
      if (style.display === 'none' || Number(style.opacity) === 0) return
      elements.add(el)
      const isVisible = style.visibility === 'visible'
      let clip = parentClip
      if (el !== host && style.display !== 'contents' && el instanceof HTMLElement) {
        const clipsX = /^(auto|scroll|hidden|clip)$/.test(style.overflowX)
        const clipsY = /^(auto|scroll|hidden|clip)$/.test(style.overflowY)
        if (clipsX || clipsY) {
          const rect = el.getBoundingClientRect()
          const sx = rect.width / borderSize(style, 'width', el.offsetWidth) || scaleX
          const sy = rect.height / borderSize(style, 'height', el.offsetHeight) || scaleY
          const left = (rect.left + el.clientLeft * sx - originX) / scaleX
          const top = (rect.top + el.clientTop * sy - originY) / scaleY
          clip = {
            left: clipsX ? Math.max(clip.left, left) : clip.left,
            top: clipsY ? Math.max(clip.top, top) : clip.top,
            right: clipsX
              ? Math.min(clip.right, left + (el.clientWidth * sx) / scaleX)
              : clip.right,
            bottom: clipsY
              ? Math.min(clip.bottom, top + (el.clientHeight * sy) / scaleY)
              : clip.bottom
          }
        }
      }

      const isMedia = mediaTags.has(el.tagName.toUpperCase())
      const isEmpty = !el.children.length && !el.textContent?.trim()
      if ((isMedia || isEmpty) && style.display !== 'contents') {
        if (!isVisible || el === host) return
        const box = toBox(el.getBoundingClientRect())
        if (box.width > 0 && box.height > 0) {
          nextHidden.add(el)
          if (inherited.grouped) {
            const visible = visibleBox(box, clip)
            if (visible) inherited.rects.push(visible)
          } else {
            newFlow(el, parentClip, false, true).rects.push(box)
          }
        }
        return
      }

      let flow = inherited
      if (!inherited.grouped) {
        const theme = readTheme(style)
        if (theme !== inherited.theme && inherited.rects.length) {
          // 截断前段，避免父流跨过不同主题的 inline 后又合成一条；同主题单位不拆分。
          flows.push({ ...inherited })
          inherited.rects = []
        }
        if (el.hasAttribute(groupAttribute)) {
          flow = newFlow(el, clip, true)
        } else if (
          el === host ||
          (style.display !== 'contents' && !/^inline/.test(style.display)) ||
          clip !== parentClip ||
          theme !== inherited.theme ||
          readSize(el, widthAttribute) !== undefined ||
          readSize(el, heightAttribute) !== undefined
        ) {
          flow = newFlow(el, clip)
        }
      }
      for (const child of el.childNodes) {
        if (child.nodeType === 1) {
          walk(child as Element, flow, clip)
        } else if (child.nodeType === 3 && isVisible && child.textContent?.trim()) {
          range.selectNodeContents(child)
          for (const rect of range.getClientRects()) {
            const box = toBox(rect)
            if (box.width <= 0 || box.height <= 0) continue
            if (flow.grouped) {
              const visible = visibleBox(box, clip)
              if (visible) flow.rects.push(visible)
            } else {
              flow.rects.push(box)
            }
          }
        }
      }
    }

    if (width && height) walk(host, newFlow(host, viewport), viewport)
    const blocks: Block[] = []
    for (const flow of flows) {
      const style = styleOf(flow.owner)
      const hintedWidth = readSize(flow.owner, widthAttribute)
      const hintedHeight = readSize(flow.owner, heightAttribute)
      const radius =
        flow.shape || /[1-9]/.test(style.borderRadius)
          ? style.borderRadius
          : 'var(--sh-radius-sm, 4px)'
      for (const rect of flow.shape ? flow.rects : mergeLines(flow.rects)) {
        const box = {
          ...rect,
          width: hintedWidth ?? rect.width,
          height: hintedHeight ?? rect.height
        }
        if (visibleBox(box, flow.clip)) {
          blocks.push({ ...box, radius, clip: flow.clip, theme: flow.theme })
        }
      }
    }

    // 自身标记和绘制层的写入不进入 MutationObserver；ResizeObserver 只观察真实盒子。
    mutationObserver.disconnect()
    for (const [el, original] of hidden) {
      if (!nextHidden.has(el)) {
        restoreHidden(el, original)
        hidden.delete(el)
      }
    }
    for (const el of nextHidden) {
      if (!hidden.has(el)) hidden.set(el, el.getAttribute(hiddenAttribute))
      if (el.getAttribute(hiddenAttribute) !== '') el.setAttribute(hiddenAttribute, '')
    }
    // Vue 的纯文本更新可能替换宿主全部子节点，只补回私有层，不触碰真实节点。
    if (layer.parentNode !== host) host.appendChild(layer)
    const layerStyle = `left:${scrollLeft}px;top:${scrollTop}px;width:${width}px;height:${height}px;`
    if (layer.getAttribute('style') !== layerStyle) layer.setAttribute('style', layerStyle)
    blocks.forEach((block, index) => {
      let node = layer.children[index] as HTMLElement | undefined
      if (!node) {
        node = doc.createElement('div')
        node.className = 'sh-skeleton-deep__block'
        layer.appendChild(node)
      }
      const { left, top, width, height, radius, clip, theme } = block
      const inset = [
        Math.max(0, clip.top - top),
        Math.max(0, left + width - clip.right),
        Math.max(0, top + height - clip.bottom),
        Math.max(0, clip.left - left)
      ]
      const css = `left:${left}px;top:${top}px;width:${width}px;height:${height}px;border-radius:${radius};clip-path:inset(${inset.map((value) => `${value}px`).join(' ')});${theme}`
      if (node.getAttribute('style') !== css) node.setAttribute('style', css)
    })
    while (layer.children.length > blocks.length) layer.lastElementChild?.remove()
    for (const el of observed) {
      if (!elements.has(el)) {
        resizeObserver.unobserve(el)
        observed.delete(el)
      }
    }
    for (const el of elements) {
      if (!observed.has(el)) {
        resizeObserver.observe(el)
        observed.add(el)
      }
    }
    observeMutations()
  }

  observeMutations()
  resizeObserver.observe(host)
  observed.add(host)
  host.addEventListener('scroll', schedule, true)
  host.addEventListener('load', schedule, true)
  view.addEventListener('resize', schedule)
  colorScheme.addEventListener('change', schedule)
  doc.fonts?.addEventListener('loadingdone', schedule)
  schedule()

  /** 释放所有观察器、监听、待执行帧与私有节点，真实节点始终原位保留。 */
  function stop() {
    stopped = true
    if (frame) view.cancelAnimationFrame(frame)
    frame = 0
    resizeObserver.disconnect()
    mutationObserver.disconnect()
    host.removeEventListener('scroll', schedule, true)
    host.removeEventListener('load', schedule, true)
    view.removeEventListener('resize', schedule)
    colorScheme.removeEventListener('change', schedule)
    doc.fonts?.removeEventListener('loadingdone', schedule)
    for (const [el, original] of hidden) restoreHidden(el, original)
    hidden.clear()
    observed.clear()
    layer.remove()
    if (originalBusy === null) host.removeAttribute('aria-busy')
    else host.setAttribute('aria-busy', originalBusy)
  }

  return { schedule, stop }
}
