---
layout: false
title: 滚动锁定视频 · Vue 实装
search: false
---

<script setup>
import { ScrollLockedVideoHero } from '@motion-effects/vue'
</script>

<!--
  供文档站的「Vue 3 实装」区域用 iframe 加载的裸页面。
  这个组件挂载期间会锁定页面滚动且不会自行解锁，所以必须独占一个文档，不能内联进文档页。
-->

<ScrollLockedVideoHero />

<style>
/* 没有主题布局，去掉浏览器默认的 body 外边距 */
body {
  margin: 0;
}
</style>
