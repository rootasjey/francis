<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import '@una-ui/preset/una.css'

useHead({
  bodyAttrs: { class: 'bg-background text-foreground' },
})
</script>
