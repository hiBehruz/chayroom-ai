<script setup lang="ts">
const NuxtLinkComponent = resolveComponent('NuxtLink')
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const hasSubscription = computed(() => authStore.hasSubscription)

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

const taskOverview = {
  progress: 4,
  total: 4,
}

const tasks = [
  { id: 'about', label: 'Jamoamiz\nhaqida',      emoji: '📖', done: true, link: '/mini/about', bg: '#dbdcfc' },
  { id: 'rules', label: 'Qoidalarimiz',           emoji: '📝', done: true, link: '/mini/rules', bg: '#ec99c8' },
  { id: 'intro', label: "Maqsadingni\nbeligila",  emoji: '🎯', done: true, link: '/mini/intro', bg: '#ffd95a' },
  { id: 'first', label: 'Birinchi\nmaterial',     emoji: '✨', done: true, link: '/catalog',    bg: '#d6f4e4' },
]

const { data: guidesData } = await useAsyncData('dash-guides', () => $fetch<any[]>('/api/guides'))
const { data: coursesData } = await useAsyncData('dash-courses', () => $fetch<any[]>('/api/courses'))

const continueItem = computed(() => {
  const g = guidesData.value?.[0]
  if (!g) return null
  return { type: 'GAYD', title: g.title, desc: g.description ?? '', slug: g.slug }
})

const freshItems = computed(() => {
  const items: { type: string; title: string; slug: string; icon: string }[] = []
  const guides = guidesData.value ?? []
  const courses = coursesData.value ?? []

  for (const c of courses.slice(0, 2)) {
    items.push({ type: 'KURS', title: c.title, slug: c.slug, icon: 'chip' })
  }
  for (const g of guides.slice(0, 3)) {
    items.push({ type: 'GAYD', title: g.title, slug: g.slug, icon: 'db' })
  }
  return items.slice(0, 4)
})
</script>

<template>
  <div
    class="w-full relative overflow-x-hidden"
    style="background:#f4f4f6;min-height:100vh;font-family:'Plus Jakarta Sans',system-ui,sans-serif"
  >

    <!-- ── PAYWALL ──────────────────────────────── -->
    <template v-if="!hasSubscription">
      <div class="flex flex-col px-[18px] pt-10 pb-6" style="min-height:calc(100vh - 80px)">

        <!-- Brand -->
        <div class="flex items-center gap-2.5 mb-7">
          <div style="width:36px;height:36px;border-radius:11px;background:#0f1115;display:flex;align-items:center;justify-content:center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="m20.092 14.326l.193-1.894c.103-1.011.17-1.678.117-2.099h.02c.871 0 1.578-.746 1.578-1.666S21.293 7 20.421 7s-1.579.746-1.579 1.667c0 .416.145.797.384 1.089c-.343.223-.792.695-1.468 1.405c-.52.547-.78.82-1.07.863a.84.84 0 0 1-.473-.07c-.268-.124-.447-.462-.804-1.139L13.527 7.25c-.22-.417-.405-.766-.572-1.047c.683-.368 1.15-1.117 1.15-1.98C14.105 2.994 13.163 2 12 2s-2.105.995-2.105 2.222c0 .864.467 1.613 1.15 1.98c-.167.282-.351.631-.572 1.048L8.59 10.816c-.358.676-.537 1.014-.805 1.139a.84.84 0 0 1-.473.07c-.29-.043-.55-.317-1.07-.864c-.676-.71-1.125-1.182-1.468-1.405c.24-.292.384-.673.384-1.09C5.158 7.747 4.45 7 3.578 7C2.708 7 2 7.746 2 8.667c0 .92.707 1.666 1.579 1.666h.019c-.054.42.014 1.088.117 2.099l.193 1.894c.107 1.051.196 2.051.306 2.952h15.572c.11-.9.199-1.901.306-2.952M10.855 22h2.29c2.985 0 4.478 0 5.474-.94c.434-.412.71-1.152.908-2.116H4.473c.198.964.473 1.704.908 2.115C6.377 22 7.87 22 10.855 22"/>
            </svg>
          </div>
          <span style="font-size:16px;font-weight:700;letter-spacing:-0.01em;color:#0f1115">Chayroom AI Club</span>
        </div>

        <!-- Headline -->
        <div class="mb-5">
          <h1 style="font-size:30px;font-weight:800;letter-spacing:-0.035em;line-height:1.05;color:#0f1115;margin:0 0 8px">
            Bilimga eshik<br/>ochiq emas
          </h1>
          <p style="font-size:13px;line-height:1.6;color:#6b7280;font-weight:500;margin:0">
            Barcha kurslarga kirish uchun obuna kerak. Bir marta to'lang — abadiy o'rganing.
          </p>
        </div>

        <!-- Plan card (dark, selected) -->
        <div class="mb-3 relative overflow-hidden" style="background:#0f1115;border-radius:22px;padding:18px">
          <span style="position:absolute;top:14px;right:14px;background:#c6f24e;color:#0f1115;font-size:10px;font-weight:800;padding:4px 10px;border-radius:999px;letter-spacing:0.04em;font-family:'Plus Jakarta Sans',sans-serif">
            ENG FOYDALI
          </span>
          <p style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin:0 0 6px">Yillik obuna</p>
          <p style="font-size:32px;font-weight:800;letter-spacing:-0.04em;line-height:1;color:#fff;margin:0 0 16px">
            199 000 <span style="font-size:16px;font-weight:600;color:rgba(255,255,255,0.45)">so'm/oy</span>
          </p>

          <div class="flex flex-col gap-2.5">
            <div v-for="benefit in [
              { icon: 'solar:book-bold', text: 'Barcha kurslar va qo\'llanmalar' },
              { icon: 'solar:chat-round-bold', text: 'Yopiq AI Room Club kanal' },
              { icon: 'ph:lightning-fill', text: 'Yangi materiallar birinchi' },
              { icon: 'ph:robot-fill', text: 'AI agentlar va amaliy loyihalar' },
            ]" :key="benefit.text" class="flex items-center gap-3">
              <div style="width:28px;height:28px;border-radius:9px;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <UIcon :name="benefit.icon" class="size-3.5" style="color:#fff" />
              </div>
              <span style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.8)">{{ benefit.text }}</span>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <a
          href="https://t.me/hellobehruz"
          target="_blank"
          class="tg-press flex items-center justify-center gap-2.5 mb-2.5"
          style="height:54px;border-radius:16px;background:#3480f1;color:#fff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:-0.01em"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5 shrink-0" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-9.642-2.618q-1.458.607-5.831 2.513q-.711.282-.744.552c-.038.304.343.424.862.587l.218.07c.51.166 1.198.36 1.555.368q.486.01 1.084-.4q4.086-2.76 4.218-2.789c.063-.014.149-.032.207.02c.059.052.053.15.047.177c-.038.161-1.534 1.552-2.308 2.271q-.344.324-.683.653c-.474.457-.83.8.02 1.36c.861.568 1.73 1.134 2.57 1.733c.414.296.786.56 1.246.519c.267-.025.543-.276.683-1.026c.332-1.77.983-5.608 1.133-7.19a1.8 1.8 0 0 0-.017-.393a.42.42 0 0 0-.142-.27c-.12-.098-.305-.118-.387-.117c-.376.007-.953.207-3.73 1.362" />
          </svg>
          Obuna olish
        </a>

        <!-- Check payment -->
        <button
          class="tg-press-sm flex items-center justify-center w-full"
          style="height:52px;border-radius:16px;background:#ffffff;color:#0f1115;font-size:14px;font-weight:600;border:1.5px solid #e8e8ec"
          :disabled="checking"
          @click="checkPayment"
        >
          <span v-if="checking" class="flex items-center gap-2">
            <span class="size-3.5 rounded-full border-2 inline-block" style="border-color:#e0e0e4;border-top-color:#0f1115;animation:spin 0.8s linear infinite" />
            Tekshirilmoqda...
          </span>
          <span v-else-if="checked" style="color:#e5533d">To'lov topilmadi. Qayta urinib ko'ring.</span>
          <span v-else>To'ladim, tekshirish</span>
        </button>
      </div>
    </template>

    <!-- ── DASHBOARD (subscribed) ──────────────── -->
    <template v-else>

      <!-- Greeting row -->
      <div class="flex items-center gap-3" style="padding:12px 20px 18px">
        <div style="flex-shrink:0;width:56px;height:56px">
          <AppPixelAgentAvatar :variant="authStore.resolvedAgentVariant" size="lg" />
        </div>
        <div class="flex-1">
          <div style="font-weight:800;font-size:22px;letter-spacing:-0.025em;color:#0f1115;display:flex;align-items:center;gap:6px">
            Salom, {{ authStore.displayName }} <span>👋</span>
          </div>
          <div style="font-size:13px;color:#6b7280;font-weight:500;margin-top:1px">Daraja oshir</div>
        </div>
      </div>

      <!-- VAZIFALAR -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3" style="padding:0 20px">
          <h2 style="font-size:22px;font-weight:800;letter-spacing:-0.025em;color:#0f1115;margin:0">Vazifalar</h2>
          <span style="font-size:12px;font-weight:500;color:#6b7280">{{ taskOverview.progress }}/{{ taskOverview.total }} bajarildi</span>
        </div>

        <div class="flex gap-3 overflow-x-auto pb-1" style="padding-left:20px;padding-right:20px;scroll-snap-type:x mandatory;scrollbar-width:none;-ms-overflow-style:none">
          <!-- Progress card -->
          <NuxtLink
            to="/mini/tasks"
            class="tg-press flex-none flex flex-col justify-between"
            style="background:#0f1115;width:138px;height:168px;border-radius:22px;padding:14px 14px 12px;scroll-snap-align:start"
          >
            <div>
              <p style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.55);margin:0 0 8px">PROGRESS</p>
              <p style="font-size:32px;font-weight:800;color:#fff;line-height:1;margin:0;letter-spacing:-0.04em">
                {{ taskOverview.progress }}<span style="font-size:16px;color:rgba(255,255,255,0.55);font-weight:700">/{{ taskOverview.total }}</span>
              </p>
              <p style="font-size:12px;font-weight:500;color:rgba(255,255,255,0.7);margin:2px 0 0">Vazifalar</p>
            </div>
            <div class="flex items-center justify-between">
              <span style="font-size:13px;font-weight:700;color:#fff">Hammasi</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M9 6l6 6-6 6"/></svg>
            </div>
          </NuxtLink>

          <!-- Task cards -->
          <component
            :is="task.link ? NuxtLinkComponent : 'div'"
            v-for="task in tasks"
            :key="task.id"
            :to="task.link || undefined"
            class="tg-press flex-none flex flex-col justify-between"
            :style="`background:${task.bg};width:168px;height:168px;border-radius:22px;padding:14px 16px 12px;scroll-snap-align:start`"
          >
            <div style="font-size:32px;line-height:1">{{ task.emoji }}</div>
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
      <div v-if="continueItem" class="mb-5" style="padding:0 20px">
        <h2 style="font-size:22px;font-weight:800;letter-spacing:-0.025em;color:#0f1115;margin:0 0 12px">Davom etish</h2>
        <NuxtLink
          :to="`/guides/${continueItem.slug}`"
          class="tg-press flex gap-3 items-center"
          style="background:#ffffff;border-radius:22px;padding:18px;position:relative"
        >
          <div style="width:76px;height:76px;border-radius:18px;background:#d9defc;display:grid;place-items:center;flex-shrink:0">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#4c6ef0"><path d="M7 5l12 7-12 7z"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <span
              class="inline-block mb-1.5"
              style="background:#e9eafd;color:#4c6ef0;font-size:10px;font-weight:700;letter-spacing:0.08em;padding:3px 9px;border-radius:999px"
            >{{ continueItem.type }}</span>
            <h3 style="font-size:15px;font-weight:800;letter-spacing:-0.015em;color:#0f1115;margin:0 0 4px;line-height:1.15">{{ continueItem.title }}</h3>
            <p style="font-size:11px;color:#6b7280;font-weight:500;line-height:1.35;margin:0">{{ continueItem.desc }}</p>
            <p style="font-size:13px;font-weight:800;color:#0f1115;margin:10px 0 0;display:flex;align-items:center;gap:4px">O'qish <span>→</span></p>
          </div>
        </NuxtLink>
      </div>

      <!-- YANGI MATERIALLAR -->
      <div style="padding:0 20px 20px">
        <h2 style="font-size:22px;font-weight:800;letter-spacing:-0.025em;color:#0f1115;margin:0 0 12px">Yangi materiallar</h2>
        <div class="flex flex-col gap-2.5">
          <NuxtLink
            v-for="item in freshItems"
            :key="item.slug"
            :to="item.type === 'KURS' ? `/courses/${item.slug}` : `/guides/${item.slug}`"
            class="tg-press-sm flex items-center gap-3"
            style="background:#ffffff;border-radius:20px;padding:14px"
          >
            <div
              class="flex-none flex items-center justify-center"
              style="width:48px;height:48px;border-radius:14px;flex-shrink:0"
              :style="item.icon === 'chip' ? 'background:#e8f5ec' : item.icon === 'db' ? 'background:#e9eafd' : 'background:#f4f4f6'"
            >
              <svg v-if="item.icon === 'chip'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>
              </svg>
              <svg v-else-if="item.icon === 'db'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4c6ef0" stroke-width="1.8">
                <ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>
              </svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4c6ef0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <span
                class="inline-block mb-1"
                style="font-size:9.5px;font-weight:700;letter-spacing:0.08em;padding:3px 8px;border-radius:999px"
                :style="item.type === 'KURS' ? 'background:#e1f5e8;color:#1f8a5b' : 'background:#e9eafd;color:#4c6ef0'"
              >{{ item.type }}</span>
              <p style="font-size:14px;font-weight:800;letter-spacing:-0.01em;color:#0f1115;margin:0;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ item.title }}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4c8d2" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
          </NuxtLink>
        </div>
      </div>

    </template>
  </div>
</template>
