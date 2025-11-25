<template>
  <div class="glass rounded-xl overflow-hidden">
    <div
      ref="container"
      class="w-full h-[560px] bg-slate-950 relative"
      @click="handleClick"
    >
      <div v-if="game.phase === 'idle'" class="absolute inset-0 flex items-center justify-center text-slate-400">
        Csatlakozz egy match-hez a Lobby-ból.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useGameStore } from "../../store/game";
import { createPixiApp } from "../../game/pixi/createApp";
import { drawTiles } from "../../game/pixi/layers/TilesLayer";
import { drawUnits } from "../../game/pixi/layers/UnitsLayer";
import { drawDeco } from "../../game/pixi/layers/DecoLayer";
import { drawProjectiles } from "../../game/pixi/layers/ProjectilesLayer";
import { drawBuildings } from "../../game/pixi/layers/BuildingsLayer";

const container = ref<HTMLDivElement | null>(null);
const game = useGameStore();
let app: Awaited<ReturnType<typeof createPixiApp>> | null = null;

onMounted(async () => {
  if (!container.value) return;
  app = await createPixiApp(container.value);
  watch(
    () => game.tiles ?? [],
    (tiles) => {
      if (app) {
        drawTiles(app, tiles);
        drawDeco(app, tiles);
      }
    },
    { deep: true }
  );
  watch(
    () => game.units ?? [],
    (units) => {
      if (app) {
        drawUnits(app, units);
      }
    },
    { deep: true }
  );
  watch(
    () => game.buildings ?? [],
    (buildings) => {
      if (app) {
        drawBuildings(app, buildings);
      }
    },
    { deep: true }
  );
  watch(
    () => game.projectiles ?? [],
    (projectiles) => {
      if (app) {
        drawProjectiles(app, projectiles);
      }
    },
    { deep: true }
  );
});

onBeforeUnmount(() => {
  if (app) {
    app.destroy(true, { children: true, texture: true, baseTexture: true });
    app = null;
  }
});

function handleClick(event: MouseEvent) {
  if (!container.value) return;
  const rect = container.value.getBoundingClientRect();
  const size = 42; // tile size + gap from TilesLayer
  const x = Math.floor((event.clientX - rect.left) / size);
  const y = Math.floor((event.clientY - rect.top) / size);
  if (x < 0 || y < 0 || x > 9 || y > 9) return;
  if (game.rallyMode) {
    // Rally simply sets ability targeting for reinforce at chosen tile
    game.sendAbility(x, y, "reinforce");
    game.toggleRallyMode();
    return;
  }
  if (game.targetingAbility) {
    game.sendAbility(x, y, game.targetingAbility);
    return;
  }
}
</script>
