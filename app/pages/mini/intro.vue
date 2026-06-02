<script setup lang="ts">
const router = useRouter()

const professions = [
  { id: 'entrepreneur', label: 'Tadbirkor', icon: 'noto:rocket' },
  { id: 'specialist', label: 'Mutaxassis', icon: 'noto:briefcase' },
  { id: 'blogger', label: 'Blogger', icon: 'noto:clapper-board' },
  { id: 'expert', label: 'Ekspert', icon: 'noto:graduation-cap' },
  { id: 'marketing', label: 'Marketing, SMM', icon: 'noto:loudspeaker' },
  { id: 'designer', label: 'Dizayner', icon: 'noto:artist-palette' },
  { id: 'psychologist', label: 'Psixolog, kouч', icon: 'noto:person-in-lotus-position' },
  { id: 'student', label: 'O\'qiyman, talaba', icon: 'noto:books' },
  { id: 'developer', label: 'Dasturchi', icon: 'noto:laptop' },
  { id: 'other', label: 'Boshqa', icon: 'noto:pencil' },
]

const goals = [
  { id: 'earn', label: 'AIdan daromad topish', icon: 'noto:money-bag' },
  { id: 'project', label: 'AI bilan loyiha ishga tushirish', icon: 'noto:rocket' },
  { id: 'work', label: 'Ishda qo\'llash', icon: 'noto:direct-hit' },
  { id: 'automate', label: 'Rutinni avtomatlashtirish', icon: 'noto:hammer-and-wrench' },
  { id: 'business', label: 'Biznesga joriy etish', icon: 'noto:office-building' },
  { id: 'costs', label: 'Xarajatlarni kamaytirish', icon: 'noto:chart-decreasing' },
  { id: 'community', label: 'Hamfikrlar topish', icon: 'noto:handshake' },
  { id: 'curious', label: 'Shunchaki qiziq', icon: 'noto:sparkles' },
]

const levels = [
  { id: 'beginner', label: 'Yangi boshlovchi', desc: 'Endigina tanishishni boshlamoqdaman',            icon: 'ph:leaf-bold',      iconBg: '#e8f5e9', iconColor: '#22c55e' },
  { id: 'middle',   label: "O'rta daraja",     desc: "Vositalarni bilaman, vaqti-vaqti bilan ishlataman", icon: 'ph:lightning-bold', iconBg: '#fef3c7', iconColor: '#f59e0b' },
  { id: 'advanced', label: 'Tajribali',         desc: 'Ish va loyihalarda muntazam ishlataman',         icon: 'ph:flame-bold',     iconBg: '#ffede6', iconColor: '#f97316' },
  { id: 'pro',      label: 'Professional',      desc: "O'z yechimlarim va avtomatizatsiyalarim bor",    icon: 'ph:crown-bold',     iconBg: '#f0e9ff', iconColor: '#9333ea' },
]

const STORAGE_KEY = 'chayroom:intro'

const selectedProfession = ref<string | null>(null)
const selectedGoals = ref<string[]>([])
const selectedLevel = ref<string | null>(null)

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    if (saved.profession) selectedProfession.value = saved.profession
    if (Array.isArray(saved.goals)) selectedGoals.value = saved.goals
    if (saved.level) selectedLevel.value = saved.level
  } catch {}
})

function toggleGoal(id: string) {
  const i = selectedGoals.value.indexOf(id)
  if (i === -1) selectedGoals.value.push(id)
  else selectedGoals.value.splice(i, 1)
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    profession: selectedProfession.value,
    goals: selectedGoals.value,
    level: selectedLevel.value,
  }))
  router.back()
}

useSeoMeta({ title: 'O\'zingiz haqingizda' })
</script>

<template>
  <div style="background:#fffdf9; min-height:100vh">

    <!-- Header -->
    <div class="flex items-center gap-3 px-4 pt-5 pb-4" style="background:#fffdf9">
      <button
        class="inline-flex items-center justify-center flex-none tg-press-sm"
        style="width:44px;height:44px;border-radius:999px;background:#f7f5ef;color:#0f1115"
        @click="router.back()"
      >
        <UIcon name="i-lucide-arrow-left" class="size-4.5" />
      </button>
      <h1 class="text-[26px] font-black tracking-tight leading-tight" style="color:#0f1115">O'zim haqimda</h1>
    </div>

    <div class="px-4 pb-8">

      <p class="text-[14px] leading-relaxed mb-6" style="color:#6b7280">
        Bu javoblar maqsadlaringizga mos materiallar va tadbirlarni tanlashga yordam beradi.
      </p>

      <!-- Profession -->
      <p class="text-[17px] font-bold mb-3" style="color:#0f1115">Nima bilan shug'ullanasiz?</p>
      <div class="grid grid-cols-2 gap-2 mb-7">
        <button
          v-for="p in professions"
          :key="p.id"
          class="flex items-center gap-2.5 px-3 py-3 rounded-2xl text-left tg-press-sm"
          :style="selectedProfession === p.id
            ? 'background:#3480f1; color:#ffffff'
            : 'background:#f7f5ef; color:#0f1115; border:1px solid #e8e4da'"
          @click="selectedProfession = p.id"
        >
          <UIcon :name="p.icon" class="size-6 flex-none" />
          <span class="text-[13px] font-semibold leading-snug">{{ p.label }}</span>
        </button>
      </div>

      <!-- Goals -->
      <p class="text-[17px] font-bold mb-1" style="color:#0f1115">AI sohasidagi maqsadlaringiz?</p>
      <p class="text-[13px] mb-3" style="color:#6b7280">Bir nechtasini tanlash mumkin</p>
      <div class="space-y-2 mb-7">
        <button
          v-for="g in goals"
          :key="g.id"
          class="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left tg-press-sm"
          :style="selectedGoals.includes(g.id)
            ? 'background:#3480f1; color:#ffffff'
            : 'background:#f7f5ef; color:#0f1115; border:1px solid #e8e4da'"
          @click="toggleGoal(g.id)"
        >
          <UIcon :name="g.icon" class="size-6 flex-none" />
          <span class="text-[14px] font-semibold">{{ g.label }}</span>
        </button>
      </div>

      <!-- Level -->
      <p class="text-[17px] font-bold mb-3" style="color:#0f1115">AI darajangiz?</p>
      <div class="space-y-2 mb-7">
        <button
          v-for="l in levels"
          :key="l.id"
          class="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left tg-press-sm"
          :style="selectedLevel === l.id
            ? 'background:#3480f1; color:#ffffff'
            : 'background:#f7f5ef; color:#0f1115; border:1px solid #e8e4da'"
          @click="selectedLevel = l.id"
        >
          <div
            class="flex-none grid place-items-center rounded-xl"
            style="width:38px;height:38px;flex-shrink:0"
            :style="selectedLevel === l.id ? 'background:rgba(255,255,255,0.2)' : `background:${l.iconBg}`"
          >
            <UIcon
              :name="l.icon"
              class="size-5"
              :style="selectedLevel === l.id ? 'color:#fff' : `color:${l.iconColor}`"
            />
          </div>
          <div>
            <p class="text-[15px] font-bold leading-snug">{{ l.label }}</p>
            <p class="text-[12px] leading-snug mt-0.5" :style="selectedLevel === l.id ? 'color:rgba(255,255,255,0.75)' : 'color:#6b7280'">{{ l.desc }}</p>
          </div>
        </button>
      </div>

      <!-- Save -->
      <button
        class="w-full py-4 rounded-[999px] font-bold text-[16px] text-white tg-btn"
        style="background:linear-gradient(135deg,#3480f1,#6c63ff); box-shadow:0 6px 20px rgba(52,128,241,0.25)"
        @click="save"
      >
        Saqlash
      </button>

    </div>
  </div>
</template>
