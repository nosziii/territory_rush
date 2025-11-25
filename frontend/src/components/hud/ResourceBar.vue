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
import { computed } from "vue";
import { useGameStore } from "../../store/game";

const game = useGameStore();
const gold = computed(() => {
  const me = game.resources.find((r) => r.owner === game.playerId);
  return me ? me.gold : 0;
});

const pills = computed(() => [
  { label: "Gold", value: gold.value.toString(), color: "text-amber-300" },
  { label: "Metal", value: "0", color: "text-sky-300" },
  { label: "Crystal", value: "0", color: "text-purple-300" },
]);
</script>
