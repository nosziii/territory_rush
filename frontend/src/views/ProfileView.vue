<template>
  <section class="p-8 max-w-3xl mx-auto space-y-4">
    <div class="glass rounded-xl p-6">
      <h2 class="text-2xl font-display mb-3">Profil</h2>
      <div v-if="profile" class="space-y-2">
        <p class="text-lg font-semibold">{{ profile.username }}</p>
        <p class="text-sm text-slate-300">Level {{ profile.level }} · XP {{ profile.xp }}</p>
        <p class="text-sm text-slate-300">Soft: {{ profile.softCurrency }} · Hard: {{ profile.hardCurrency }}</p>
      </div>
      <div v-else class="text-slate-400 text-sm">Nincs bejelentkezett user.</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useUserStore } from "../store/user";

const user = useUserStore();
const { profile } = storeToRefs(user);
</script>
