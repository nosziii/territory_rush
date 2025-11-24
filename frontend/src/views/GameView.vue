<template>
  <div class="grid lg:grid-cols-[1fr_320px] gap-6 p-6">
    <div class="space-y-4">
      <GameCanvas />
      <div class="glass rounded-lg p-3 flex items-center justify-between">
        <ResourceBar />
        <AbilityBar />
      </div>
    </div>
    <div class="space-y-4">
      <Minimap />
      <div class="glass rounded-lg p-4">
        <h3 class="font-semibold mb-2">Match info</h3>
        <p class="text-sm text-slate-300">Tick: {{ game.tick }}</p>
        <p class="text-sm text-slate-300 capitalize">Fázis: {{ game.phase }}</p>
        <p v-if="game.lastError" class="text-sm text-red-400 mt-2">{{ game.lastError }}</p>
        <p class="text-sm text-slate-400 mt-2">
          Tipp: kattints a rácson egy tile-ra, hogy oda irányíts egy erősítést.
        </p>
        <div class="flex gap-2 mt-3">
          <button
            class="px-3 py-2 bg-primary text-black rounded hover:scale-[1.01] transition"
            @click="sendCenterWave"
          >
            Erősítés középre
          </button>
        </div>
        <button
          v-if="game.phase !== 'idle'"
          class="mt-3 px-3 py-2 border border-slate-700 rounded hover:border-primary transition"
          @click="game.disconnect"
        >
          Disconnect
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GameCanvas from "../components/game/GameCanvas.vue";
import ResourceBar from "../components/hud/ResourceBar.vue";
import AbilityBar from "../components/hud/AbilityBar.vue";
import Minimap from "../components/hud/Minimap.vue";
import { useGameStore } from "../store/game";

const game = useGameStore();

function sendCenterWave() {
  game.sendAbility(5, 5);
}
</script>
