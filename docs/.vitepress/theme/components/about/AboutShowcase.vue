<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { withBase } from 'vitepress'
import { EXPERIENCE, PROFILE, PROJECTS, SKILLS } from '../../about/meta'
import { TOOL_GROUPS } from '../../products/meta'

/**
 * /guide/about 个人主页：浅色极简风格，与 /skills/ /products/ 同一套视觉
 * 语言（#fafafa 底、细边框白卡、蓝色强调、等宽字体编号）。
 * 「更多工具」区块展示开源项目，全部作品跳转 /products/ 聚合页。
 */
const OSS_TOOLS = TOOL_GROUPS.find((g) => g.id === 'oss')?.items ?? []
const productsHref = withBase('/products/')

let observer: IntersectionObserver | undefined

onMounted(() => {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
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
    <main class="about-content">
      <!-- ===== Hero ===== -->
      <header class="hero reveal">
        <p class="overline"><i></i>{{ PROFILE.overline }}</p>
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

      <!-- ===== More Tools ===== -->
      <section id="tools" class="sec">
        <div class="sec-head reveal">
          <span class="sec-no">02</span>
          <h2 class="sec-title">More Tools</h2>
          <span class="sec-zh">更多工具</span>
        </div>
        <div class="tool-grid">
          <article v-for="(t, i) in OSS_TOOLS" :key="t.name" class="tool-card reveal">
            <div class="tool-card__head">
              <h3 class="tool-card__name">{{ t.name }}<em>{{ t.nameZh }}</em></h3>
              <span class="tool-card__no">{{ String(i + 1).padStart(2, '0') }}</span>
            </div>
            <p class="tool-card__desc">{{ t.desc }}</p>
            <div class="tool-card__tags">
              <span v-for="tag in t.tags" :key="tag">{{ tag }}</span>
            </div>
            <div class="tool-card__links">
              <a
                v-for="link in t.links"
                :key="link.href"
                :class="{ primary: link.primary }"
                :href="link.href"
                target="_blank"
                rel="noreferrer"
              >
                {{ link.label }}
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M13.22 5.47a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06l3.97-3.97H4.75a.75.75 0 0 1 0-1.5h12.44l-3.97-3.97a.75.75 0 0 1 0-1.06Z"
                  />
                </svg>
              </a>
            </div>
          </article>
        </div>
        <a class="tool-more reveal" :href="productsHref">
          查看全部产品与工具（含在线站点）
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path
              fill="currentColor"
              d="M13.22 5.47a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06l3.97-3.97H4.75a.75.75 0 0 1 0-1.5h12.44l-3.97-3.97a.75.75 0 0 1 0-1.06Z"
            />
          </svg>
        </a>
      </section>

      <!-- ===== Experience ===== -->
      <section id="experience" class="sec">
        <div class="sec-head reveal">
          <span class="sec-no">03</span>
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
          <span class="sec-no">04</span>
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
        <p class="contact__hi">Let's build something warm.</p>
        <p class="contact__zh">一起做点有温度的东西。</p>
        <div class="hero__cta">
          <a v-for="link in PROFILE.links" :key="link.href" class="btn" :href="link.href" target="_blank" rel="noreferrer">
            {{ link.label }}
          </a>
        </div>
        <p class="contact__copy">© 2026 {{ PROFILE.name }}</p>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
  background: #fafafa;
  color: #111214;
  -webkit-font-smoothing: antialiased;
  --blue: #2563eb;
  --ink: #0a0a0b;
  --muted: #6b7280;
  --line: #e7e7ea;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.about-content {
  position: relative;
}

/* ===== Hero ===== */
.hero {
  position: relative;
  max-width: 1120px;
  margin: 0 auto;
  padding: calc(var(--vp-nav-height, 56px) + 76px) 32px 72px;
}

.overline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.overline i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--blue);
}

.hero__name {
  margin: 18px 0 0;
  font-size: clamp(56px, 9vw, 108px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: var(--ink);
}

.hero__dot {
  color: var(--blue);
}

.hero__role {
  margin-top: 22px;
  font-size: clamp(17px, 2vw, 21px);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink);
}

.hero__role-zh {
  margin-top: 8px;
  font-size: 15px;
  letter-spacing: 0.3em;
  color: var(--muted);
}

.hero__tagline {
  margin-top: 30px;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-left: 2px solid var(--blue);
  padding-left: 18px;
}

.hero__tagline em {
  font-size: 17px;
  font-weight: 500;
  color: var(--ink);
}

.hero__tagline span {
  font-size: 14px;
  color: var(--muted);
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 38px;
}

.btn {
  padding: 9px 24px;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
  background: #fff;
  text-decoration: none;
  transition:
    border-color 0.25s ease,
    color 0.25s ease,
    background 0.25s ease,
    transform 0.25s ease;
}

.btn:hover {
  border-color: var(--blue);
  color: var(--blue);
  background: rgba(37, 99, 235, 0.05);
  transform: translateY(-2px);
}

.hero__scroll {
  position: absolute;
  right: 32px;
  bottom: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #9ca3af;
}

.hero__scroll i {
  width: 56px;
  height: 1px;
  background: linear-gradient(to right, var(--blue), transparent);
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
  max-width: 1120px;
  margin: 0 auto;
  padding: 72px 32px;
}

.sec-head {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 38px;
}

.sec-no {
  color: var(--blue);
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.1em;
}

.sec-title {
  margin: 0;
  font-size: clamp(26px, 3.6vw, 36px);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ink);
}

.sec-zh {
  font-size: 13px;
  letter-spacing: 0.28em;
  color: #9ca3af;
}

.sec-head::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line);
  align-self: center;
}

/* ===== Selected Projects ===== */
.proj-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 820px) {
  .proj-grid {
    grid-template-columns: 1fr;
  }
}

.proj-card {
  display: flex;
  flex-direction: column;
  padding: 26px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.proj-card:hover {
  transform: translateY(-3px);
  border-color: #d4d4d8;
  box-shadow:
    0 12px 32px -16px rgba(10, 10, 11, 0.14),
    0 2px 8px rgba(10, 10, 11, 0.05);
}

.proj-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.proj-card__no {
  color: var(--blue);
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.1em;
}

.proj-card__links {
  display: flex;
  gap: 14px;
}

.proj-card__links a {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  border-bottom: 1px solid transparent;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.proj-card__links a:hover {
  color: var(--blue);
  border-color: var(--blue);
}

.proj-card__name {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ink);
}

.proj-card__zh {
  margin: 5px 0 12px;
  font-size: 13px;
  letter-spacing: 0.16em;
  color: var(--muted);
}

.proj-card__desc {
  margin: 0 0 18px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--muted);
}

.proj-card__tags {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding: 0;
  list-style: none;
}

.proj-card__tags li {
  padding: 3px 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fafafa;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
}

/* ===== More Tools ===== */
.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 820px) {
  .tool-grid {
    grid-template-columns: 1fr;
  }
}

.tool-card {
  display: flex;
  flex-direction: column;
  padding: 22px 24px 20px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.tool-card:hover {
  transform: translateY(-3px);
  border-color: #d4d4d8;
  box-shadow:
    0 12px 32px -16px rgba(10, 10, 11, 0.14),
    0 2px 8px rgba(10, 10, 11, 0.05);
}

.tool-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.tool-card__name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
}

.tool-card__name em {
  margin-left: 8px;
  font-style: normal;
  font-weight: 400;
  font-size: 12.5px;
  color: var(--muted);
}

.tool-card__no {
  color: #c7c9cf;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.12em;
}

.tool-card__desc {
  flex: 1;
  margin: 10px 0 14px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--muted);
}

.tool-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.tool-card__tags span {
  padding: 3px 9px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fafafa;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
}

.tool-card__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tool-card__links a {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--ink);
  font-size: 12.5px;
  font-weight: 500;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.tool-card__links a:hover {
  border-color: var(--blue);
  color: var(--blue);
  background: rgba(37, 99, 235, 0.05);
}

.tool-card__links a.primary {
  border-color: var(--blue);
  background: var(--blue);
  color: #fff;
}

.tool-card__links a.primary:hover {
  border-color: #1d4ed8;
  background: #1d4ed8;
  color: #fff;
}

.tool-card__links a.primary svg {
  color: #fff;
}

.tool-card__links a svg {
  color: var(--blue);
  transition: transform 0.25s ease;
}

.tool-card__links a:hover svg {
  transform: translateX(3px);
}

.tool-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 26px;
  padding: 10px 22px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  color: var(--ink);
  font-size: 13.5px;
  font-weight: 500;
  text-decoration: none;
  transition:
    border-color 0.25s ease,
    color 0.25s ease,
    transform 0.25s ease;
}

.tool-more:hover {
  border-color: var(--blue);
  color: var(--blue);
  transform: translateY(-2px);
}

.tool-more svg {
  color: var(--blue);
  transition: transform 0.25s ease;
}

.tool-more:hover svg {
  transform: translateX(4px);
}

/* ===== Experience ===== */
.timeline {
  margin: 0;
  padding: 0 0 0 28px;
  list-style: none;
  border-left: 1px solid var(--line);
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
  background: var(--blue);
  box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.12);
}

.timeline__period {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--blue);
}

.timeline__role {
  margin: 10px 0 4px;
  font-size: 21px;
  font-weight: 700;
  color: var(--ink);
}

.timeline__org {
  margin: 0 0 10px;
  font-size: 13px;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.timeline__desc {
  margin: 0;
  max-width: 640px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--muted);
}

/* ===== Skills ===== */
.skill-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 820px) {
  .skill-grid {
    grid-template-columns: 1fr;
  }
}

.skill-group {
  padding: 24px 26px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
}

.skill-group__title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
}

.skill-group__title span {
  font-weight: 400;
  font-size: 12px;
  letter-spacing: 0.24em;
  color: var(--muted);
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
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fafafa;
  font-size: 13px;
  color: #374151;
  transition:
    border-color 0.2s ease,
    color 0.2s ease;
}

.skill-group__items li:hover {
  border-color: var(--blue);
  color: var(--blue);
}

/* ===== Contact ===== */
.contact {
  padding: 96px 32px 56px;
  text-align: center;
}

.contact__hi {
  margin: 0;
  font-size: clamp(28px, 4.4vw, 44px);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ink);
}

.contact__zh {
  margin: 12px 0 0;
  font-size: 14px;
  letter-spacing: 0.3em;
  color: var(--muted);
}

.contact .hero__cta {
  justify-content: center;
}

.contact__copy {
  margin: 56px 0 0;
  padding-top: 24px;
  border-top: 1px solid var(--line);
  max-width: 1120px;
  margin-inline: auto;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  color: #9ca3af;
}

/* ===== 滚动浮现 ===== */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.65s ease,
    transform 0.65s ease;
}

.reveal.in {
  opacity: 1;
  transform: none;
}

@media (max-width: 640px) {
  .hero,
  .sec {
    padding-left: 18px;
    padding-right: 18px;
  }
  .hero__scroll {
    display: none;
  }
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
