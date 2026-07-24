<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { computed } from 'vue'
import CursorGlow from './components/CursorGlow.vue'

const { Layout } = DefaultTheme
const { frontmatter } = useData()

// Only render the animated background on the home page.
const isHome = computed(() => frontmatter.value.layout === 'home')
</script>

<template>
  <CursorGlow v-if="isHome" />
  <Layout />
</template>
