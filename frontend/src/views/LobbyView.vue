<template>
  <section class="p-8 max-w-4xl mx-auto space-y-6">
    <div class="glass rounded-xl p-6">
      <h2 class="text-2xl font-display mb-2">Lobby</h2>
      <p class="text-slate-300">Indíts gyors meccset AI ellen, kapd meg a WebSocket linket és lépj be a harctérre.</p>
      <div class="mt-4 flex gap-3">
        <button
          class="px-4 py-2 bg-primary text-black rounded-md font-semibold hover:scale-[1.01] transition"
          @click="startQuickPlay"
        >
          Quick Play (AI)
        </button>
        <span v-if="matchId" class="text-sm text-slate-400">matchId: {{ matchId }}</span>
      </div>
    </div>
    <div class="glass rounded-xl p-6">
      <h3 class="text-lg font-semibold mb-2">Csatlakozás</h3>
      <div class="flex flex-col gap-2">
        <label class="text-sm text-slate-300">WS URL</label>
        <input v-model="wsUrl" class="bg-slate-900 border border-slate-700 rounded px-3 py-2" />
        <label class="text-sm text-slate-300">Match ID</label>
        <input v-model="matchIdInput" class="bg-slate-900 border border-slate-700 rounded px-3 py-2" />
        <button
          class="mt-2 px-4 py-2 bg-secondary text-black rounded-md font-semibold hover:scale-[1.01] transition"
          @click="connect"
        >
          Join match
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import { useGameStore } from "../store/game";

const game = useGameStore();
const wsUrl = ref("ws://localhost:4000/ws");
const matchId = ref("");
const matchIdInput = ref("");

async function startQuickPlay() {
  const { data } = await axios.post("/lobby/quick-play");
  matchId.value = data.matchId;
  matchIdInput.value = data.matchId;
  wsUrl.value =
    import.meta.env.VITE_WS_URL ||
    `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}${data.wsUrl ?? "/ws"}`;
  connect();
}

function connect() {
  if (!matchIdInput.value) return;
  game.connect(matchIdInput.value, wsUrl.value, "player");
}
</script>
