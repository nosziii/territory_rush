<template>
  <div class="glass rounded-xl p-4 border border-white/10 shadow-2xl bg-slate-900/80 backdrop-blur-md">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-bold text-slate-200 tracking-wide text-sm uppercase">Tactical Map</h3>
      <span class="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-900">LIVE FEED</span>
    </div>
    <div class="relative rounded-lg overflow-hidden border border-slate-700 shadow-inner">
      <div class="grid" :style="gridStyle">
        <div
          v-for="tile in tiles"
          :key="`${tile.x}-${tile.y}`"
          class="w-2 h-2 transition-colors duration-300"
          :style="{ backgroundColor: color(tile.owner, tile.type) }"
        ></div>
      </div>
      <!-- Scanline effect -->
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-full w-full animate-scan pointer-events-none"></div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../../store/game";

const game = useGameStore();
const tiles = computed(() => game.tiles ?? []);
const gridStyle = computed(() => ({
  display: "grid",
  gridTemplateColumns: `repeat(14, 1fr)`,
  gap: "2px",
}));

function color(owner: string | null, type: string) {
  if (type === "water") return "#0ea5e9";
  if (!owner) return "#1f2937";
  if (owner === "player") return "#f97316";
  if (owner === "ai1") return "#38bdf8";
  if (owner === "ai2") return "#8b5cf6";
  if (owner === "ai3") return "#22c55e";
  return "#94a3b8";
}
</script>
