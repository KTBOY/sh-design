---
layout: page
title: Skill 技能详情
---

<script setup>
import { useData } from 'vitepress'
const { params } = useData()
</script>

<ShowcaseDetail kind="skills" :id="params?.id" />
