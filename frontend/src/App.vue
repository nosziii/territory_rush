<template>
  <div class="min-h-screen flex flex-col">
    <header class="flex items-center justify-between px-6 py-4 glass">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary"></div>
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Territory Rush</p>
          <p class="font-display text-lg">Sziget ostrom — villám pörgés</p>
        </div>
      </div>
      <nav class="flex items-center gap-4 text-sm">
        <RouterLink class="hover:text-primary transition" to="/">Home</RouterLink>
        <RouterLink class="hover:text-primary transition" to="/lobby">Lobby</RouterLink>
        <RouterLink class="hover:text-primary transition" to="/game">Game</RouterLink>
        <RouterLink class="hover:text-primary transition" to="/profile">Profil</RouterLink>
      </nav>
    </header>
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts"></script>
