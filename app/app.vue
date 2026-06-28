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

<style>
:root {
  --una-background: 0.934 0.005 340;
  --una-foreground: 0.035 0.008 50;
  --una-card: 1 0 0;
  --una-card-foreground: 0.035 0.008 50;
  --una-muted: 0.905 0.005 340;
  --una-muted-foreground: 0.55 0.005 340;
  --una-border: 0.875 0.005 340;
  --una-primary: 0.035 0.008 50;
  --una-primary-foreground: 1 0 0;
  --una-accent: 0.72 0.16 55;
  --una-accent-foreground: 1 0 0;
  --una-ring: 0.035 0.008 50;
}

.dark {
  --una-background: 0.035 0.008 50;
  --una-foreground: 0.934 0.005 340;
  --una-card: 0.05 0.008 50;
  --una-card-foreground: 0.934 0.005 340;
  --una-muted: 0.06 0.008 50;
  --una-muted-foreground: 0.55 0.005 340;
  --una-border: 0.09 0.008 50;
  --una-primary: 0.934 0.005 340;
  --una-primary-foreground: 0.035 0.008 50;
  --una-accent: 0.72 0.16 55;
  --una-accent-foreground: 1 0 0;
  --una-ring: 0.934 0.005 340;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}
</style>
