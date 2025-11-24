<template>
  <div class="flex gap-2">
    <button
      v-for="ability in abilities"
      :key="ability.id"
      class="px-3 py-2 rounded-md bg-gradient-to-br from-secondary to-primary text-black font-semibold shadow-lg text-xs uppercase tracking-wide"
    >
      {{ ability.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
const abilities = [
  { id: "firestorm", label: "Tűzvihar" },
  { id: "rally", label: "Rally" },
  { id: "boost", label: "Boost" },
];
</script>
