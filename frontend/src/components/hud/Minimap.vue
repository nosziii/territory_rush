<template>
  <div class="glass rounded-lg p-4">
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-semibold">Minimap</h3>
      <span class="text-xs text-slate-400">preview</span>
    </div>
    <div class="grid grid-cols-8 gap-1">
      <div
        v-for="i in 32"
        :key="i"
        class="w-4 h-4 rounded-sm"
        :class="{
          'bg-primary/70': i % 5 === 0,
          'bg-secondary/70': i % 7 === 0,
          'bg-slate-700': i % 5 !== 0 && i % 7 !== 0,
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
