---
layout: page
title: CSS 特效详情
---

<script setup>
import { useData } from 'vitepress'
const { params } = useData()
</script>

<ShowcaseDetail kind="effects" :id="params?.id" />
