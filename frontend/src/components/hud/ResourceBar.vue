<template>
  <div class="flex gap-4 items-center">
    <div
      v-for="pill in pills"
      :key="pill.label"
      class="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 flex items-center gap-2 text-sm font-semibold"
    >
      <span :class="pill.color">{{ pill.label }}</span>
      <span class="text-white">{{ pill.value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const pills = [
  { label: "Gold", value: "1200", color: "text-amber-300" },
  { label: "Metal", value: "600", color: "text-sky-300" },
  { label: "Crystal", value: "75", color: "text-purple-300" },
];
</script>
