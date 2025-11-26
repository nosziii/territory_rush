<template>
  <div class="flex gap-4 items-center">
    <div
      v-for="pill in pills"
      :key="pill.label"
      class="relative group overflow-hidden px-4 py-2 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center gap-3 shadow-lg transition-transform hover:scale-105"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <span class="text-lg" role="img" :aria-label="pill.label">{{ pill.icon }}</span>
      <div class="flex flex-col leading-none">
        <span class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{{ pill.label }}</span>
        <span class="text-white font-mono font-medium text-lg tracking-wide">{{ pill.value }}</span>
      </div>
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
  { label: "Gold", value: gold.value.toString(), icon: "🪙", color: "text-amber-300" },
  { label: "Metal", value: "0", icon: "🔩", color: "text-sky-300" },
  { label: "Crystal", value: "0", icon: "💎", color: "text-purple-300" },
]);
</script>

