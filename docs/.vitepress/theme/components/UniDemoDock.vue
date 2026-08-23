<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { resolveUniSrc } from './uni-demo'

interface DemoItem {
  /** shukelab H5 站内页面路径（pages.json 中的 path），或完整 http(s) 地址 */
  src: string
  /** Tab 标题，缺省展示页面路径 */
  title?: string
  /** 关联正文标题的 id（VitePress 中文标题即原文字符串）；滚动到该标题时自动切换到此 Tab */
  anchor?: string
}

interface TocItem {
  id: string
  text: string
  level: number
}

/**
 * 右侧停靠的手机演示面板：宽屏（≥1440px）固定在页面右侧随滚动常驻，Tab 切换多个示例；
 * 更宽（≥1680px）时面板左侧附带本页文档目录；窄屏回落为正文内嵌的单个手机壳。
 * 每页最多放一个（fixed 定位会叠放）。
 * 宽屏下给所在 .content 挂 has-uni-demo-dock 类，配合 custom.css 限宽 --vp-content-width、
 * 取消居中并隐藏页面 outline，保证正文右缘不压到固定面板（旧内核不支持 :has() 的浏览器
 * 靠这个类兜底）。
 */
const props = withDefaults(
  defineProps<{
    demos: DemoItem[]
    /** 窄屏内联模式下的视口高度 */
    height?: string
  }>(),
  { height: '640px' }
)

const active = ref(0)
const currentSrc = computed(() =>
  props.demos[active.value] ? resolveUniSrc(props.demos[active.value].src) : ''
)

const loading = ref(true)
const reloadKey = ref(0)
const qrOpen = ref(false)
/** 扫码打开用的二维码图片（docs/public 下，需以 / 开头才会拼上站点 base） */
const qrSrc = withBase('/test.png')
const root = ref<HTMLElement | null>(null)
let hostContent: HTMLElement | null = null
let anchorObserver: IntersectionObserver | null = null

const tocItems = ref<TocItem[]>([])
const activeId = ref('')
let tocEls: HTMLElement[] = []
let scrollTicking = false

function switchTo(i: number) {
  if (i === active.value) return
  active.value = i
  loading.value = true
}

function reload() {
  loading.value = true
  reloadKey.value++
}

/** 目录高亮：视口内最上方经过 96px 线的标题即当前章节；页面顶部未命中时高亮第一项 */
function syncTocActive() {
  let current = ''
  for (const h of tocEls) {
    if (h.getBoundingClientRect().top <= 96) current = h.id
  }
  if (current || tocItems.value.length) activeId.value = current || tocItems.value[0].id
}

function onScroll() {
  if (scrollTicking) return
  scrollTicking = true
  requestAnimationFrame(() => {
    scrollTicking = false
    syncTocActive()
  })
}

/** 二维码弹框打开时：点击面板外任意处 / 按 Esc 关闭（iframe 内的点击不冒泡，无法捕获） */
function onDocPointerDown(e: Event) {
  if (root.value && e.target instanceof Node && root.value.contains(e.target)) return
  qrOpen.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') qrOpen.value = false
}

watch(qrOpen, (open) => {
  if (open) {
    document.addEventListener('pointerdown', onDocPointerDown)
    document.addEventListener('keydown', onKeydown)
  } else {
    document.removeEventListener('pointerdown', onDocPointerDown)
    document.removeEventListener('keydown', onKeydown)
  }
})

onMounted(() => {
  hostContent = root.value?.closest('.content') ?? null
  hostContent?.classList.add('has-uni-demo-dock')

  // 面板左侧目录：取正文 h2/h3（剔除 permalink 的 # 尾巴）
  if (hostContent) {
    tocEls = [...hostContent.querySelectorAll<HTMLElement>('.vp-doc h2[id], .vp-doc h3[id]')]
    tocItems.value = tocEls.map((h) => ({
      id: h.id,
      text: h.textContent?.replace(/[\u200B]/g, '').replace(/#\s*$/, '').trim() || h.id,
      level: h.tagName === 'H3' ? 3 : 2
    }))
    if (tocEls.length) {
      syncTocActive()
      window.addEventListener('scroll', onScroll, { passive: true })
    }
  }

  // 滚动联动：demo 带 anchor 时，观察对应正文标题，滚到哪个切换到哪个
  const anchored = props.demos
    .map((d, i) => ({ d, i }))
    .filter(({ d }) => d.anchor && document.getElementById(d.anchor))
  if (anchored.length) {
    anchorObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (!visible.length) return
        const id = (visible[0].target as HTMLElement).id
        const hit = anchored.find(({ d }) => d.anchor === id)
        if (hit) switchTo(hit.i)
      },
      // 视口顶部 ~35% 区域内的标题视为“当前阅读位置”（覆盖 hash 跳转后标题停在顶部的情况）
      { rootMargin: '0px 0px -65% 0px', threshold: 0 }
    )
    anchored.forEach(({ d }) => anchorObserver?.observe(document.getElementById(d.anchor!)!))
  }
})

onBeforeUnmount(() => {
  anchorObserver?.disconnect()
  anchorObserver = null
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('pointerdown', onDocPointerDown)
  document.removeEventListener('keydown', onKeydown)
  hostContent?.classList.remove('has-uni-demo-dock')
})
</script>

<template>
  <div ref="root" class="uni-demo-dock">
    <nav v-if="tocItems.length" class="uni-demo-dock__toc" aria-label="本页目录">
      <div class="uni-demo-dock__toc-title">本页目录</div>
      <a
        v-for="item in tocItems"
        :key="item.id"
        :href="`#${item.id}`"
        class="uni-demo-dock__toc-link"
        :class="{ 'is-active': item.id === activeId, 'is-h3': item.level === 3 }"
      >{{ item.text }}</a>
    </nav>

    <div class="uni-demo-dock__main">
      <div class="uni-demo-dock__bar">
        <span class="uni-demo-dock__dot" aria-hidden="true"></span>
        <span class="uni-demo-dock__actions">
          <button class="uni-demo-dock__action" type="button" title="重新加载" @click="reload">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35Z"/></svg>
          </button>
          <button
            class="uni-demo-dock__action"
            :class="{ 'is-active': qrOpen }"
            type="button"
            title="扫码在手机上打开"
            @click="qrOpen = !qrOpen"
          >
            <svg viewBox="0 0 1024 1024" width="14" height="14" aria-hidden="true"><path d="M874.666667 553.877333V746.666667h-192v-128.021334h-64v258.986667h-64V554.666667h192v127.978666h64v-128.768h64zM469.333333 554.666667v320H149.333333V554.666667h320z m405.333334 256v64h-192v-64h192z m-469.333334-192h-192v192h192v-192z m-64 64v64h-64v-64h64z m128-533.333334v320H149.333333V149.333333h320z m405.333334 0v320H554.666667V149.333333h320z m-469.333334 64h-192v192h192v-192z m405.333334 0h-192v192h192v-192z m-469.333334 64v64h-64v-64h64z m405.333334 0v64h-64v-64h64z" fill="#1677FF"/></svg>
          </button>
        </span>
        <Transition name="uni-demo-dock-paper">
          <div v-if="qrOpen" class="uni-demo-dock__qr">
            <img :src="qrSrc" alt="扫码在手机上打开演示" width="132" height="132" />
            <span>扫码在手机上打开</span>
          </div>
        </Transition>
      </div>
      <div class="uni-demo-dock__viewport" :style="{ '--uni-demo-dock-h': height }">
        <Transition name="uni-demo-dock-fade">
          <div v-if="loading" class="uni-demo-dock__loading">
            <span class="uni-demo-dock__spinner" aria-hidden="true"></span>
            <span>演示加载中…</span>
          </div>
        </Transition>
        <iframe
          :key="`${active}-${reloadKey}`"
          :src="currentSrc"
          class="uni-demo-dock__frame"
          title="uni-app H5 组件演示"
          @load="loading = false"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.uni-demo-dock {
  display: flex;
  gap: 12px;
  align-items: stretch;
  width: min(375px, 100%);
  margin: 16px 0;
}

.uni-demo-dock__toc {
  display: none;
}

.uni-demo-dock__main {
  flex: none;
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  overflow: hidden;
  background: var(--vp-c-bg);
  box-shadow: 0 12px 32px -16px rgba(15, 23, 42, 0.25);
}

.uni-demo-dock__bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px 7px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.uni-demo-dock__dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.18);
}

.uni-demo-dock__tabs {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.uni-demo-dock__tabs::-webkit-scrollbar {
  display: none;
}

.uni-demo-dock__tab {
  flex: none;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 4px 10px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 12px;
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.uni-demo-dock__tab:hover {
  color: var(--vp-c-text-1);
}

.uni-demo-dock__tab.is-active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-default-soft);
  font-weight: 600;
}

.uni-demo-dock__actions {
  display: flex;
  gap: 4px;
}

.uni-demo-dock__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
}

.uni-demo-dock__action:hover,
.uni-demo-dock__action.is-active {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}

.uni-demo-dock__qr {
  position: absolute;
  top: calc(100% + 8px);
  left: 8px;
  z-index: 6;
  /* 纸张展开动画的翻转轴：顶边 */
  transform-origin: top left;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  box-shadow: 0 12px 32px -12px rgba(15, 23, 42, 0.3);
  font-size: 12px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.uni-demo-dock__qr img {
  display: block;
  width: 132px;
  height: 132px;
  border-radius: 8px;
}

.uni-demo-dock__toc-title {
  padding: 8px 0 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.uni-demo-dock__toc-link {
  display: block;
  padding: 4px 0 4px 10px;
  border-left: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-size: 12.5px;
  line-height: 1.5;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.uni-demo-dock__toc-link.is-h3 {
  padding-left: 22px;
}

.uni-demo-dock__toc-link:hover {
  color: var(--vp-c-text-1);
}

.uni-demo-dock__toc-link.is-active {
  border-left-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.uni-demo-dock__viewport {
  position: relative;
  height: var(--uni-demo-dock-h, 640px);
  background: var(--vp-c-bg);
}

.uni-demo-dock__frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.uni-demo-dock__loading {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 13px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg);
}

.uni-demo-dock__spinner {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  animation: uni-demo-dock-rotate 0.8s linear infinite;
}

@keyframes uni-demo-dock-rotate {
  to {
    transform: rotate(360deg);
  }
}

.uni-demo-dock-fade-leave-active {
  transition: opacity 0.25s ease;
}

.uni-demo-dock-fade-leave-to {
  opacity: 0;
}

/* 二维码弹框：纸张翻开效果——沿顶边折下展开，带轻微回弹；收起时反向折回 */
.uni-demo-dock-paper-enter-active {
  transition:
    transform 0.38s cubic-bezier(0.2, 1.4, 0.4, 1),
    opacity 0.25s ease;
}

.uni-demo-dock-paper-leave-active {
  transition:
    transform 0.22s cubic-bezier(0.4, 0, 1, 1),
    opacity 0.18s ease;
}

.uni-demo-dock-paper-enter-from,
.uni-demo-dock-paper-leave-to {
  opacity: 0;
  transform: perspective(700px) rotateX(-58deg) scale(0.6);
}

@media (prefers-reduced-motion: reduce) {
  .uni-demo-dock-paper-enter-active,
  .uni-demo-dock-paper-leave-active {
    transition: opacity 0.15s ease;
  }

  .uni-demo-dock-paper-enter-from,
  .uni-demo-dock-paper-leave-to {
    transform: none;
  }
}

/* 宽屏：停靠在页面右侧常驻（outline 由 custom.css 隐藏、正文靠左，避免压到面板）。
 * 断点 1440：正文靠左后右缘约 232 + --vp-content-width，1440 视口下距面板左缘(1041)仍有余量。 */
@media (min-width: 1440px) {
  .uni-demo-dock {
    position: fixed;
    top: calc(var(--vp-nav-height, 56px) + 20px);
    right: 24px;
    width: auto;
    margin: 0;
    z-index: 20;
  }

  .uni-demo-dock__main {
    width: 375px;
  }

  .uni-demo-dock__viewport {
    height: clamp(480px, calc(100dvh - var(--vp-nav-height, 56px) - 104px), 720px);
  }
}

/* 更宽屏：面板左侧展示文档目录。
 * 1680 起 dock 整体左缘 = 1680-24-200-12-375 = 1069，距正文右缘（~960-1000）仍有余量。 */
@media (min-width: 1680px) {
  .uni-demo-dock__toc {
    display: block;
    width: 200px;
    max-height: clamp(480px, calc(100dvh - var(--vp-nav-height, 56px) - 104px), 720px);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 8px 12px 16px 4px;
    scrollbar-width: thin;
  }
}
</style>
