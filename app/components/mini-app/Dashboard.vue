<script setup lang="ts">
const NuxtLinkComponent = resolveComponent('NuxtLink')
const authStore = useAuthStore()
authStore.restoreFromStorage()
const hasSubscription = computed(() => authStore.hasSubscription)
const displayName = computed(() => authStore.displayName || authStore.user?.first_name || '')

const checking = ref(false)
const checked = ref(false)
async function checkPayment() {
  checking.value = true
  checked.value = false
  authStore.restoreFromStorage()
  await new Promise(r => setTimeout(r, 1400))
  checking.value = false
  checked.value = true
}

const taskOverview = { progress: 4, total: 4 }

const tasks = [
  { id: 'about', label: 'Jamoamiz\nhaqida',      icon: 'solar:users-group-rounded-bold', color: '#3480f1', iconBg: 'rgba(52,128,241,0.15)',  done: true, link: '/mini/about', bg: '#f7f5ef' },
  { id: 'rules', label: 'Qoidalarimiz',           icon: 'solar:shield-bold',              color: '#22c55e', iconBg: 'rgba(34,197,94,0.15)',   done: true, link: '/mini/rules', bg: '#f7f5ef' },
  { id: 'intro', label: "Maqsadingni\nbegila",    icon: 'solar:user-speak-bold',          color: '#14b8a6', iconBg: 'rgba(20,184,166,0.12)',  done: true, link: '/mini/intro', bg: '#f7f5ef' },
  { id: 'first', label: 'Birinchi\nmaterial',     icon: 'solar:notes-minimalistic-bold',  color: '#f59e0b', iconBg: 'rgba(245,158,11,0.12)',  done: true, link: '/catalog',    bg: '#f7f5ef' },
]

const { data: guidesData } = useAsyncData('dash-guides', () => $fetch<any[]>('/api/guides', { query: { limit: 5 } }))
const { data: coursesData } = useAsyncData('dash-courses', () => $fetch<any[]>('/api/courses', { query: { limit: 3 } }))

const continueItem = computed(() => {
  const g = guidesData.value?.[0]
  if (!g) return null
  return { type: 'GAYD', title: g.title, desc: g.description ?? '', slug: g.slug }
})

const freshItems = computed(() => {
  const items: { type: string; title: string; slug: string; tagBg: string; tagFg: string; iconBg: string }[] = []
  const guides = guidesData.value ?? []
  const courses = coursesData.value ?? []
  for (const c of courses.slice(0, 2))
    items.push({ type: 'KURS', title: c.title, slug: c.slug, tagBg: '#e1f5e8', tagFg: '#1f8a5b', iconBg: '#e8f5ec' })
  for (const g of guides.slice(0, 3))
    items.push({ type: 'GAYD', title: g.title, slug: g.slug, tagBg: '#e9eafd', tagFg: '#4c6ef0', iconBg: '#e9eafd' })
  return items.slice(0, 5)
})
</script>

<template>
  <div
    class="w-full relative overflow-x-hidden"
    style="background:#fffdf9;min-height:100vh;font-family:inherit"
  >

    <!-- ── PAYWALL ──────────────────────────────── -->
    <template v-if="!hasSubscription">
      <div class="flex flex-col px-[18px] pt-10 pb-6" style="min-height:calc(100vh - 80px)">

        <!-- Brand -->
        <div class="flex items-center gap-2.5 mb-8">
          <div style="width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#3480f1,#6c63ff);display:flex;align-items:center;justify-content:center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="m20.092 14.326l.193-1.894c.103-1.011.17-1.678.117-2.099h.02c.871 0 1.578-.746 1.578-1.666S21.293 7 20.421 7s-1.579.746-1.579 1.667c0 .416.145.797.384 1.089c-.343.223-.792.695-1.468 1.405c-.52.547-.78.82-1.07.863a.84.84 0 0 1-.473-.07c-.268-.124-.447-.462-.804-1.139L13.527 7.25c-.22-.417-.405-.766-.572-1.047c.683-.368 1.15-1.117 1.15-1.98C14.105 2.994 13.163 2 12 2s-2.105.995-2.105 2.222c0 .864.467 1.613 1.15 1.98c-.167.282-.351.631-.572 1.048L8.59 10.816c-.358.676-.537 1.014-.805 1.139a.84.84 0 0 1-.473.07c-.29-.043-.55-.317-1.07-.864c-.676-.71-1.125-1.182-1.468-1.405c.24-.292.384-.673.384-1.09C5.158 7.747 4.45 7 3.578 7C2.708 7 2 7.746 2 8.667c0 .92.707 1.666 1.579 1.666h.019c-.054.42.014 1.088.117 2.099l.193 1.894c.107 1.051.196 2.051.306 2.952h15.572c.11-.9.199-1.901.306-2.952M10.855 22h2.29c2.985 0 4.478 0 5.474-.94c.434-.412.71-1.152.908-2.116H4.473c.198.964.473 1.704.908 2.115C6.377 22 7.87 22 10.855 22"/>
            </svg>
          </div>
          <span style="font-size:17px;font-weight:700;letter-spacing:-0.01em;color:#0f1115">Chayroom AI Club</span>
        </div>

        <!-- Headline -->
        <div class="mb-6">
          <h1 style="font-size:32px;font-weight:800;letter-spacing:-0.04em;line-height:1.05;color:#0f1115;margin:0 0 10px">
            Bilimga eshik<br/>ochiq emas
          </h1>
          <p style="font-size:14px;line-height:1.6;color:#6b7280;font-weight:500;margin:0">
            Barcha kurslarga kirish uchun obuna kerak. Bir marta to'lang — abadiy o'rganing.
          </p>
        </div>

        <!-- Plan card -->
        <div class="mb-3 relative overflow-hidden" style="background:#ffffff;border-radius:22px;padding:20px;border:1.5px solid #e5e7eb">
          <span style="position:absolute;top:16px;right:16px;background:#0f1115;color:#c6f24e;font-size:10px;font-weight:800;padding:4px 10px;border-radius:999px;letter-spacing:0.04em">
            ENG FOYDALI
          </span>
          <p style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9aa0a8;margin:0 0 6px">Yillik obuna</p>
          <p style="font-size:34px;font-weight:800;letter-spacing:-0.04em;line-height:1;color:#0f1115;margin:0 0 18px">
            199 000 <span style="font-size:16px;font-weight:600;color:#9aa0a8">so'm/oy</span>
          </p>
          <div class="flex flex-col gap-3">
            <div v-for="benefit in [
              { icon: 'solar:book-bold',              text: 'Barcha kurslar va qo\'llanmalar', color:'#4c6ef0' },
              { icon: 'solar:chat-round-bold',         text: 'Yopiq AI Room Club kanal',       color:'#3480f1' },
              { icon: 'ph:lightning-fill',             text: 'Yangi materiallar birinchi',     color:'#f59e0b' },
              { icon: 'ph:robot-fill',                 text: 'AI agentlar va amaliy loyihalar', color:'#1f8a5b' },
            ]" :key="benefit.text" class="flex items-center gap-3">
              <div :style="`width:30px;height:30px;border-radius:10px;background:${benefit.color}18;display:flex;align-items:center;justify-content:center;flex-shrink:0`">
                <UIcon :name="benefit.icon" class="size-4" :style="`color:${benefit.color}`" />
              </div>
              <span style="font-size:13px;font-weight:500;color:#374151">{{ benefit.text }}</span>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <a
          href="https://t.me/hellobehruz"
          target="_blank"
          class="tg-press flex items-center justify-center gap-2.5 mb-2.5 mt-2"
          style="height:56px;border-radius:16px;background:#0f1115;color:#fff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:-0.01em"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5 shrink-0" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-9.642-2.618q-1.458.607-5.831 2.513q-.711.282-.744.552c-.038.304.343.424.862.587l.218.07c.51.166 1.198.36 1.555.368q.486.01 1.084-.4q4.086-2.76 4.218-2.789c.063-.014.149-.032.207.02c.059.052.053.15.047.177c-.038.161-1.534 1.552-2.308 2.271q-.344.324-.683.653c-.474.457-.83.8.02 1.36c.861.568 1.73 1.134 2.57 1.733c.414.296.786.56 1.246.519c.267-.025.543-.276.683-1.026c.332-1.77.983-5.608 1.133-7.19a1.8 1.8 0 0 0-.017-.393a.42.42 0 0 0-.142-.27c-.12-.098-.305-.118-.387-.117c-.376.007-.953.207-3.73 1.362" />
          </svg>
          Obuna olish
        </a>

        <!-- Check payment -->
        <button
          class="tg-press-sm flex items-center justify-center w-full"
          style="height:52px;border-radius:16px;background:#ffffff;color:#6b7280;font-size:14px;font-weight:600;border:1.5px solid #e5e7eb"
          :disabled="checking"
          @click="checkPayment"
        >
          <span v-if="checking" class="flex items-center gap-2">
            <span class="size-3.5 rounded-full border-2 inline-block" style="border-color:#e5e7eb;border-top-color:#374151;animation:spin 0.8s linear infinite" />
            Tekshirilmoqda...
          </span>
          <span v-else-if="checked" style="color:#ef4444">To'lov topilmadi. Qayta urinib ko'ring.</span>
          <span v-else>To'ladim, tekshirish</span>
        </button>
      </div>
    </template>

    <!-- ── DASHBOARD (subscribed) ──────────────── -->
    <template v-else>

      <!-- Greeting -->
      <div style="padding:16px 20px 18px">
        <div style="font-weight:800;font-size:26px;letter-spacing:-0.03em;color:#0f1115;display:flex;align-items:center;gap:6px">
          Salom, {{ displayName }} 👋
        </div>
        <div style="font-size:13px;color:#6b7280;font-weight:500;margin-top:3px">Daraja oshir</div>
      </div>

      <!-- VAZIFALAR -->
      <div class="mb-5">
        <div class="flex items-center justify-between mb-2" style="padding:0 20px">
          <h2 style="font-size:22px;font-weight:800;letter-spacing:-0.025em;color:#0f1115;margin:0">Vazifalar</h2>
          <span style="font-size:12px;font-weight:500;color:#6b7280">{{ taskOverview.progress }}/{{ taskOverview.total }} bajarildi</span>
        </div>

        <div class="flex gap-3 overflow-x-auto" style="padding:12px 20px 22px;scroll-snap-type:x mandatory;scrollbar-width:none;-ms-overflow-style:none">
          <!-- Dark progress card -->
          <NuxtLink
            to="/mini/tasks"
            class="tg-press flex-none flex flex-col justify-between"
            style="background:#0f1115;width:138px;height:168px;border-radius:22px;padding:14px 14px 12px;scroll-snap-align:start"
          >
            <div>
              <p style="font-size:10px;font-weight:700;letter-spacing:.1em;color:rgba(255,255,255,.55);margin:0">PROGRESS</p>
              <p style="font-size:32px;font-weight:800;color:#fff;line-height:1;margin:8px 0 0;letter-spacing:-0.03em">
                {{ taskOverview.progress }}<span style="font-size:16px;color:rgba(255,255,255,.55);font-weight:700">/{{ taskOverview.total }}</span>
              </p>
              <p style="font-size:12px;font-weight:500;color:rgba(255,255,255,.7);margin:2px 0 0">Vazifalar</p>
            </div>
            <div class="flex items-center justify-between">
              <span style="font-size:13px;font-weight:700;color:#fff">Hammasi</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M9 6l6 6-6 6"/></svg>
            </div>
          </NuxtLink>

          <!-- Pastel task cards -->
          <component
            :is="task.link ? NuxtLinkComponent : 'div'"
            v-for="task in tasks"
            :key="task.id"
            :to="task.link || undefined"
            class="tg-press flex-none flex flex-col justify-between"
            :style="`background:${task.bg};width:168px;height:168px;border-radius:22px;padding:14px 16px 12px;scroll-snap-align:start`"
          >
            <div :style="`width:40px;height:40px;border-radius:12px;background:${task.iconBg};display:grid;place-items:center`">
              <UIcon :name="task.icon" class="size-5.5" :style="`color:${task.color}`" />
            </div>
            <div>
              <p style="font-size:16px;font-weight:800;letter-spacing:-0.015em;line-height:1.1;margin:0 0 12px;color:#0f1115;white-space:pre-line">{{ task.label }}</p>
              <div class="flex items-center justify-between">
                <div v-if="task.done" style="width:24px;height:24px;border-radius:50%;background:#0f1115;display:grid;place-items:center">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c6f24e" stroke-width="3" stroke-linecap="round"><path d="M5 13l4 4L19 7"/></svg>
                </div>
                <svg v-if="task.link" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f1115" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
              </div>
            </div>
          </component>
        </div>
      </div>

      <!-- DAVOM ETISH -->
      <div v-if="continueItem" class="mb-4" style="padding:0 20px">
        <h2 style="font-size:22px;font-weight:800;letter-spacing:-0.025em;color:#0f1115;margin:0 0 12px">Davom etish</h2>
        <NuxtLink
          :to="`/guides/${continueItem.slug}`"
          class="tg-press flex gap-3.5 items-center"
          style="background:#f7f5ef;border-radius:22px;padding:18px"
        >
          <div style="width:76px;height:76px;border-radius:18px;background:#d9defc;display:grid;place-items:center;flex-shrink:0">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#4c6ef0"><path d="M7 5l12 7-12 7z"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <span style="background:#e9eafd;color:#4c6ef0;font-size:10px;font-weight:700;letter-spacing:.08em;padding:3px 9px;border-radius:999px;display:inline-block">
              {{ continueItem.type }}
            </span>
            <h3 style="font-size:15px;font-weight:800;letter-spacing:-0.015em;color:#0f1115;margin:6px 0 4px;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ continueItem.title }}</h3>
            <p style="font-size:11px;color:#6b7280;font-weight:500;line-height:1.35;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ continueItem.desc }}</p>
            <div style="margin-top:10px;font-size:13px;font-weight:800;color:#0f1115;display:flex;align-items:center;gap:4px">
              O'qish <span>→</span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- YANGI MATERIALLAR -->
      <div style="padding:8px 20px 24px">
        <h2 style="font-size:22px;font-weight:800;letter-spacing:-0.025em;color:#0f1115;margin:0 0 12px">Yangi materiallar</h2>

        <!-- Skeleton -->
        <div v-if="!freshItems.length && !guidesData && !coursesData" class="flex flex-col gap-3">
          <div
            v-for="i in 3"
            :key="i"
            class="flex items-center gap-3"
            style="background:#f7f5ef;border-radius:20px;padding:14px"
          >
            <div class="skeleton" style="width:48px;height:48px;border-radius:14px;flex-shrink:0" />
            <div class="flex-1 flex flex-col gap-2">
              <div class="skeleton" style="height:10px;width:30%;border-radius:6px" />
              <div class="skeleton" style="height:14px;width:75%;border-radius:6px" />
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <NuxtLink
            v-for="(item, i) in freshItems"
            :key="item.slug"
            :to="item.type === 'KURS' ? `/courses/${item.slug}` : `/guides/${item.slug}`"
            class="tg-press-sm flex items-center gap-3 fade-up"
            :class="`fade-up-d${Math.min(i, 5)}`"
            style="background:#f7f5ef;border-radius:20px;padding:14px"
          >
            <div
              :style="`width:48px;height:48px;border-radius:14px;flex-shrink:0;background:${item.iconBg};display:grid;place-items:center`"
            >
              <UIcon
                :name="item.type === 'KURS' ? 'i-solar-graduation-cap-bold' : 'i-solar-book-bookmark-bold'"
                class="size-5.5"
                :style="`color:${item.tagFg}`"
              />
            </div>
            <div class="flex-1 min-w-0">
              <span
                :style="`background:${item.tagBg};color:${item.tagFg};font-size:9.5px;font-weight:700;letter-spacing:.08em;padding:3px 8px;border-radius:999px;display:inline-block;margin-bottom:5px`"
              >{{ item.type }}</span>
              <p style="font-size:14px;font-weight:800;color:#0f1115;margin:0;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ item.title }}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4c8d2" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
          </NuxtLink>

          <NuxtLink
            v-if="!freshItems.length"
            to="/catalog"
            class="flex items-center justify-center gap-2"
            style="background:#f7f5ef;border-radius:20px;padding:20px;color:#6b7280;font-size:13px;font-weight:600"
          >
            Katalogga o'tish →
          </NuxtLink>
        </div>
      </div>

    </template>
  </div>
</template>
