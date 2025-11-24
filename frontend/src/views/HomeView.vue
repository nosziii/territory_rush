<template>
  <section class="p-8 grid lg:grid-cols-2 gap-8 items-center">
    <div class="space-y-4">
      <p class="text-sm uppercase tracking-[0.25em] text-slate-400">Realtime island rush</p>
      <h1 class="text-4xl lg:text-5xl font-display leading-tight">
        Foglalj területet, spawnold a sereget, <span class="text-primary">döntsd le</span> az ellenséget.
      </h1>
      <p class="text-slate-300">
        2-5 perces, villámgyors auto-battle stratégia. Csempés szigetek, fejleszthető épületek,
        AI vagy PvP — minden tick számít.
      </p>
      <div class="flex gap-3">
        <RouterLink
          to="/lobby"
          class="px-5 py-3 bg-primary text-black font-semibold rounded-lg shadow-lg hover:scale-[1.02] transition"
        >
          Quick Play
        </RouterLink>
        <RouterLink
          to="/profile"
          class="px-5 py-3 border border-slate-600 rounded-lg hover:border-primary transition"
        >
          Profil
        </RouterLink>
      </div>
    </div>
    <div class="glass rounded-xl p-6 border border-slate-700">
      <div class="flex items-center justify-between text-xs uppercase text-slate-400 mb-3">
        <span>Tick 1234</span>
        <span>Foglalás</span>
        <span>Resource flow</span>
      </div>
      <div class="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20"></div>
        <div class="absolute inset-3 border border-white/10 rounded-lg grid grid-cols-8 grid-rows-5 gap-1">
          <div v-for="i in 40" :key="i" class="rounded-sm" :class="tileClass(i)"></div>
        </div>
      </div>
      <p class="mt-3 text-sm text-slate-400">
        Visual only mock — a Pixi vászon a GameView-ban renderel. Itt a grid hangulatát mutatjuk meg.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
function tileClass(i: number) {
  if (i % 9 === 0) return "bg-primary/70";
  if (i % 7 === 0) return "bg-secondary/60";
  if (i % 5 === 0) return "bg-emerald-500/60";
  return "bg-slate-800";
}
</script>
