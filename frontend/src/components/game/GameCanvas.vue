<template>
  <div class="glass rounded-xl overflow-hidden h-full flex flex-col">
    <div
      ref="container"
      class="flex-1 bg-slate-950 relative w-full h-full"
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
import { Container } from "pixi.js";

const container = ref<HTMLDivElement | null>(null);
const game = useGameStore();
let app: any = null;
let world: Container | null = null;

// Camera State
const camera = {
  x: 0,
  y: 0,
  zoom: 1,
  isDragging: false,
  lastX: 0,
  lastY: 0,
};

const TILE_SIZE = 44;

onMounted(async () => {
  if (!container.value) return;
  const pixi = await createPixiApp(container.value);
  app = pixi.app;
  world = pixi.world;

  // Center camera initially and fit map
  const mapWidth = 32 * TILE_SIZE;
  const mapHeight = 32 * TILE_SIZE;
  const scaleX = app.screen.width / mapWidth;
  const scaleY = app.screen.height / mapHeight;
  const fitScale = Math.min(scaleX, scaleY) * 0.8; // 80% fit to leave margins
  
  camera.zoom = Math.max(0.4, Math.min(1.5, fitScale)); 
  camera.x = (app.screen.width - mapWidth * camera.zoom) / 2;
  camera.y = (app.screen.height - mapHeight * camera.zoom) / 2;
  updateCamera();

  // Input Listeners for Camera
  const el = container.value;
  el.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  el.addEventListener("wheel", onWheel);

  watch(
    () => [game.tiles, game.hoveredTile, game.targetingAbility],
    () => {
      if (app && world) {
        drawTiles(world, game.tiles ?? [], game.hoveredTile, game.targetingAbility); 
        drawDeco(world, game.tiles ?? []);
      }
    },
    { deep: true }
  );
  watch(
    () => game.units ?? [],
    (units) => {
      if (app && world) drawUnits(world, units);
    },
    { deep: true }
  );
  watch(
    () => game.buildings ?? [],
    (buildings) => {
      if (app && world) drawBuildings(world, buildings);
    },
    { deep: true }
  );
  watch(
    () => game.projectiles ?? [],
    (projectiles) => {
      if (app && world) drawProjectiles(world, projectiles);
    },
    { deep: true }
  );
});

onBeforeUnmount(() => {
  if (app) {
    app.destroy(true, { children: true, texture: true, baseTexture: true });
    app = null;
  }
  if (container.value) {
    container.value.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    container.value.removeEventListener("wheel", onWheel);
  }
});

function updateCamera() {
  if (!world) return;
  world.position.set(camera.x, camera.y);
  world.scale.set(camera.zoom);
}

function onMouseDown(e: MouseEvent) {
  if (e.button === 1 || (e.button === 0 && e.altKey)) {
    // Middle click or Alt+Left for Pan
    camera.isDragging = true;
    camera.lastX = e.clientX;
    camera.lastY = e.clientY;
    e.preventDefault();
  } else if (e.button === 0) {
    handleClick(e);
  }
}

function onMouseMove(e: MouseEvent) {
  if (camera.isDragging) {
    const dx = e.clientX - camera.lastX;
    const dy = e.clientY - camera.lastY;
    camera.x += dx;
    camera.y += dy;
    camera.lastX = e.clientX;
    camera.lastY = e.clientY;
    updateCamera();
  }
  
  // Calculate hovered tile using Pixi's toLocal for accuracy
  if (world && game.tiles) {
      // Convert screen coordinates (relative to canvas) to world coordinates
      // We need the global position (relative to the canvas element)
      const rect = container.value!.getBoundingClientRect();
      const globalX = e.clientX - rect.left;
      const globalY = e.clientY - rect.top;
      
      // Use Pixi's transform to get local world coordinates
      // world.toLocal({x: globalX, y: globalY}) would work if we had a Point, 
      // but we can do it manually with the world transform which is safer here
      // actually, applying the inverse of camera transform is what we did, 
      // but let's ensure we use the exact same logic as rendering.
      
      // Revert to manual calc but verify resolution
      const worldX = (globalX - camera.x) / camera.zoom;
      const worldY = (globalY - camera.y) / camera.zoom;
      
      const tile = getTileAt(worldX, worldY);
      game.setHoveredTile(tile ? { x: tile.x, y: tile.y } : null);
  }
}

function onMouseUp() {
  camera.isDragging = false;
}

function onWheel(e: WheelEvent) {
  e.preventDefault();
  const zoomSpeed = 0.001;
  const newZoom = Math.max(0.2, Math.min(4, camera.zoom - e.deltaY * zoomSpeed));
  
  // Zoom towards mouse pointer
  const rect = container.value!.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  const worldMouseX = (mouseX - camera.x) / camera.zoom;
  const worldMouseY = (mouseY - camera.y) / camera.zoom;
  
  camera.x = mouseX - worldMouseX * newZoom;
  camera.y = mouseY - worldMouseY * newZoom;
  camera.zoom = newZoom;
  
  updateCamera();
}

function handleClick(event: MouseEvent) {
  if (!container.value || !world || !game.tiles) return;
  const rect = container.value.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  
  // Transform to world coordinates
  const worldX = (mouseX - camera.x) / camera.zoom;
  const worldY = (mouseY - camera.y) / camera.zoom;
  
  const tile = getTileAt(worldX, worldY);
  if (!tile) return;
  
  const { x, y } = tile;

  if (game.targetingAbility) {
    if (game.targetingAbility.startsWith("build_")) {
        const type = game.targetingAbility.replace("build_", "");
        game.sendBuildRequest(x, y, type);
        game.targetingAbility = "";
    } else {
        game.sendAbility(x, y, game.targetingAbility);
        game.targetingAbility = "";
    }
    return;
  }
  
  if (game.rallyMode) {
    game.sendAbility(x, y, "reinforce");
    game.toggleRallyMode();
    return;
  }
}

function getTileAt(worldX: number, worldY: number) {
    const tiles = game.tiles || [];
    // Sort by rendering order (back-to-front)
    const sorted = [...tiles].sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        return (a.height || 1) - (b.height || 1);
    });

    // Iterate backwards (front-to-back) for hit testing
    for (let i = sorted.length - 1; i >= 0; i--) {
        const t = sorted[i];
        const height = t.height || 1;
        const isWater = t.type === "water";
        const elevation = isWater ? 0 : (height - 1) * 10;
        
        const tx = t.x * TILE_SIZE;
        const ty = t.y * TILE_SIZE - elevation;
        
        // Hit box: The top face of the tile
        if (worldX >= tx && worldX < tx + TILE_SIZE &&
            worldY >= ty && worldY < ty + TILE_SIZE) {
            return t;
        }
    }
    return null;
}
</script>
