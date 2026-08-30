<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { EFFECTS, KIND_CONFIG, SKILLS } from '../../showcase/meta'
import type { ShowcaseKind, ShowcaseMeta } from '../../showcase/meta'
import { getDemoMap } from '../../showcase/demos'

/**
 * showcase 画廊页（/skills/ 与 /css/ 共用），两套视觉体系：
 *  - skills：浅色极简——白底细边框、左对齐 Hero、Bento 卡片墙、内嵌深色舞台；
 *  - effects：魔法星核（复刻 components_remix_scene.mp4）——深空底 + 呼吸的
 *    白光核 / 多层彩晕 / 旋转星云 + 线框星轨球 + 漫天星尘。
 * 卡片内嵌真实演示组件（非截图），点击进入动态路由详情页看完整源码。
 */
const props = defineProps<{ kind: ShowcaseKind }>()

const config = computed(() => KIND_CONFIG[props.kind])
const items = computed<ShowcaseMeta[]>(() => (props.kind === 'skills' ? SKILLS : EFFECTS))
function demoOf(id: string) {
  return getDemoMap(props.kind)[id]?.component
}
function detailHref(id: string) {
  return withBase(`/${config.value.dir}/${id}`)
}

/* effects 悬浮高光：把鼠标在卡片内的坐标写入 CSS 变量，径向光斑跟随 */
const gridRef = ref<HTMLElement>()
function onCardMove(e: MouseEvent) {
  const card = (e.target as HTMLElement).closest?.('.showcase-card')
  if (!(card instanceof HTMLElement)) return
  const rect = card.getBoundingClientRect()
  card.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  card.style.setProperty('--my', `${e.clientY - rect.top}px`)
}
onMounted(() => gridRef.value?.addEventListener('mousemove', onCardMove))
onBeforeUnmount(() => gridRef.value?.removeEventListener('mousemove', onCardMove))

/* 确定性伪随机：SSR 与客户端结果一致，避免水合不匹配 */
const rand = (i: number, salt: number) => {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return v - Math.floor(v)
}
/* effects 星尘：46 颗（闪烁 + 缓慢漂移） */
const particles = Array.from({ length: 46 }, (_, i) => ({
  left: (rand(i, 1) * 100).toFixed(2) + '%',
  top: (rand(i, 6) * 72).toFixed(2) + '%',
  size: 2 + Math.round(rand(i, 2) * 3),
  delay: (rand(i, 3) * 9).toFixed(2) + 's',
  dim: (0.3 + rand(i, 5) * 0.55).toFixed(2),
  dx: (rand(i, 7) * 64 - 32).toFixed(1) + 'px',
  dy: (-8 - rand(i, 8) * 44).toFixed(1) + 'px',
  twinkle: (2.2 + rand(i, 9) * 2.8).toFixed(2) + 's'
}))
</script>

<template>
  <div class="showcase-page" :data-kind="kind">
    <!-- ===== effects 背景：魔法星核 ===== -->
    <div v-if="kind === 'effects'" class="showcase-bg" aria-hidden="true">
      <!-- 白光核 + 多层彩晕呼吸 + 双层反向旋转星云 -->
      <div class="bg-nebula">
        <div class="bg-aura bg-aura--cyan"></div>
        <div class="bg-aura bg-aura--violet"></div>
        <div class="bg-aura bg-aura--blue"></div>
        <div class="bg-cloud"></div>
        <div class="bg-cloud bg-cloud--late"></div>
        <div class="bg-core"></div>
      </div>
      <!-- 线框星轨球：经纬圆环组成的星笼 + 一颗沿倾斜光环运行的星点 -->
      <div class="bg-orb">
        <div class="bg-orb__cage">
          <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
          <div class="bg-orb__halo"></div>
        </div>
      </div>
      <div class="bg-particles">
        <span
          v-for="(p, i) in particles"
          :key="i"
          :style="{ left: p.left, top: p.top, width: p.size + 'px', height: p.size + 'px', '--dim': p.dim, '--delay': p.delay, '--dx': p.dx, '--dy': p.dy, '--tw': p.twinkle }"
        ></span>
      </div>
      <div class="bg-vignette"></div>
    </div>

    <!-- ===== skills 头部：浅色极简 ===== -->
    <header v-if="kind === 'skills'" class="light-hero">
      <span class="light-eyebrow"><i></i>{{ config.eyebrow }}</span>
      <h1 class="light-title">{{ config.name }}</h1>
      <p class="light-slogan">{{ config.slogan }}</p>
      <p class="light-desc">{{ config.desc }}</p>
      <div class="light-meta">
        <span>{{ items.length }} 个技能卡</span><i></i>
        <span>100% 纯 CSS</span><i></i>
        <span>零 JS 依赖</span><i></i>
        <span class="light-meta__hl">点击卡片查看完整源码 ↘</span>
      </div>
    </header>

    <!-- ===== effects 头部 ===== -->
    <header v-else class="showcase-hero">
      <span class="showcase-eyebrow">
        <i class="showcase-eyebrow__dot"></i>{{ config.eyebrow }}
      </span>
      <h1 class="showcase-title">{{ config.name }}</h1>
      <p class="showcase-slogan">{{ config.slogan }}</p>
      <p class="showcase-desc">{{ config.desc }}</p>
      <div class="showcase-stats">
        <span class="showcase-stats__chip">{{ items.length }} 个特效</span>
        <span class="showcase-stats__chip">100% 纯 CSS</span>
        <span class="showcase-stats__chip">零 JS 依赖</span>
        <span class="showcase-stats__chip showcase-stats__chip--hl">点击卡片查看完整源码 ↘</span>
      </div>
    </header>

    <!-- ===== skills 卡片墙：Bento ===== -->
    <div v-if="kind === 'skills'" class="light-grid">
      <a
        v-for="(item, i) in items"
        :key="item.id"
        class="light-card"
        :class="{ 'light-card--feat': i === 0 && items.length > 1, 'light-card--solo': items.length === 1 }"
        :href="detailHref(item.id)"
      >
        <span class="light-card__no">
          {{ String(i + 1).padStart(2, '0') }}<template v-if="i === 0 && items.length > 1"> · FEATURED</template>
        </span>
        <div class="light-card__stage">
          <component :is="demoOf(item.id)" />
        </div>
        <div class="light-card__body">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
          <div class="light-card__row">
            <div class="light-card__tags">
              <span v-for="t in item.tags" :key="t">{{ t }}</span>
            </div>
            <span class="light-card__cta">
              查看完整 CSS
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M13.22 5.47a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06l3.97-3.97H4.75a.75.75 0 0 1 0-1.5h12.44l-3.97-3.97a.75.75 0 0 1 0-1.06Z"
                />
              </svg>
            </span>
          </div>
        </div>
      </a>
    </div>

    <!-- ===== effects 卡片墙 ===== -->
    <div v-else ref="gridRef" class="showcase-grid">
      <a
        v-for="(item, i) in items"
        :key="item.id"
        class="showcase-card"
        :style="{ '--i': i }"
        :href="detailHref(item.id)"
      >
        <span class="showcase-card__spot" aria-hidden="true"></span>
        <div class="showcase-card__preview">
          <component :is="demoOf(item.id)" />
        </div>
        <div class="showcase-card__body">
          <div class="showcase-card__head">
            <h3>{{ item.title }}</h3>
            <span class="showcase-card__no">{{ String(i + 1).padStart(2, '0') }}</span>
          </div>
          <p class="showcase-card__desc">{{ item.desc }}</p>
          <div class="showcase-card__tags">
            <span v-for="t in item.tags" :key="t">{{ t }}</span>
          </div>
          <div class="showcase-card__cta">
            <span>查看完整 CSS</span>
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path
                fill="currentColor"
                d="M13.22 5.47a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06l3.97-3.97H4.75a.75.75 0 0 1 0-1.5h12.44l-3.97-3.97a.75.75 0 0 1 0-1.06Z"
              />
            </svg>
          </div>
        </div>
      </a>
    </div>

    <footer :class="kind === 'skills' ? 'light-foot' : 'showcase-foot'">
      <p>持续更新中 · 所有效果均可复制源码直接用于你的项目</p>
    </footer>
  </div>
</template>

<style scoped>
/* ================= 页面画布 ================= */
.showcase-page {
  position: relative;
  min-height: 100vh;
  background: #070b18;
  color: #e2e8f0;
  overflow: clip;
}
.showcase-page[data-kind='skills'] {
  background: #fafafa;
  color: #111214;
  -webkit-font-smoothing: antialiased;
}

.showcase-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-vignette {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(120% 90% at 50% 0%, transparent 55%, rgba(4, 7, 15, 0.55) 100%),
    linear-gradient(to bottom, transparent 82%, rgba(4, 7, 15, 0.85) 100%);
}

/* ================= skills：浅色极简头部 ================= */
.light-hero {
  position: relative;
  z-index: 1;
  max-width: 1120px;
  margin: 0 auto;
  padding: calc(var(--vp-nav-height, 56px) + 52px) 32px 64px;
}

.light-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.light-eyebrow i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2563eb;
}

.light-title {
  margin: 18px 0 16px;
  font-size: clamp(36px, 6vw, 52px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.12;
  color: #0a0a0b;
}

.light-slogan {
  margin: 0 0 10px;
  font-size: 19px;
  font-weight: 500;
  color: #111214;
}

.light-desc {
  max-width: 560px;
  font-size: 15px;
  line-height: 1.8;
  color: #6b7280;
}

.light-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 30px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  color: #6b7280;
}
.light-meta i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #d1d5db;
}
.light-meta__hl {
  color: #2563eb;
  font-weight: 500;
}

/* ================= skills：Bento 卡片墙 ================= */
.light-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 32px 56px;
}

.light-card {
  position: relative;
  display: flex;
  flex-direction: column;
  grid-column: span 2;
  border: 1px solid #e7e7ea;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}
.light-card:hover {
  transform: translateY(-3px);
  border-color: #d4d4d8;
  box-shadow:
    0 12px 32px -16px rgba(10, 10, 11, 0.14),
    0 2px 8px rgba(10, 10, 11, 0.05);
}
.light-card--feat {
  grid-column: span 4;
  grid-row: span 2;
}
.light-card--solo {
  grid-column: 1 / -1;
}

.light-card__no {
  position: absolute;
  top: 16px;
  right: 18px;
  z-index: 3;
  color: rgba(226, 232, 240, 0.55);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
}

/* 内嵌深色舞台：演示组件自带深色底，这里只负责圆角裁切与留白 */
.light-card__stage {
  position: relative;
  height: 200px;
  margin: 10px;
  border-radius: 12px;
  overflow: hidden;
  background: #0b0d14;
}
.light-card--feat .light-card__stage,
.light-card--solo .light-card__stage {
  flex: 1;
  height: auto;
  min-height: 320px;
}

.light-card__body {
  padding: 8px 20px 20px;
}
.light-card__body h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #0a0a0b;
}
.light-card--feat .light-card__body h3,
.light-card--solo .light-card__body h3 {
  font-size: 19px;
}
.light-card__body p {
  margin: 6px 0 12px;
  font-size: 13px;
  line-height: 1.7;
  color: #6b7280;
}

.light-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.light-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.light-card__tags span {
  padding: 3px 9px;
  border: 1px solid #ececef;
  border-radius: 999px;
  background: #fafafa;
  color: #6b7280;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
}

.light-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  color: #111214;
  font-size: 13px;
  font-weight: 500;
}
.light-card__cta svg {
  color: #2563eb;
  transition: transform 0.25s ease;
}
.light-card:hover .light-card__cta svg {
  transform: translateX(4px);
}

/* skills 页脚 */
.light-foot {
  position: relative;
  z-index: 1;
  max-width: 1120px;
  margin: 0 auto;
  padding: 28px 32px 52px;
  border-top: 1px solid #ececef;
  text-align: center;
  color: #9ca3af;
  font-size: 12.5px;
  letter-spacing: 0.04em;
}
.light-foot p {
  margin: 0;
}

/* ================= effects 背景：魔法星核 ================= */
.showcase-page[data-kind='effects'] {
  background: radial-gradient(120% 100% at 50% 30%, #0a1024 0%, #05070f 62%);
}

.bg-nebula {
  position: absolute;
  inset: 0;
}

/* 白色光核：呼吸明暗 */
.bg-core {
  position: absolute;
  left: 50%;
  top: 30%;
  width: clamp(180px, 30vw, 300px);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(224, 242, 254, 0.55) 22%,
    rgba(103, 232, 249, 0.26) 40%,
    transparent 68%
  );
  filter: blur(10px);
  animation: core-breathe 5.5s ease-in-out infinite;
}
@keyframes core-breathe {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.16);
    opacity: 1;
  }
}

/* 多层彩晕：青 → 蓝紫 → 暗紫，错相呼吸扩散 */
.bg-aura {
  position: absolute;
  left: 50%;
  top: 30%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  filter: blur(72px);
  animation: aura-pulse 9s ease-in-out infinite;
}
.bg-aura--cyan {
  width: clamp(420px, 66vw, 720px);
  aspect-ratio: 1;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.5), transparent 62%);
}
.bg-aura--violet {
  width: clamp(500px, 80vw, 880px);
  aspect-ratio: 1;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.45), transparent 62%);
  animation-delay: -3s;
}
.bg-aura--blue {
  width: clamp(380px, 58vw, 640px);
  aspect-ratio: 1;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.4), transparent 62%);
  animation-delay: -6s;
}
@keyframes aura-pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(0.92);
    opacity: 0.34;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.12);
    opacity: 0.62;
  }
}

/* 旋转星云：两片反向慢转的 conic 云雾叠出流动感 */
.bg-cloud {
  position: absolute;
  left: 50%;
  top: 30%;
  width: clamp(360px, 58vw, 640px);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  filter: blur(46px);
  mix-blend-mode: screen;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(34, 211, 238, 0.16) 70deg,
    transparent 140deg,
    rgba(167, 139, 250, 0.18) 220deg,
    transparent 300deg,
    rgba(37, 99, 235, 0.14) 340deg,
    transparent 360deg
  );
  animation: cloud-spin 26s linear infinite;
}
.bg-cloud--late {
  animation-duration: 38s;
  animation-direction: reverse;
  opacity: 0.7;
}
@keyframes cloud-spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* 线框星轨球：外层负责居中与透视，内层笼子整体旋转 */
.bg-orb {
  position: absolute;
  left: 50%;
  top: 30%;
  width: clamp(230px, 40vw, 350px);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  perspective: 1100px;
}
.bg-orb__cage {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  animation: orb-spin 32s linear infinite;
}
.bg-orb__cage i {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(103, 232, 249, 0.34);
  box-shadow:
    0 0 14px rgba(34, 211, 238, 0.2),
    inset 0 0 18px rgba(34, 211, 238, 0.13);
}
/* 4 条经线 + 赤道 + 2 条斜向大圆，拼成星笼 */
.bg-orb__cage i:nth-child(1) {
  transform: rotateY(0deg);
}
.bg-orb__cage i:nth-child(2) {
  transform: rotateY(30deg);
}
.bg-orb__cage i:nth-child(3) {
  transform: rotateY(60deg);
}
.bg-orb__cage i:nth-child(4) {
  transform: rotateY(90deg);
}
.bg-orb__cage i:nth-child(5) {
  transform: rotateX(90deg);
}
.bg-orb__cage i:nth-child(6) {
  transform: rotate3d(1, 1, 0, 62deg);
}
.bg-orb__cage i:nth-child(7) {
  transform: rotate3d(-1, 1, 0, 55deg);
}
@keyframes orb-spin {
  from {
    transform: rotateX(-16deg) rotateY(0deg);
  }
  to {
    transform: rotateX(-16deg) rotateY(360deg);
  }
}

/* 倾斜光环 + 沿环运行的星点 */
.bg-orb__halo {
  position: absolute;
  inset: -16%;
  border-radius: 50%;
  border: 1px solid rgba(167, 139, 250, 0.4);
  box-shadow: 0 0 16px rgba(167, 139, 250, 0.24);
  animation: halo-spin 7s linear infinite;
}
.bg-orb__halo::after {
  content: '';
  position: absolute;
  top: -4px;
  left: calc(50% - 3.5px);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  box-shadow:
    0 0 12px rgba(224, 242, 254, 1),
    0 0 26px rgba(103, 232, 249, 0.8);
}
@keyframes halo-spin {
  from {
    transform: rotateX(76deg) rotateZ(0deg);
  }
  to {
    transform: rotateX(76deg) rotateZ(360deg);
  }
}

/* 漫天星尘：明暗闪烁（opacity）+ 缓慢漂移（transform），两组动画互不冲突 */
.bg-particles span {
  position: absolute;
  border-radius: 50%;
  background: #e0f2fe;
  box-shadow: 0 0 8px rgba(224, 242, 254, 0.95);
  animation:
    star-twinkle var(--tw, 3s) ease-in-out infinite,
    star-drift 12s ease-in-out infinite alternate;
  animation-delay: var(--delay, 0s), var(--delay, 0s);
}
@keyframes star-twinkle {
  0%,
  100% {
    opacity: var(--dim, 0.5);
    filter: brightness(1);
  }
  50% {
    opacity: 0.08;
    filter: brightness(1.9);
  }
}
@keyframes star-drift {
  to {
    transform: translate(var(--dx, 14px), var(--dy, -20px));
  }
}

/* ================= effects 头部 ================= */
.showcase-hero {
  position: relative;
  z-index: 1;
  max-width: 880px;
  margin: 0 auto;
  padding: calc(var(--vp-nav-height, 56px) + 68px) 24px 56px;
  text-align: center;
}

.showcase-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  border: 1px solid rgba(34, 211, 238, 0.35);
  border-radius: 999px;
  background: rgba(8, 15, 34, 0.6);
  color: #7dd3fc;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  letter-spacing: 0.18em;
}
.showcase-eyebrow__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.9);
  animation: eyebrow-pulse 1.8s ease-in-out infinite;
}
@keyframes eyebrow-pulse {
  50% {
    opacity: 0.35;
  }
}

.showcase-title {
  margin: 22px 0 12px;
  font-size: clamp(34px, 6.4vw, 58px);
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.15;
  background: linear-gradient(92deg, #e0f2fe 8%, #7dd3fc 32%, #22d3ee 50%, #a78bfa 72%, #e0f2fe 94%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: title-flow 7s linear infinite;
}
@keyframes title-flow {
  to {
    background-position: 200% center;
  }
}

.showcase-slogan {
  margin: 0 0 10px;
  color: #f1f5f9;
  font-size: clamp(15px, 2.4vw, 19px);
  font-weight: 600;
}

.showcase-desc {
  margin: 0 auto;
  max-width: 620px;
  color: rgba(148, 163, 184, 0.95);
  font-size: 14px;
  line-height: 1.85;
}

.showcase-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 26px;
}
.showcase-stats__chip {
  padding: 6px 14px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.55);
  color: rgba(203, 213, 225, 0.92);
  font-size: 12.5px;
}
.showcase-stats__chip--hl {
  border-color: rgba(34, 211, 238, 0.45);
  color: #67e8f9;
}

/* ================= effects 卡片墙 ================= */
.showcase-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(296px, 1fr));
  gap: 24px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 28px 30px;
}

/* 只有一个演示时，卡片保持正常宽度并居中，避免被 auto-fill 拉满整行 */
.showcase-grid:has(> .showcase-card:only-child) {
  grid-template-columns: minmax(0, 460px);
  justify-content: center;
}

.showcase-card {
  --mx: 50%;
  --my: 50%;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 18px;
  overflow: hidden;
  background: rgba(13, 20, 40, 0.72);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: 0 14px 34px -20px rgba(2, 6, 23, 0.9);
  text-decoration: none;
  color: inherit;
  animation: card-in 0.65s cubic-bezier(0.2, 0.7, 0.3, 1) both;
  animation-delay: calc(var(--i) * 70ms);
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
.showcase-card:hover {
  transform: translateY(-7px);
  border-color: rgba(34, 211, 238, 0.5);
  box-shadow:
    0 26px 52px -22px rgba(2, 6, 23, 1),
    0 0 32px -10px rgba(34, 211, 238, 0.38);
}
@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(28px) scale(0.97);
  }
}

/* 跟随鼠标的径向光斑 */
.showcase-card__spot {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: radial-gradient(260px circle at var(--mx) var(--my), rgba(34, 211, 238, 0.14), transparent 62%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.showcase-card:hover .showcase-card__spot {
  opacity: 1;
}

.showcase-card__preview {
  height: 172px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  overflow: hidden;
}

.showcase-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px 18px 18px;
}

.showcase-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}
.showcase-card__head h3 {
  margin: 0;
  color: #f1f5f9;
  font-size: 17px;
  font-weight: 700;
}
.showcase-card__no {
  color: rgba(94, 234, 212, 0.75);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  letter-spacing: 0.1em;
}

.showcase-card__desc {
  flex: 1;
  margin: 8px 0 12px;
  color: rgba(148, 163, 184, 0.95);
  font-size: 13px;
  line-height: 1.7;
}

.showcase-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.showcase-card__tags span {
  padding: 3px 9px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 6px;
  color: rgba(125, 211, 252, 0.9);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
}

.showcase-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 14px;
  color: #22d3ee;
  font-size: 13px;
  font-weight: 600;
}
.showcase-card__cta svg {
  transition: transform 0.3s ease;
}
.showcase-card:hover .showcase-card__cta svg {
  transform: translateX(5px);
}

/* ================= effects 页脚 ================= */
.showcase-foot {
  position: relative;
  z-index: 1;
  padding: 26px 24px 44px;
  text-align: center;
  color: rgba(100, 116, 139, 0.9);
  font-size: 12.5px;
  letter-spacing: 0.06em;
}

/* ================= 响应式 & 动效降级 ================= */
@media (max-width: 960px) {
  .light-card {
    grid-column: span 3;
  }
  .light-card--feat {
    grid-column: 1 / -1;
    grid-row: auto;
  }
  .light-card--feat .light-card__stage {
    min-height: 260px;
  }
}

@media (max-width: 640px) {
  .light-hero {
    padding-top: calc(var(--vp-nav-height, 56px) + 40px);
    padding-bottom: 44px;
  }
  .light-grid {
    grid-template-columns: 1fr;
    padding: 0 18px 40px;
  }
  .light-card,
  .light-card--feat,
  .light-card--solo {
    grid-column: 1 / -1;
    grid-row: auto;
  }
  .showcase-hero {
    padding-top: calc(var(--vp-nav-height, 56px) + 44px);
    padding-bottom: 40px;
  }
  .showcase-grid {
    grid-template-columns: 1fr;
    padding: 0 18px 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .showcase-page *,
  .showcase-page *::before,
  .showcase-page *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
