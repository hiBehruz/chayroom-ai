<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#fffdf9]">
    <h1 class="text-[24px] font-extrabold text-[#14161f]">
      Admin panel
    </h1>
    <div class="flex gap-3">
      <NuxtLink
        to="/admin/guides/new"
        class="rounded-xl bg-[#14161f] px-5 py-3 text-[15px] font-semibold text-white"
      >
        Qo'llanma qo'shish
      </NuxtLink>
      <NuxtLink
        to="/admin/courses/new"
        class="rounded-xl bg-[#14161f] px-5 py-3 text-[15px] font-semibold text-white"
      >
        Kurs qo'shish
      </NuxtLink>
    </div>
  </div>
</template>
