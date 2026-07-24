<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { computed } from 'vue'
import HeroBg from './components/HeroBg.vue'
import NavLogo from './components/NavLogo.vue'

const { Layout } = DefaultTheme
const { frontmatter } = useData()

// Only render the animated background on the home page.
const isHome = computed(() => frontmatter.value.layout === 'home')
</script>

<template>
  <HeroBg v-if="isHome" />
  <Layout>
    <template #nav-bar-title-before>
      <NavLogo />
    </template>
  </Layout>
</template>
