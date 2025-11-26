<template>
  <div class="glass p-4 rounded-xl border border-white/10 shadow-lg w-64">
    <!-- Faction Legend (Always Visible) -->
    <div class="mb-4 pb-4 border-b border-white/10">
      <h3 class="font-bold text-slate-200 uppercase tracking-wider text-sm mb-2">
        Signal Analysis
      </h3>
      <div class="grid grid-cols-2 gap-2 text-xs font-mono">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" :style="{ backgroundColor: theme.player.hex }"></div>
          <span :style="{ color: theme.player.hex }">YOU (CMD)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: theme.ai1.hex }"></div>
          <span :style="{ color: theme.ai1.hex }">AI-ALPHA</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: theme.ai2.hex }"></div>
          <span :style="{ color: theme.ai2.hex }">AI-BETA</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: theme.ai3.hex }"></div>
          <span :style="{ color: theme.ai3.hex }">AI-GAMMA</span>
        </div>
      </div>
    </div>

    <!-- Scanner Feed (Only visible when hovering) -->
    <div v-if="tile">
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
          <span class="font-mono text-sm uppercase" :style="getOwnerColorStyle(tile.owner)">
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
    
    <div v-else class="text-slate-500 text-xs italic mb-4 text-center py-4 border-b border-white/10">
      Hover over tiles to scan...
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../../store/game";
import { getTheme } from "../../game/pixi/theme";

const game = useGameStore();

const theme = computed(() => getTheme(game.playerColor));

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

// Helper for dynamic colors in template
function getOwnerColorStyle(owner: string | null) {
    if (!owner) return { color: theme.value.neutral.hex };
    if (owner === "player") return { color: theme.value.player.hex, textShadow: `0 0 5px ${theme.value.player.hex}80` };
    if (owner === "ai1") return { color: theme.value.ai1.hex };
    if (owner === "ai2") return { color: theme.value.ai2.hex };
    if (owner === "ai3") return { color: theme.value.ai3.hex };
    return { color: theme.value.neutral.hex };
}
</script>
