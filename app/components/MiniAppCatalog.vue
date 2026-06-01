<script setup lang="ts">
const { data: guides } = await useAsyncData('catalog-guides', () => $fetch<any[]>('/api/guides'))
const { data: courses } = await useAsyncData('catalog-courses', () => $fetch<any[]>('/api/courses'))

const guidesCount = computed(() => guides.value?.length ?? 0)
const coursesCount = computed(() => courses.value?.length ?? 0)

const categories = computed(() => [
  { id: 'guides',    name: "Qo'llanmalar", icon: 'i-lucide-book-open',      count: guidesCount.value ? `${guidesCount.value} ta material` : null, soon: false, to: '/guides',  bg: '#d9defc' },
  { id: 'courses',   name: 'Kurslar',      icon: 'i-lucide-graduation-cap',  count: coursesCount.value ? `${coursesCount.value} ta kurs` : null,    soon: false, to: '/courses', bg: '#ec99c8' },
  { id: 'skills',    name: "Ko'nikmalar",  icon: 'i-lucide-sparkles',        count: null, soon: true, to: null, bg: null },
  { id: 'usecases',  name: 'Yuzkeyslar',  icon: 'i-lucide-briefcase',       count: null, soon: true, to: null, bg: null },
  { id: 'streams',   name: 'Efirlar',      icon: 'i-lucide-video',           count: null, soon: true, to: null, bg: null },
  { id: 'workshops', name: 'Vorkshoplar', icon: 'i-lucide-users',            count: null, soon: true, to: null, bg: null },
])

const showModal = ref(false)
const topic = ref('')
const details = ref('')

function openModal() { showModal.value = true }
function closeModal() { showModal.value = false; topic.value = ''; details.value = '' }
function submit() { closeModal() }
</script>

<template>
  <div
    class="w-full pb-28"
    style="background:#f4f4f6;min-height:100vh;font-family:'Plus Jakarta Sans',system-ui,sans-serif"
  >
    <!-- Header -->
    <div style="padding:28px 18px 20px">
      <h1 style="font-size:26px;font-weight:800;letter-spacing:-0.025em;line-height:1.1;color:#0f1115;margin:0">Katalog</h1>
      <p style="font-size:13px;margin:4px 0 0;color:#6b7280;font-weight:500">Platforma materiallari formatlari.</p>
    </div>

    <!-- Category grid -->
    <div class="grid grid-cols-2 gap-3" style="padding:0 18px">
      <template v-for="cat in categories" :key="cat.id">

        <!-- Available tile -->
        <NuxtLink
          v-if="cat.to"
          :to="cat.to"
          class="tg-press relative flex flex-col justify-between"
          :style="`background:${cat.bg};border-radius:22px;padding:16px;min-height:148px`"
        >
          <div class="flex items-center justify-between">
            <div style="width:40px;height:40px;border-radius:50%;background:#0f1115;display:flex;align-items:center;justify-content:center">
              <UIcon :name="cat.icon" class="size-4.5" style="color:#ffffff" />
            </div>
          </div>
          <div>
            <p style="font-size:18px;font-weight:800;letter-spacing:-0.02em;color:#0f1115;margin:0 0 2px;line-height:1.1">{{ cat.name }}</p>
            <p v-if="cat.count" style="font-size:11px;font-weight:500;color:rgba(15,17,21,0.55);margin:0">{{ cat.count }}</p>
          </div>
        </NuxtLink>

        <!-- Soon tile -->
        <div
          v-else
          class="relative flex flex-col justify-between"
          style="background:#ffffff;border-radius:22px;padding:16px;min-height:148px;opacity:0.6"
        >
          <span
            style="position:absolute;top:12px;right:12px;font-size:9px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#9aa0a8;background:rgba(0,0,0,0.06);padding:3px 8px;border-radius:999px"
          >TEZ KUNDA</span>
          <div style="width:40px;height:40px;border-radius:50%;background:#ececef;display:flex;align-items:center;justify-content:center">
            <UIcon :name="cat.icon" class="size-4.5" style="color:#9aa0a8" />
          </div>
          <div>
            <p style="font-size:18px;font-weight:800;letter-spacing:-0.02em;color:#0f1115;margin:0;line-height:1.1">{{ cat.name }}</p>
          </div>
        </div>

      </template>
    </div>

    <!-- Request material banner -->
    <div
      class="tg-press flex items-center gap-3 cursor-pointer"
      style="margin:14px 18px 0;background:#ffffff;border-radius:22px;padding:14px 16px"
      @click="openModal"
    >
      <Icon name="noto:robot" class="size-10 shrink-0" />
      <div class="flex-1 min-w-0">
        <p style="font-size:14px;font-weight:700;color:#0f1115;margin:0;letter-spacing:-0.01em">AI Room maskotig'a material so'rang</p>
        <p style="font-size:11px;font-weight:500;color:#6b7280;margin:3px 0 0">Mavzu taklif qiling — hisobga olamiz</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa0a8" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-200 flex items-center justify-center px-5"
          style="background:rgba(0,0,0,0.35);backdrop-filter:blur(4px)"
          @click.self="closeModal"
        >
          <div class="w-full" style="background:#ffffff;border-radius:22px;padding:18px;max-width:360px">
            <!-- Header -->
            <div class="flex items-start justify-between mb-1.5">
              <h2 style="font-size:17px;font-weight:800;letter-spacing:-0.02em;color:#0f1115;margin:0">Material so'rash</h2>
              <button
                class="flex items-center justify-center shrink-0 ml-3 mt-0.5"
                style="width:24px;height:24px;border-radius:50%;background:#f0f0f2;border:none"
                @click="closeModal"
              >
                <UIcon name="i-lucide-x" class="size-3" style="color:#6b7280" />
              </button>
            </div>
            <p style="font-size:12px;line-height:1.6;color:#6b7280;margin:0 0 16px">Qaysi mavzuni ko'rishni istayotganingizni ayting. Kontent rejalashtirish jarayonida hisobga olamiz.</p>

            <!-- Topic field -->
            <div class="mb-3">
              <label class="block mb-1.5" style="font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#0f1115">MATERIAL NIMA HAQIDA?</label>
              <input
                v-model="topic"
                type="text"
                placeholder="Masalan: marketolog uchun Cursor tahlili"
                class="w-full outline-none topic-input"
                style="background:#f5f5f7;color:#0f1115;border:1.5px solid #e8e8ec;border-radius:12px;padding:10px 12px;font-size:13px;font-family:'Plus Jakarta Sans',system-ui,sans-serif"
              />
            </div>

            <!-- Details field -->
            <div class="mb-5">
              <label class="block mb-1.5" style="font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#0f1115">
                BATAFSIL <span style="font-weight:500;text-transform:none;letter-spacing:normal;font-size:11px;color:#9aa0a8">(ixtiyoriy)</span>
              </label>
              <div class="relative">
                <textarea
                  v-model="details"
                  maxlength="500"
                  rows="3"
                  placeholder="Qanday vazifa bor? Nima qilishni o'rganmoqchisiz?"
                  class="w-full outline-none resize-none"
                  style="background:#f5f5f7;color:#0f1115;border:1.5px solid transparent;border-radius:12px;padding:10px 12px;font-size:13px;font-family:'Plus Jakarta Sans',system-ui,sans-serif"
                />
                <span class="absolute bottom-2 right-2.5" style="font-size:10px;color:#9aa0a8">{{ details.length }}/500</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-between gap-3">
              <button
                style="font-size:13px;font-weight:600;color:#6b7280;padding:8px 12px;background:none;border:none"
                @click="closeModal"
              >Bekor qilish</button>
              <button
                class="transition-opacity"
                style="background:#0f1115;color:#ffffff;border-radius:12px;padding:10px 20px;font-size:13px;font-weight:700;border:none;font-family:'Plus Jakarta Sans',system-ui,sans-serif"
                :style="!topic.trim() ? 'opacity:0.35' : 'opacity:1'"
                :disabled="!topic.trim()"
                @click="submit"
              >Yuborish</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.topic-input:focus { border-color: #0f1115 !important; background: #ffffff !important; }

.modal-enter-active { transition: opacity 220ms ease; }
.modal-leave-active { transition: opacity 180ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
