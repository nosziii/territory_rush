<template>
  <div class="flex gap-2">
    <button
      v-for="ability in abilities"
      :key="ability.id"
      class="px-3 py-2 rounded-md bg-gradient-to-br from-secondary to-primary text-black font-semibold shadow-lg text-xs uppercase tracking-wide disabled:opacity-50"
      :disabled="cooldown > 0 && game.targetingAbility !== ability.id"
      @click="selectAbility(ability.id)"
    >
      <span v-if="cooldown > 0 && game.targetingAbility !== ability.id">{{ Math.ceil(cooldown / 1000) }}s</span>
      <span v-else-if="game.targetingAbility === ability.id">Célozz!</span>
      <span v-else>{{ ability.label }}</span>
    </button>
    <button
      class="px-3 py-2 rounded-md bg-slate-800 text-white border border-slate-600 text-xs uppercase tracking-wide"
      :class="{ 'bg-primary text-black': game.rallyMode }"
      @click="toggleRally"
    >
      Rally mód
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../../store/game";

const game = useGameStore();

const abilities = [
  { id: "reinforce", label: "Erosites" },
  { id: "artillery", label: "Tuzcsapas" },
  { id: "heal", label: "Gyogyitas" },
];

const cooldown = computed(() => Math.max(0, game.abilityReadyAt - Date.now()));

function selectAbility(id: string) {
  if (cooldown.value > 0 && game.targetingAbility !== id) return;
  game.startTargeting(id);
}

function toggleRally() {
  game.toggleRallyMode();
}
</script>
