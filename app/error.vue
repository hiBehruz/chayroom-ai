<script setup lang="ts">
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

useError()

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
    <ClientOnly>
      <div class="w-72 h-72">
        <DotLottieVue
          src="/animations/Error 404.lottie"
          :autoplay="true"
          :loop="true"
          style="width:100%;height:100%;display:block"
        />
      </div>
    </ClientOnly>

    <h1 class="text-[32px] font-extrabold tracking-tight text-[#1a1a1a] mt-2">
      Sahifa topilmadi
    </h1>
    <p class="mt-3 text-[15px] text-cx-muted max-w-sm leading-relaxed">
      Siz qidirayotgan sahifa mavjud emas yoki o'chirilgan bo'lishi mumkin.
    </p>

    <button
      class="btn-primary btn-primary-dark mt-8 px-7! py-3!"
      @click="goHome"
    >
      Bosh sahifaga qaytish
    </button>
  </div>
</template>
