<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { UI_DESIGN, type UiScreen } from '../../about/meta'

/**
 * 个人主页 03 UI Design 区块：司机端双模设计稿与两支 30s 影片。
 * 外壳沿用 about 页既有 token（白卡 / 细边框 / 蓝色强调 / 等宽编号），
 * 设计稿自身的黑白与荧光绿只存在于图片像素里，不进入站点配色。
 */
const modeId = ref<'day' | 'night'>('day')
const mode = computed(
  () => UI_DESIGN.modes.find((m) => m.id === modeId.value) ?? UI_DESIGN.modes[0]
)
const specHref = computed(() => withBase(UI_DESIGN.specHref))

const mounted = ref(false)
const zoom = ref<UiScreen | null>(null)
const playing = ref<string | null>(null)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeZoom()
}

function openScreen(screen: UiScreen) {
  zoom.value = screen
  document.addEventListener('keydown', onKeydown)
  document.body.style.overflow = 'hidden'
}

function closeZoom() {
  if (!zoom.value) return
  zoom.value = null
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
}

function play(id: string) {
  playing.value = id
}

onMounted(() => {
  mounted.value = true
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="ui-design">
    <!-- ===== 导语 ===== -->
    <article class="ui-intro reveal">
      <h3 class="ui-intro__name">{{ UI_DESIGN.name }}</h3>
      <p class="ui-intro__zh">{{ UI_DESIGN.nameZh }}</p>
      <p class="ui-intro__desc">{{ UI_DESIGN.desc }}</p>
      <div class="ui-intro__foot">
        <ul class="ui-chips">
          <li v-for="c in UI_DESIGN.chips" :key="c">{{ c }}</li>
        </ul>
        <a class="ui-spec-link" :href="specHref">
          查看完整设计规范
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              fill="currentColor"
              d="M13.22 5.47a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06l3.97-3.97H4.75a.75.75 0 0 1 0-1.5h12.44l-3.97-3.97a.75.75 0 0 1 0-1.06Z"
            />
          </svg>
        </a>
      </div>
    </article>

    <!-- ===== 光环境切换：决定下方所有设计稿 ===== -->
    <div class="ui-switch-row reveal">
      <div class="ui-switch" role="group" aria-label="切换光环境">
        <button
          v-for="m in UI_DESIGN.modes"
          :key="m.id"
          type="button"
          class="ui-switch__btn"
          :class="{ 'is-on': modeId === m.id }"
          :aria-pressed="modeId === m.id"
          @click="modeId = m.id"
        >
          {{ m.label }}
          <em>{{ m.labelEn }}</em>
        </button>
      </div>
      <p class="ui-switch__note">{{ mode.note }}</p>
    </div>

    <!-- ===== 展示板：双模对照 + 系统规范 ===== -->
    <div :key="`boards-${modeId}`" class="ui-boards reveal">
      <figure v-for="s in [mode.lead, mode.board]" :key="s.id" class="ui-board">
        <button type="button" class="ui-board__shot" @click="openScreen(s)">
          <img :src="withBase(s.src)" :alt="s.alt" loading="lazy" decoding="async" />
        </button>
        <figcaption class="ui-board__cap">
          <span>{{ s.label }}</span>
          <i>点击放大</i>
        </figcaption>
      </figure>
    </div>

    <!-- ===== 样张墙：六张手机屏 ===== -->
    <div :key="`wall-${modeId}`" class="ui-wall reveal">
      <figure v-for="s in mode.screens" :key="s.id" class="ui-shot">
        <button type="button" class="ui-shot__frame" @click="openScreen(s)">
          <img :src="withBase(s.src)" :alt="s.alt" loading="lazy" decoding="async" />
        </button>
        <figcaption class="ui-shot__cap">{{ s.label }}</figcaption>
      </figure>
    </div>

    <!-- ===== 影片带 ===== -->
    <div class="ui-films reveal">
      <article v-for="f in UI_DESIGN.films" :key="f.id" class="ui-film">
        <div class="ui-film__stage">
          <video
            v-if="playing === f.id"
            :src="withBase(f.video)"
            class="ui-film__video"
            autoplay
            muted
            controls
            playsinline
          />
          <button
            v-else
            type="button"
            class="ui-film__play"
            :aria-label="`播放${f.titleZh}`"
            @click="play(f.id)"
          >
            <img :src="withBase(f.poster)" :alt="f.alt" loading="lazy" decoding="async" />
            <span class="ui-film__badge">
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M8 5.4v13.2c0 .6.66.97 1.17.66l10.2-6.6a.78.78 0 0 0 0-1.32L9.17 4.74A.78.78 0 0 0 8 5.4Z"
                />
              </svg>
              播放 30 秒
            </span>
          </button>
        </div>
        <div class="ui-film__meta">
          <h4 class="ui-film__title">
            {{ f.titleZh }}<em>{{ f.title }}</em>
          </h4>
          <p class="ui-film__style">{{ f.style }}</p>
          <ul class="ui-film__spec">
            <li v-for="s in f.spec" :key="s">{{ s }}</li>
          </ul>
          <p class="ui-film__credit">{{ f.credit }}</p>
        </div>
      </article>
    </div>

    <!-- ===== 放大层：只在客户端渲染，避免 SSR 找不到 body ===== -->
    <Teleport v-if="mounted && zoom" to="body">
      <div
        class="ui-zoom"
        role="dialog"
        aria-modal="true"
        :aria-label="zoom.alt"
        @click.self="closeZoom"
      >
        <div class="ui-zoom__inner">
          <img :src="withBase(zoom.src)" :alt="zoom.alt" />
          <div class="ui-zoom__bar">
            <span>{{ mode.label }} · {{ zoom.label }}</span>
            <button type="button" class="ui-zoom__close" @click="closeZoom">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.ui-design {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== 导语 ===== */
.ui-intro {
  padding: 26px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
}

.ui-intro__name {
  margin: 0;
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ink);
}

.ui-intro__zh {
  margin: 6px 0 14px;
  font-size: 13px;
  letter-spacing: 0.16em;
  color: var(--muted);
}

.ui-intro__desc {
  margin: 0;
  max-width: 68ch;
  font-size: 14px;
  line-height: 1.85;
  color: var(--muted);
}

.ui-intro__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}

.ui-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ui-chips li {
  padding: 3px 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fafafa;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
}

.ui-spec-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--blue);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.ui-spec-link:hover {
  border-color: var(--blue);
}

.ui-spec-link svg {
  transition: transform 0.25s ease;
}

.ui-spec-link:hover svg {
  transform: translateX(3px);
}

/* ===== 光环境切换 ===== */
.ui-switch-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
}

.ui-switch {
  display: inline-flex;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
}

.ui-switch__btn {
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  padding: 8px 22px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.25s ease,
    color 0.25s ease;
}

.ui-switch__btn em {
  font-family: var(--mono);
  font-style: normal;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.7;
}

.ui-switch__btn:hover {
  color: var(--ink);
}

.ui-switch__btn.is-on {
  background: var(--ink);
  color: #fff;
}

.ui-switch__note {
  margin: 0;
  flex: 1;
  min-width: 220px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--muted);
}

/* ===== 展示板 ===== */
.ui-boards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.ui-board {
  margin: 0;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
}

.ui-board__shot {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: transparent;
  cursor: zoom-in;
  overflow: hidden;
}

.ui-board__shot img {
  display: block;
  width: 100%;
  height: auto;
  transition: transform 0.35s ease;
}

.ui-board__shot:hover img {
  transform: scale(1.015);
}

.ui-board__cap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 4px 2px;
  font-size: 13px;
  color: var(--ink);
}

.ui-board__cap i {
  font-family: var(--mono);
  font-style: normal;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #9ca3af;
}

/* ===== 样张墙 ===== */
.ui-wall {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}

@media (max-width: 900px) {
  .ui-wall {
    grid-template-columns: repeat(3, 1fr);
  }
}

.ui-shot {
  margin: 0;
  padding: 8px 8px 0;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.ui-shot:hover {
  transform: translateY(-3px);
  border-color: #d4d4d8;
  box-shadow:
    0 12px 32px -16px rgba(10, 10, 11, 0.18),
    0 2px 8px rgba(10, 10, 11, 0.05);
}

.ui-shot__frame {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: transparent;
  cursor: zoom-in;
  overflow: hidden;
}

.ui-shot__frame img {
  display: block;
  width: 100%;
  height: auto;
}

.ui-shot__cap {
  padding: 10px 2px 11px;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--muted);
}

/* ===== 影片带 ===== */
.ui-films {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.ui-film {
  display: grid;
  grid-template-columns: 176px minmax(0, 1fr);
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
}

/* 竖幅影片按 9:16 原比例呈现，靠缩略图列宽控制高度，不做裁切 */
.ui-film__stage {
  position: relative;
  aspect-ratio: 9 / 16;
  background: #0a0a0b;
}

.ui-film__play {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.ui-film__play img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ui-film__badge {
  position: absolute;
  left: 50%;
  top: 50%;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
  transform: translate(-50%, -50%);
  background: rgba(10, 10, 11, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition:
    background 0.25s ease,
    border-color 0.25s ease;
}

.ui-film__play:hover .ui-film__badge {
  background: rgba(37, 99, 235, 0.85);
  border-color: rgba(255, 255, 255, 0.8);
}

.ui-film__video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ui-film__meta {
  padding: 18px 20px 20px;
}

.ui-film__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
}

.ui-film__title em {
  margin-left: 9px;
  font-style: normal;
  font-weight: 400;
  font-size: 12.5px;
  color: var(--muted);
}

.ui-film__style {
  margin: 7px 0 0;
  font-family: var(--mono);
  font-size: 11.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--blue);
}

.ui-film__spec {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.ui-film__spec li {
  padding: 3px 9px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fafafa;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
}

.ui-film__credit {
  margin: 14px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: #9ca3af;
}

/* ===== 放大层 ===== */
.ui-zoom {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: rgba(10, 10, 11, 0.78);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.ui-zoom__inner {
  display: flex;
  flex-direction: column;
  max-width: 92vw;
}

.ui-zoom__inner img {
  display: block;
  max-width: 100%;
  max-height: 78vh;
  margin: 0 auto;
  border-radius: 12px;
  background: #fff;
}

.ui-zoom__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 14px;
  color: #e5e7eb;
  font-size: 13px;
}

.ui-zoom__close {
  padding: 7px 18px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  background: transparent;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.ui-zoom__close:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.7);
}

/* ===== 塌缩 ===== */
@media (max-width: 820px) {
  .ui-boards,
  .ui-films {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .ui-wall {
    grid-template-columns: repeat(2, 1fr);
  }
  .ui-intro {
    padding: 20px;
  }
  .ui-film {
    grid-template-columns: 132px minmax(0, 1fr);
  }
  .ui-film__badge {
    gap: 5px;
    padding: 7px 12px;
    font-size: 12px;
  }
  .ui-film__meta {
    padding: 14px 16px 16px;
  }
}
</style>
