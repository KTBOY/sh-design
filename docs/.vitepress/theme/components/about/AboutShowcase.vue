<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { withBase } from 'vitepress'
import { EXPERIENCE, PROFILE, PROJECTS, SKILLS } from '../../about/meta'

const videoSrc = withBase('/kyoto-bg.webm')

let observer: IntersectionObserver | undefined

onMounted(() => {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) document.querySelector<HTMLVideoElement>('.about-bg__video')?.pause()

  const targets = document.querySelectorAll('.about-page .reveal')
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('in'))
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12 }
  )
  targets.forEach((el) => observer?.observe(el))
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="about-page">
    <!-- 视频背景：fixed 全屏，滚动时保持电影感 -->
    <div class="about-bg" aria-hidden="true">
      <video class="about-bg__video" :src="videoSrc" autoplay muted loop playsinline preload="auto" />
      <div class="about-bg__scrim" />
      <div class="about-bg__vignette" />
    </div>

    <main class="about-content">
      <!-- ===== Hero ===== -->
      <header class="hero">
        <p class="overline">{{ PROFILE.overline }}</p>
        <h1 class="hero__name">
          {{ PROFILE.name }}<span class="hero__dot">.</span>
        </h1>
        <p class="hero__role">{{ PROFILE.role }}</p>
        <p class="hero__role-zh">{{ PROFILE.roleZh }}</p>
        <p class="hero__tagline">
          <em>{{ PROFILE.tagline }}</em>
          <span>{{ PROFILE.taglineZh }}</span>
        </p>
        <div class="hero__cta">
          <a v-for="link in PROFILE.links" :key="link.href" class="btn" :href="link.href" target="_blank" rel="noreferrer">
            {{ link.label }}
          </a>
        </div>
        <div class="hero__scroll" aria-hidden="true">
          <span>Scroll</span>
          <i />
        </div>
      </header>

      <!-- ===== Selected Projects ===== -->
      <section id="projects" class="sec">
        <div class="sec-head reveal">
          <span class="sec-no">01</span>
          <h2 class="sec-title">Selected Projects</h2>
          <span class="sec-zh">精选项目</span>
        </div>
        <div class="proj-grid">
          <article v-for="p in PROJECTS" :key="p.no" class="proj-card reveal">
            <div class="proj-card__top">
              <span class="proj-card__no">{{ p.no }}</span>
              <div class="proj-card__links">
                <a v-for="l in p.links" :key="l.href" :href="l.href" target="_blank" rel="noreferrer">{{ l.label }}</a>
              </div>
            </div>
            <h3 class="proj-card__name">{{ p.name }}</h3>
            <p class="proj-card__zh">{{ p.nameZh }}</p>
            <p class="proj-card__desc">{{ p.desc }}</p>
            <ul class="proj-card__tags">
              <li v-for="t in p.tags" :key="t">{{ t }}</li>
            </ul>
          </article>
        </div>
      </section>

      <!-- ===== Experience ===== -->
      <section id="experience" class="sec">
        <div class="sec-head reveal">
          <span class="sec-no">02</span>
          <h2 class="sec-title">Experience</h2>
          <span class="sec-zh">经历</span>
        </div>
        <ol class="timeline">
          <li v-for="(e, i) in EXPERIENCE" :key="i" class="timeline__item reveal">
            <span class="timeline__period">{{ e.period }}</span>
            <h3 class="timeline__role">{{ e.role }}</h3>
            <p class="timeline__org">{{ e.org }}</p>
            <p class="timeline__desc">{{ e.desc }}</p>
          </li>
        </ol>
      </section>

      <!-- ===== Skills ===== -->
      <section id="skills" class="sec">
        <div class="sec-head reveal">
          <span class="sec-no">03</span>
          <h2 class="sec-title">Toolbox</h2>
          <span class="sec-zh">技能</span>
        </div>
        <div class="skill-grid">
          <div v-for="g in SKILLS" :key="g.title" class="skill-group reveal">
            <h3 class="skill-group__title">
              {{ g.title }}<span>{{ g.titleZh }}</span>
            </h3>
            <ul class="skill-group__items">
              <li v-for="s in g.items" :key="s">{{ s }}</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ===== Contact ===== -->
      <footer class="contact reveal">
        <p class="contact__hi">Let’s build something warm.</p>
        <p class="contact__zh">一起做点有温度的东西。</p>
        <div class="hero__cta">
          <a v-for="link in PROFILE.links" :key="link.href" class="btn" :href="link.href" target="_blank" rel="noreferrer">
            {{ link.label }}
          </a>
        </div>
        <p class="contact__copy">© 2026 {{ PROFILE.name }} · Background: Kyoto Remix Scene</p>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.about-page {
  position: relative;
  min-height: 100vh;
  background: #1a110c;
  color: #f5eee2;
  overflow: clip;
  --sakura: #e6a5ae;
  --sakura-soft: rgba(230, 165, 174, 0.55);
  --cream: #f5eee2;
  --hairline: rgba(245, 238, 226, 0.16);
  --serif: 'Playfair Display', Georgia, 'Times New Roman', 'Songti SC', serif;
}

/* ===== 背景 ===== */
/* 视频从导航栏下沿开始：VPNavBar 右侧有一段透明间隙，视频顶到 0 会从间隙
 * 漏进头部栏，故 top 让出导航栏高度（让出的条带由 .about-page 底色填充）。 */
.about-bg {
  position: fixed;
  top: var(--vp-nav-height);
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
}

.about-bg__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #2b1c14;
  /* 源视频自带米色留白与倾斜画框边，放大裁切只取京都场景内部作为氛围背景 */
  transform: scale(1.45);
}

.about-bg__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(26, 17, 12, 0.72),
    rgba(26, 17, 12, 0.42) 34%,
    rgba(26, 17, 12, 0.5) 68%,
    rgba(26, 17, 12, 0.86)
  );
}

.about-bg__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 90% at 50% 10%, transparent 55%, rgba(16, 9, 6, 0.5) 100%);
}

.about-content {
  position: relative;
  z-index: 1;
}

/* ===== Hero ===== */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 110px 8vw 72px;
}

.overline {
  font-size: 12px;
  letter-spacing: 0.42em;
  text-transform: uppercase;
  color: var(--sakura);
  margin-bottom: 20px;
}

.hero__name {
  font-family: var(--serif);
  font-style: italic;
  font-weight: 600;
  font-size: clamp(64px, 11vw, 148px);
  line-height: 1.02;
  letter-spacing: 0.01em;
  margin: 0;
}

.hero__dot {
  color: var(--sakura);
}

.hero__role {
  margin-top: 28px;
  font-size: clamp(17px, 2vw, 22px);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cream);
}

.hero__role-zh {
  margin-top: 8px;
  font-size: 15px;
  letter-spacing: 0.3em;
  color: rgba(245, 238, 226, 0.72);
}

.hero__tagline {
  margin-top: 36px;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-left: 2px solid var(--sakura-soft);
  padding-left: 18px;
}

.hero__tagline em {
  font-family: var(--serif);
  font-size: 19px;
}

.hero__tagline span {
  font-size: 14px;
  color: rgba(245, 238, 226, 0.72);
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 44px;
}

.btn {
  padding: 10px 26px;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  font-size: 14px;
  letter-spacing: 0.08em;
  color: var(--cream);
  background: rgba(26, 17, 12, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition:
    border-color 0.25s ease,
    background 0.25s ease,
    transform 0.25s ease;
}

.btn:hover {
  border-color: var(--sakura);
  background: rgba(230, 165, 174, 0.14);
  transform: translateY(-2px);
}

.hero__scroll {
  position: absolute;
  left: 8vw;
  bottom: 34px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: rgba(245, 238, 226, 0.55);
}

.hero__scroll i {
  width: 56px;
  height: 1px;
  background: linear-gradient(to right, var(--sakura-soft), transparent);
  animation: about-scroll-pulse 2.4s ease-in-out infinite;
}

@keyframes about-scroll-pulse {
  0%,
  100% {
    transform: scaleX(0.4);
    opacity: 0.5;
  }
  50% {
    transform: scaleX(1);
    opacity: 1;
  }
}

/* ===== 通用 Section ===== */
.sec {
  max-width: 1080px;
  margin: 0 auto;
  padding: 88px 24px;
}

.sec-head {
  display: flex;
  align-items: baseline;
  gap: 18px;
  margin-bottom: 44px;
}

.sec-no {
  font-family: var(--serif);
  font-style: italic;
  font-size: 15px;
  color: var(--sakura);
}

.sec-title {
  font-family: var(--serif);
  font-style: italic;
  font-weight: 600;
  font-size: clamp(30px, 4.4vw, 44px);
  margin: 0;
}

.sec-zh {
  font-size: 13px;
  letter-spacing: 0.4em;
  color: rgba(245, 238, 226, 0.6);
}

.sec-head::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--hairline);
  align-self: center;
}

/* ===== Projects ===== */
.proj-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
}

@media (max-width: 820px) {
  .proj-grid {
    grid-template-columns: 1fr;
  }
}

.proj-card {
  display: flex;
  flex-direction: column;
  padding: 28px;
  border: 1px solid var(--hairline);
  border-radius: 18px;
  background: rgba(24, 15, 11, 0.42);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition:
    transform 0.3s ease,
    border-color 0.3s ease,
    background 0.3s ease;
}

.proj-card:hover {
  transform: translateY(-4px);
  border-color: var(--sakura-soft);
  background: rgba(24, 15, 11, 0.56);
}

.proj-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.proj-card__no {
  font-family: var(--serif);
  font-style: italic;
  color: var(--sakura);
  font-size: 15px;
}

.proj-card__links {
  display: flex;
  gap: 14px;
}

.proj-card__links a {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(245, 238, 226, 0.66);
  border-bottom: 1px solid transparent;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.proj-card__links a:hover {
  color: var(--sakura);
  border-color: var(--sakura-soft);
}

.proj-card__name {
  font-family: var(--serif);
  font-style: italic;
  font-size: 26px;
  font-weight: 600;
  margin: 0;
}

.proj-card__zh {
  margin: 6px 0 14px;
  font-size: 13px;
  letter-spacing: 0.22em;
  color: rgba(245, 238, 226, 0.66);
}

.proj-card__desc {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.8;
  color: rgba(245, 238, 226, 0.85);
}

.proj-card__tags {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  list-style: none;
}

.proj-card__tags li {
  padding: 4px 12px;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  font-size: 12px;
  color: rgba(245, 238, 226, 0.72);
}

/* ===== Experience ===== */
.timeline {
  margin: 0;
  padding: 0 0 0 28px;
  list-style: none;
  border-left: 1px solid var(--hairline);
}

.timeline__item {
  position: relative;
  padding: 0 0 44px 26px;
}

.timeline__item:last-child {
  padding-bottom: 0;
}

.timeline__item::before {
  content: '';
  position: absolute;
  left: -33px;
  top: 8px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--sakura);
  box-shadow: 0 0 0 5px rgba(230, 165, 174, 0.18);
}

.timeline__period {
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--sakura);
}

.timeline__role {
  margin: 10px 0 4px;
  font-family: var(--serif);
  font-style: italic;
  font-size: 22px;
  font-weight: 600;
}

.timeline__org {
  margin: 0 0 10px;
  font-size: 13px;
  letter-spacing: 0.16em;
  color: rgba(245, 238, 226, 0.66);
}

.timeline__desc {
  margin: 0;
  max-width: 640px;
  font-size: 14px;
  line-height: 1.8;
  color: rgba(245, 238, 226, 0.85);
}

/* ===== Skills ===== */
.skill-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
}

@media (max-width: 820px) {
  .skill-grid {
    grid-template-columns: 1fr;
  }
}

.skill-group {
  padding: 24px 26px;
  border: 1px solid var(--hairline);
  border-radius: 18px;
  background: rgba(24, 15, 11, 0.36);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.skill-group__title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 0 0 16px;
  font-family: var(--serif);
  font-style: italic;
  font-size: 20px;
  font-weight: 600;
}

.skill-group__title span {
  font-family: inherit;
  font-style: normal;
  font-size: 12px;
  letter-spacing: 0.3em;
  color: rgba(245, 238, 226, 0.6);
}

.skill-group__items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.skill-group__items li {
  padding: 5px 14px;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  font-size: 13px;
  color: rgba(245, 238, 226, 0.8);
  transition:
    border-color 0.2s ease,
    color 0.2s ease;
}

.skill-group__items li:hover {
  border-color: var(--sakura-soft);
  color: var(--sakura);
}

/* ===== Contact ===== */
.contact {
  padding: 110px 8vw 64px;
  text-align: center;
}

.contact__hi {
  font-family: var(--serif);
  font-style: italic;
  font-size: clamp(30px, 5vw, 52px);
  font-weight: 600;
  margin: 0;
}

.contact__zh {
  margin: 14px 0 0;
  font-size: 14px;
  letter-spacing: 0.34em;
  color: rgba(245, 238, 226, 0.7);
}

.contact .hero__cta {
  justify-content: center;
}

.contact__copy {
  margin-top: 72px;
  font-size: 12px;
  letter-spacing: 0.14em;
  color: rgba(245, 238, 226, 0.45);
}

/* ===== 滚动浮现 ===== */
.reveal {
  opacity: 0;
  transform: translateY(26px);
  transition:
    opacity 0.7s ease,
    transform 0.7s ease;
}

.reveal.in {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .hero__scroll i {
    animation: none;
  }
}
</style>
