<script setup lang="ts">
const { data: guides } = useAsyncData('catalog-guides', () => $fetch<any[]>('/api/guides'))
const { data: courses } = useAsyncData('catalog-courses', () => $fetch<any[]>('/api/courses'))

const guidesCount = computed(() => guides.value?.length ?? 0)
const coursesCount = computed(() => courses.value?.length ?? 0)

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
    style="background:#fffdf9;min-height:100vh;font-family:inherit"
  >
    <!-- Header -->
    <div style="padding:16px 20px 8px">
      <h1 style="font-size:28px;font-weight:800;letter-spacing:-0.03em;line-height:1.1;color:#0f1115;margin:0">Materiallar</h1>
      <p style="font-size:14px;margin:4px 0 0;color:#6b7280;font-weight:400">O'rganish formatini tanlang.</p>
    </div>

    <!-- 2×3 grid -->
    <div class="grid grid-cols-2 gap-3" style="padding:14px 20px">

      <!-- Qo'llanmalar — lavender -->
      <NuxtLink
        to="/mini/guides"
        class="tg-press flex flex-col justify-between"
        style="background:#f7f5ef;border-radius:22px;padding:18px;height:130px"
      >
        <div style="width:44px;height:44px;border-radius:50%;background:rgba(245,158,11,0.12);display:grid;place-items:center;flex-shrink:0">
          <UIcon name="solar:notes-minimalistic-bold" class="size-5.5" style="color:#f59e0b" />
        </div>
        <div>
          <h3 style="font-family:inherit;font-weight:800;font-size:13px;font-weight:600;letter-spacing:-0.01em;margin:0;color:#0f1115">Qo'llanmalar</h3>
          <div style="font-size:9px;color:#6b7280;font-weight:400;margin-top:2px;min-height:13px">{{ guidesCount ? guidesCount + ' ta material' : '' }}</div>
        </div>
      </NuxtLink>

      <!-- Kurslar — pink -->
      <NuxtLink
        to="/mini/courses"
        class="tg-press flex flex-col justify-between"
        style="background:#f7f5ef;border-radius:22px;padding:18px;height:130px"
      >
        <div style="width:44px;height:44px;border-radius:50%;background:rgba(31,138,91,0.15);display:grid;place-items:center;flex-shrink:0">
          <UIcon name="solar:square-academic-cap-bold" class="size-5.5" style="color:#1f8a5b" />
        </div>
        <div>
          <h3 style="font-family:inherit;font-weight:800;font-size:13px;font-weight:600;letter-spacing:-0.01em;margin:0;color:#0f1115">Kurslar</h3>
          <div style="font-size:9px;color:rgba(15,17,21,.65);font-weight:400;margin-top:2px;min-height:13px">{{ coursesCount ? coursesCount + ' ta kurs' : '' }}</div>
        </div>
      </NuxtLink>

      <!-- Tez kunda tiles -->
      <div
        v-for="soon in [
          { name: 'Skill\'lar', icon: 'solar:settings-minimalistic-bold', color: '#7c3aed', iconBg: 'rgba(124,58,237,0.12)' },
          { name: 'Use case',   icon: 'solar:widget-bold',                color: '#d97706', iconBg: 'rgba(217,119,6,0.12)'  },
          { name: 'Efirlar',    icon: 'solar:microphone-bold',            color: '#e53e3e', iconBg: 'rgba(229,62,62,0.12)'  },
          { name: 'Workshop',   icon: 'solar:people-nearby-bold',         color: '#0d9488', iconBg: 'rgba(13,148,136,0.12)' },
        ]"
        :key="soon.name"
        class="relative flex flex-col justify-between"
        style="background:#f7f5ef;border-radius:22px;padding:18px;height:130px;overflow:hidden;opacity:0.45"
      >
        <span style="position:absolute;top:14px;right:14px;background:#fffdf9;color:#9aa0a8;font-size:9.5px;font-weight:700;padding:4px 8px;border-radius:999px;letter-spacing:.06em">TEZ KUNDA</span>
        <div :style="`width:44px;height:44px;border-radius:50%;background:${soon.iconBg};display:grid;place-items:center`">
          <UIcon :name="soon.icon" class="size-5.5" :style="`color:${soon.color}`" />
        </div>
        <div>
          <h3 style="font-family:inherit;font-weight:800;font-size:13px;font-weight:600;letter-spacing:-0.01em;margin:0;color:#1a1a1a">{{ soon.name }}</h3>
        </div>
      </div>
    </div>

    <!-- Maskot / Request material card -->
    <div style="padding:0 20px 20px">
      <div
        class="tg-press flex items-center gap-3.5 cursor-pointer"
        style="background:#f7f5ef;border-radius:22px;padding:16px"
        @click="openModal"
      >
        <Icon name="noto:robot" class="size-12 shrink-0" />
        <div class="flex-1 min-w-0">
          <h3 style="font-family:inherit;font-weight:800;font-size:14px;letter-spacing:-0.015em;margin:0;color:#0f1115">
            AI Room maskoti material so'rashi
          </h3>
          <div style="font-size:11px;color:#6b7280;font-weight:500;margin-top:3px">Mavzu taklif qiling — biz qo'shamiz</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4c8d2" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-200 flex items-end justify-center"
          style="background:rgba(0,0,0,0.4);backdrop-filter:blur(6px)"
          @click.self="closeModal"
        >
          <div class="w-full" style="background:#fff;border-radius:24px 24px 0 0;padding:20px 20px 36px;max-width:390px;border-top:1px solid #e5e7eb">
            <div style="width:36px;height:4px;border-radius:999px;background:#e5e7eb;margin:0 auto 20px"></div>

            <div class="flex items-start justify-between mb-2">
              <h2 style="font-size:18px;font-weight:800;letter-spacing:-0.02em;color:#0f1115;margin:0">Material so'rash</h2>
              <button
                class="flex items-center justify-center shrink-0 ml-3"
                style="width:28px;height:28px;border-radius:50%;background:#fffdf9;border:none"
                @click="closeModal"
              >
                <UIcon name="i-lucide-x" class="size-3.5" style="color:#6b7280" />
              </button>
            </div>
            <p style="font-size:13px;line-height:1.6;color:#6b7280;margin:0 0 18px">Qaysi mavzuni ko'rishni istayotganingizni ayting. Kontent rejalashtirish jarayonida hisobga olamiz.</p>

            <div class="mb-3">
              <label class="block mb-2" style="font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#9aa0a8">MATERIAL NIMA HAQIDA?</label>
              <input
                v-model="topic"
                type="text"
                placeholder="Masalan: marketolog uchun Cursor tahlili"
                class="w-full outline-none"
                style="background:#fffdf9;color:#0f1115;border:1.5px solid transparent;border-radius:12px;padding:11px 14px;font-size:13px;font-family:inherit"
              />
            </div>

            <div class="mb-5">
              <label class="block mb-2" style="font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#9aa0a8">
                BATAFSIL <span style="font-weight:500;text-transform:none;letter-spacing:normal;font-size:11px;color:#c4c8d2">(ixtiyoriy)</span>
              </label>
              <div class="relative">
                <textarea
                  v-model="details"
                  maxlength="500"
                  rows="3"
                  placeholder="Qanday vazifa bor? Nima qilishni o'rganmoqchisiz?"
                  class="w-full outline-none resize-none"
                  style="background:#fffdf9;color:#0f1115;border:1.5px solid transparent;border-radius:12px;padding:11px 14px;font-size:13px;font-family:inherit"
                />
                <span class="absolute bottom-2 right-2.5" style="font-size:10px;color:#c4c8d2">{{ details.length }}/500</span>
              </div>
            </div>

            <button
              class="w-full tg-press transition-opacity"
              style="height:52px;border-radius:14px;background:#0f1115;color:#ffffff;font-size:14px;font-weight:700;border:none;font-family:inherit"
              :style="!topic.trim() ? 'opacity:0.35' : 'opacity:1'"
              :disabled="!topic.trim()"
              @click="submit"
            >Yuborish</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active { transition: transform 280ms cubic-bezier(0.32,0.72,0,1), opacity 200ms ease; }
.modal-leave-active { transition: transform 200ms ease, opacity 150ms ease; }
.modal-enter-from { transform: translateY(100%); opacity: 0; }
.modal-leave-to { transform: translateY(30%); opacity: 0; }
</style>
