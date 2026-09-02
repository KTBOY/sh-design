<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { computed } from 'vue'
import CursorGlow from './components/CursorGlow.vue'
import HeroBg from './components/HeroBg.vue'
import NavLogo from './components/NavLogo.vue'
import HomeProducts from './components/products/HomeProducts.vue'

const { Layout } = DefaultTheme
const { frontmatter } = useData()

// Only render the animated background on the home page.
const isHome = computed(() => frontmatter.value.layout === 'home')
</script>

<template>
  <HeroBg v-if="isHome" />
  <!-- Full-viewport ambient layer (fixed) so the glass feature cards have an
       animated brand-blue backdrop to blur, continuing the hero's motion. -->
  <CursorGlow v-if="isHome" />
  <Layout>
    <template #nav-bar-title-before>
      <NavLogo />
    </template>
    <!-- 主页「更多产品」区块：与 /products/ 聚合页共用 ProductCard 与数据源。 -->
    <template #home-features-after>
      <HomeProducts />
    </template>
  </Layout>
</template>
