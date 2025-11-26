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

    <div class="glass rounded-xl p-6" v-if="activeMatches.length > 0">
      <h3 class="text-lg font-semibold mb-4">Active Matches</h3>
      <div class="space-y-3">
        <div v-for="match in activeMatches" :key="match.id" class="flex items-center justify-between bg-slate-900/50 p-3 rounded border border-slate-700">
          <div>
            <div class="font-mono text-sm text-primary">{{ match.id.substring(0, 8) }}...</div>
            <div class="text-xs text-slate-400">Players: {{ match.players }} | Tick: {{ match.tick }}</div>
          </div>
          <div class="flex gap-2">
            <button 
              @click="connectTo(match.id)"
              class="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-500"
            >
              Join
            </button>
            <button 
              @click="stopMatch(match.id)"
              class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-500"
            >
              Stop
            </button>
          </div>
        </div>
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
import { ref, onMounted, onUnmounted } from "vue";
import { useGameStore } from "../store/game";
import { useRouter } from "vue-router";

const game = useGameStore();
const router = useRouter();

const wsUrl = ref("ws://localhost:4000/ws");
const matchId = ref("");
const matchIdInput = ref("");
const activeMatches = ref<{ id: string; players: number; tick: number }[]>([]);
let pollInterval: any = null;

onMounted(() => {
  fetchMatches();
  pollInterval = setInterval(fetchMatches, 2000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});

async function fetchMatches() {
  try {
    const { data } = await axios.get("/lobby/matches");
    activeMatches.value = data;
  } catch (e) {
    console.error("Failed to fetch matches", e);
  }
}

async function startQuickPlay() {
  const { data } = await axios.post("/lobby/quick-play");
  matchId.value = data.matchId;
  matchIdInput.value = data.matchId;
  wsUrl.value =
    import.meta.env.VITE_WS_URL ||
    `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}${data.wsUrl ?? "/ws"}`;
  connect();
  router.push("/game");
}

function connectTo(id: string) {
  matchIdInput.value = id;
  connect();
  router.push("/game");
}

async function stopMatch(id: string) {
  if (!confirm("Biztosan leállítod ezt a meccset?")) return;
  try {
    await axios.post("/lobby/stop-match", { matchId: id });
    fetchMatches();
  } catch (e) {
    alert("Hiba a meccs leállításakor");
  }
}

function connect() {
  if (!matchIdInput.value) return;
  game.connect(matchIdInput.value, wsUrl.value, "player");
}
</script>
