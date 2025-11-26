<template>
  <div class="min-h-screen bg-[#02040a] text-white font-sans selection:bg-cyan-500/30">
    <!-- Background Grid/Effects -->
    <div class="fixed inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
    <div class="fixed inset-0 bg-gradient-to-b from-transparent via-cyan-900/5 to-slate-900/80 pointer-events-none"></div>

    <div class="relative z-10 container mx-auto p-4 h-screen flex flex-col">
      <!-- Header -->
      <header class="flex items-center justify-between mb-4 px-2">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span class="text-xl font-black italic">TR</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            TERRITORY RUSH
          </h1>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-white/5">
            <div class="w-2 h-2 rounded-full" :class="game.ws?.readyState === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'"></div>
            <span class="text-xs font-mono text-slate-400">{{ game.ws?.readyState === 1 ? 'ONLINE' : 'OFFLINE' }}</span>
          </div>
          <button @click="leaveMatch" class="text-sm text-slate-400 hover:text-white transition-colors">
            Leave Match
          </button>
        </div>
      </header>

      <!-- Main Layout -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6 min-h-0">
        
        <!-- Left Sidebar (Resources & Minimap) -->
        <aside class="flex flex-col gap-6">
          <ResourceBar />
          <Minimap />
          <InfoPanel /> <!-- Added InfoPanel here -->
        </aside>

        <!-- Center (Game Canvas) -->
        <main class="flex flex-col min-h-0 relative">
          <GameCanvas />
        </main>

        <!-- Right Sidebar (Abilities & Chat/Log) -->
        <aside class="flex flex-col gap-6">
           <AbilityBar />
           <!-- Event Log -->
           <div class="glass flex-1 rounded-xl p-4 border border-white/10 flex flex-col overflow-hidden">
             <h3 class="font-bold text-slate-500 text-sm uppercase mb-2">Comms Feed</h3>
             <div class="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
               <div 
                 v-for="(log, i) in game.logs" 
                 :key="i"
                 class="text-xs font-mono border-l-2 pl-2 py-1"
                 :class="{
                   'border-emerald-500 text-emerald-200': log.category === 'build',
                   'border-red-500 text-red-200': log.category === 'combat',
                   'border-slate-500 text-slate-400': log.category === 'info'
                 }"
               >
                 <span class="opacity-50 mr-2">[{{ new Date(log.timestamp).toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'}) }}]</span>
                 <span>{{ log.message }}</span>
               </div>
               <div v-if="game.logs.length === 0" class="text-xs text-slate-600 italic text-center mt-4">
                 No activity detected...
               </div>
             </div>
           </div>
        </aside>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import { useGameStore } from "../store/game";
import GameCanvas from "../components/game/GameCanvas.vue";
import ResourceBar from "../components/hud/ResourceBar.vue";
import AbilityBar from "../components/hud/AbilityBar.vue";
import Minimap from "../components/hud/Minimap.vue";
import InfoPanel from "../components/hud/InfoPanel.vue"; 

const route = useRoute();
const router = useRouter();
const game = useGameStore();

function leaveMatch() {
  game.disconnect();
  router.push("/");
}

onMounted(() => {
  const matchId = route.params.id as string;
  if (matchId) {
    game.connect(matchId);
  }
});
</script>
