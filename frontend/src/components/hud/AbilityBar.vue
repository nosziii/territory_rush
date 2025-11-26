<template>
  <div class="flex flex-col gap-2">
    <!-- Abilities -->
    <div class="flex gap-3">
        <button
        v-for="ability in abilities"
        :key="ability.id"
        class="relative group px-4 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 overflow-hidden border border-white/10"
        :class="[
            game.targetingAbility === ability.id
            ? 'bg-amber-500 text-black scale-105 ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-900'
            : cooldown > 0 && game.targetingAbility !== ability.id
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-slate-800/80 hover:bg-slate-700 text-white hover:scale-105 hover:shadow-cyan-500/20 hover:border-cyan-500/50'
        ]"
        :disabled="cooldown > 0 && game.targetingAbility !== ability.id"
        @click="selectAbility(ability.id)"
        >
        <div v-if="!(cooldown > 0 && game.targetingAbility !== ability.id)" class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div class="flex flex-col items-center gap-1">
            <span class="text-xs uppercase tracking-widest opacity-70">{{ ability.label }}</span>
            <span v-if="cooldown > 0 && game.targetingAbility !== ability.id" class="text-sm font-mono">{{ Math.ceil(cooldown / 1000) }}s</span>
            <span v-else-if="game.targetingAbility === ability.id" class="text-sm animate-pulse">SELECT TARGET</span>
            <span v-else class="text-lg leading-none">⚡</span>
        </div>
        </button>
    </div>

    <!-- Build Menu -->
    <div class="flex gap-3 mt-2">
        <button
        v-for="building in buildings"
        :key="building.id"
        class="relative group px-3 py-2 rounded-lg font-bold shadow-md transition-all duration-200 border border-white/10"
        :class="[
            game.targetingAbility === `build_${building.id}`
            ? 'bg-emerald-500 text-black scale-105'
            : 'bg-slate-900/80 hover:bg-slate-800 text-emerald-400'
        ]"
        @click="selectBuild(building.id)"
        >
        <div class="flex flex-col items-center">
            <span class="text-[10px] uppercase tracking-wider">{{ building.label }}</span>
            <span class="text-xs text-white">{{ building.cost }}G</span>
        </div>
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useGameStore } from "../../store/game";

const game = useGameStore();
const now = ref(Date.now());
let timer: number;

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = Date.now();
  }, 100);
});

onUnmounted(() => {
  clearInterval(timer);
});

const abilities = [
  { id: "reinforce", label: "Erosites" },
  { id: "artillery", label: "Tuzcsapas" },
  { id: "heal", label: "Gyogyitas" },
];

const buildings = [
    { id: "barracks", label: "Barracks", cost: 150 },
    { id: "archery", label: "Archery", cost: 200 },
    { id: "turret", label: "Turret", cost: 250 },
    { id: "mine", label: "Mine", cost: 100 },
];

const cooldown = computed(() => Math.max(0, game.abilityReadyAt - now.value));

function selectAbility(id: string) {
  if (cooldown.value > 0 && game.targetingAbility !== id) return;
  game.startTargeting(id);
}

function selectBuild(id: string) {
    game.startTargeting(`build_${id}`);
}

function toggleRally() {
  game.toggleRallyMode();
}
</script>

