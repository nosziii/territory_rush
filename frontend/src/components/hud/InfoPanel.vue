<template>
  <div v-if="tile" class="glass p-4 rounded-xl border border-white/10 shadow-lg w-64">
    <h3 class="font-bold text-slate-200 uppercase tracking-wider text-sm mb-2 border-b border-white/10 pb-1">
      Scanner Feed
    </h3>
    
    <div class="space-y-2">
      <!-- Tile Info -->
      <div class="flex justify-between items-center">
        <span class="text-slate-400 text-xs">Terrain</span>
        <span class="text-emerald-400 font-mono text-sm uppercase">{{ tile.type }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400 text-xs">Owner</span>
        <span class="font-mono text-sm uppercase" :class="ownerColor(tile.owner)">
          {{ tile.owner || 'Neutral' }}
        </span>
      </div>
      
      <!-- Unit Info -->
      <div v-if="unit" class="mt-3 pt-2 border-t border-white/5">
        <div class="flex justify-between items-center mb-1">
          <span class="text-slate-400 text-xs">Unit</span>
          <span class="text-white font-bold text-sm">{{ unit.type }}</span>
        </div>
        <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            class="h-full bg-green-500" 
            :style="{ width: `${(unit.hp / 100) * 100}%` }"
          ></div>
        </div>
        <div class="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>HP: {{ unit.hp }}</span>
          <span>DMG: {{ unit.dmg }}</span>
        </div>
      </div>

      <!-- Building Info -->
      <div v-if="building" class="mt-3 pt-2 border-t border-white/5">
        <div class="flex justify-between items-center mb-1">
          <span class="text-slate-400 text-xs">Building</span>
          <span class="text-amber-400 font-bold text-sm">{{ building.type }}</span>
        </div>
        <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            class="h-full bg-amber-500" 
            :style="{ width: `${(building.hp / 400) * 100}%` }"
          ></div>
        </div>
        <div class="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>HP: {{ building.hp }}</span>
          <span>LVL: {{ building.level }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../../store/game";

const game = useGameStore();

const tile = computed(() => {
  if (!game.hoveredTile) return null;
  return game.tiles.find(t => t.x === game.hoveredTile!.x && t.y === game.hoveredTile!.y);
});

const unit = computed(() => {
  if (!game.hoveredTile) return null;
  // Find unit on this tile
  return game.units.find(u => Math.round(u.x) === game.hoveredTile!.x && Math.round(u.y) === game.hoveredTile!.y);
});

const building = computed(() => {
  if (!game.hoveredTile) return null;
  return game.buildings.find(b => Math.round(b.x) === game.hoveredTile!.x && Math.round(b.y) === game.hoveredTile!.y);
});

function ownerColor(owner: string | null) {
  if (!owner) return "text-slate-500";
  if (owner === "player") return "text-orange-400";
  return "text-cyan-400";
}
</script>
