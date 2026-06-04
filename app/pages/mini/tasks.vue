<script setup lang="ts">
const router = useRouter()

const tasks = [
  { id: 'about', label: 'Jamoa haqida',         icon: 'noto:open-book',     done: true, link: '/mini/about' },
  { id: 'rules', label: 'Qoidalar',              icon: 'noto:memo',          done: true, link: '/mini/rules' },
  { id: 'intro', label: "O'zingiz haqingizda",  icon: 'noto:potted-plant',  done: true, link: '/mini/intro' },
  { id: 'first', label: 'Birinchi material',     icon: 'noto:sparkles',      done: true, link: null },
]

const total = tasks.length
const done = tasks.filter(t => t.done).length

const NuxtLinkComponent = resolveComponent('NuxtLink')

useSeoMeta({ title: 'Vazifalar' })
</script>

<template>
  <div style="background:#fffdf9; min-height:100vh">
    <div class="w-full pb-28">

      <!-- Header -->
      <div class="flex items-center gap-3 px-4 pt-5 pb-4">
        <button
          class="inline-flex items-center justify-center flex-none tg-press-sm"
          style="width:44px;height:44px;border-radius:999px;background:#f0ede6;color:#0f1115"
          @click="router.back()"
        >
          <UIcon name="i-lucide-arrow-left" class="size-4.5" />
        </button>
        <h1 class="text-[26px] font-black tracking-tight leading-tight" style="color:#0f1115">Vazifalar</h1>
      </div>

      <!-- Progress card -->
      <div class="px-4 mb-5">
        <div class="rounded-[24px] p-7" style="background:linear-gradient(135deg,#3480f1,#6c63ff)">
          <p class="text-[10px] font-black tracking-widest uppercase mb-2" style="color:rgba(255,255,255,0.6)">PROGRESS</p>
          <p class="font-black leading-none mb-1.5" style="font-size:52px; color:#fff">
            {{ done }}<span style="font-size:24px; color:rgba(255,255,255,0.6); font-weight:700">/{{ total }}</span>
          </p>
          <p class="text-[13px] font-semibold" style="color:rgba(255,255,255,0.75)">BAJARILDI</p>
          <div class="mt-5 rounded-full overflow-hidden" style="height:5px;background:rgba(255,255,255,0.2)">
            <div
              class="h-full rounded-full"
              style="background:#ffffff; transition:width 0.6s ease"
              :style="{ width: (done / total * 100) + '%' }"
            />
          </div>
        </div>
      </div>

      <!-- Task list -->
      <div class="px-4 space-y-2">
        <component
          :is="task.link ? NuxtLinkComponent : 'div'"
          v-for="task in tasks"
          :key="task.id"
          :to="task.link || undefined"
          class="flex items-center gap-4 p-4 rounded-2xl tg-press-sm"
          style="background:#f7f5ef; border:1px solid #e8e4da"
        >
          <UIcon :name="task.icon" class="size-9 flex-none" />
          <span class="flex-1 text-[15px] font-semibold leading-snug" style="color:#0f1115">{{ task.label }}</span>
          <div class="flex items-center gap-2 flex-none">
            <div
              v-if="task.done"
              class="size-5 rounded-full flex items-center justify-center"
              style="background:#10b981"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span v-if="task.link" style="color:#c4c8d2; font-size:18px">›</span>
          </div>
        </component>
      </div>

    </div>
  </div>
</template>
