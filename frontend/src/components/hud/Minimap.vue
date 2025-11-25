<template>
  <div class="glass rounded-lg p-4">
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-semibold">Minimap</h3>
      <span class="text-xs text-slate-400">14x14</span>
    </div>
    <div class="grid" :style="gridStyle">
      <div
        v-for="tile in tiles"
        :key="`${tile.x}-${tile.y}`"
        class="w-2 h-2"
        :style="{ backgroundColor: color(tile.owner, tile.type) }"
      ></div>
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
