<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { isMiniApp } = useTelegramApp()
const slug = route.params.slug as string
const lessonId = parseInt(route.params.id as string)

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/courses/' + slug)
  }
}

interface Lesson {
  title: string
  type: string
  duration: string
  free: boolean
  content: string
  videoUrl?: string
}

interface CourseModule {
  title: string
  subtitle: string
  duration: string
  lessons: Lesson[]
}

interface CourseDetail {
  slug: string
  title: string
  lessons: number
  modulesList: CourseModule[]
}

const allCourses: CourseDetail[] = [
  {
    slug: 'hermes-ai-agent',
    title: 'Hermes asosida AI agent yaratish va sozlash',
    lessons: 7,
    modulesList: [
      {
        title: 'Agent yaratish',
        subtitle: 'Baza',
        duration: '~15m',
        lessons: [
          {
            title: 'Hermes asosida agent yaratish: tayyor assistant',
            type: 'Amaliy',
            duration: '15 min',
            free: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            content: `
<p>В этом гайде, мы расскажем, как создать AI-агента на базе Hermes, который сможет выполнять задачи ассистента, проджекта.</p>

<h2>Что получится в итоге</h2>
<p>У вас будет личный ИИ-ассистент, который сможет:</p>
<ul>
  <li>работает на отдельном сервере 24/7;</li>
  <li>отвечает вам в Telegram;</li>
  <li>использует Hermes как агентную систему;</li>
  <li>подключается к модели через OpenAI Codex / ChatGPT OAuth;</li>
  <li>имеет рабочую папку для файлов, планов и заметок;</li>
  <li>хранит базовую память о вас и своих правилах работы;</li>
  <li>ограничен по доступу: писать боту смогут только разрешённые Telegram user ID;</li>
  <li>может дальше расширяться под ваши задачи, проекты, интеграции и роли.</li>
</ul>

<blockquote>Этот агент по факту костяк, который затем вы сможете кастомизировать под любые задачи и давать те роли, которые вам нужно под ваши личные/рабочие процессы.</blockquote>

<h2>Зачем вообще нужен Hermes</h2>
<p>Обычный чат с ИИ хорошо отвечает на вопросы, <mark>но плохо подходит для роли постоянного помощника:</mark></p>
<ul>
  <li>он не живёт у вас на сервере;</li>
  <li>не принимает задачи из Telegram 24/7;</li>
  <li>не имеет нормального рабочего пространства;</li>
  <li>не всегда помнит ваши правила и контекст;</li>
  <li>не работает как отдельный агент с файлами, инструментами и gateway.</li>
</ul>
<p><strong>Hermes</strong> нужен как «операционная система» для AI-агента — это слой, который связывает между собой модель, Telegram, память, рабочую папку, инструменты и правила безопасности. В гайде эту связку часто называют словом <strong>gateway</strong> — это просто <strong>внутренняя «прослойка» Hermes</strong>, которая принимает ваши сообщения из Telegram, передаёт их модели и возвращает ответ.</p>
<p><mark>Основная идея:</mark> вы не просто открываете очередной чат, а ставите себе <strong>личного помощника на сервер</strong>, который <strong>можно улучшать и подключать к процессам</strong>.</p>
`
          }
        ]
      },
      {
        title: 'Agentni yaxshilash va sozlash',
        subtitle: "Ko'nikmalar qo'shish",
        duration: '~40m',
        lessons: [
          { title: "Agentga yangi ko'nikma qo'shish", type: 'Amaliy', duration: '10 min', free: false, content: '<p>Bu dars tez orada qo\'shiladi.</p>' },
          { title: 'Agentlar orasida muloqot', type: 'Nazariy', duration: '8 min', free: false, content: '<p>Bu dars tez orada qo\'shiladi.</p>' },
          { title: "Ikkinchi agent qo'shish", type: 'Amaliy', duration: '12 min', free: false, content: '<p>Bu dars tez orada qo\'shiladi.</p>' },
          { title: 'Agent xotirasini sozlash', type: 'Amaliy', duration: '10 min', free: false, content: '<p>Bu dars tez orada qo\'shiladi.</p>' }
        ]
      },
      {
        title: 'AI Office',
        subtitle: 'Agentlar ofisi',
        duration: '~20m',
        lessons: [
          { title: 'Agentlar tizimini loyihalash', type: 'Nazariy', duration: '10 min', free: false, content: '<p>Bu dars tez orada qo\'shiladi.</p>' },
          { title: 'AI Office yaratish', type: 'Amaliy', duration: '10 min', free: false, content: '<p>Bu dars tez orada qo\'shiladi.</p>' }
        ]
      }
    ]
  },
  {
    slug: 'vibe-coding',
    title: 'Vibe coding noldan',
    lessons: 31,
    modulesList: [
      {
        title: 'Kirish va asoslar',
        subtitle: 'Baza',
        duration: '~45m',
        lessons: [
          { title: 'Vibe coding nima va u qanday ishlaydi', type: 'Nazariy', duration: '10 min', free: false, content: '<p>Bu dars tez orada qo\'shiladi.</p>' },
          { title: "AI vositalarini tanlash va sozlash", type: 'Amaliy', duration: '15 min', free: false, content: '<p>Bu dars tez orada qo\'shiladi.</p>' },
          { title: 'Birinchi loyihangizni boshlash', type: 'Amaliy', duration: '20 min', free: false, content: '<p>Bu dars tez orada qo\'shiladi.</p>' }
        ]
      }
    ]
  }
]

interface FlatLesson extends Lesson {
  flatIndex: number
  modIndex: number
  lessonIndexInMod: number
  modTitle: string
}

const course = allCourses.find(c => c.slug === slug)
if (!course) throw createError({ statusCode: 404, statusMessage: 'Kurs topilmadi' })

const flatLessons: FlatLesson[] = []
let idx = 1
for (let mi = 0; mi < course.modulesList.length; mi++) {
  const mod = course.modulesList[mi]
  for (let li = 0; li < mod.lessons.length; li++) {
    flatLessons.push({
      ...mod.lessons[li],
      flatIndex: idx,
      modIndex: mi,
      lessonIndexInMod: li,
      modTitle: mod.title
    })
    idx++
  }
}

const lesson = flatLessons.find(l => l.flatIndex === lessonId)
if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Dars topilmadi' })

const prevLesson = flatLessons.find(l => l.flatIndex === lessonId - 1)
const nextLesson = flatLessons.find(l => l.flatIndex === lessonId + 1)
const currentMod = course.modulesList[lesson.modIndex]

const progress = computed(() => Math.round((lessonId - 1) / course.lessons * 100))

const contentRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  const videos = contentRef.value?.querySelectorAll('video')
  if (!videos?.length) return
  const [{ default: Plyr }] = await Promise.all([
    import('plyr'),
    import('plyr/dist/plyr.css'),
  ])
  videos.forEach(video => new Plyr(video, {
    controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'settings', 'pip', 'fullscreen'],
    settings: ['speed'],
    speed: { selected: 1, options: [0.75, 1, 1.25, 1.5, 2] },
  }))
})

useSeoMeta({ title: `${lesson.flatIndex}. ${lesson.title} — ${course.title}` })
</script>

<template>
  <div class="min-h-screen" :class="isMiniApp ? 'bg-[#efefef]' : 'bg-cx-surface'">
    <div class="mx-auto max-w-full" :class="isMiniApp ? 'px-4 py-5' : 'w-310 max-w-[calc(100vw-40px)] px-0 py-8 max-md:px-5'">
      <div class="mx-auto max-w-full" :class="isMiniApp ? '' : 'w-220.5'">

      <!-- Back buttons — desktop only -->
      <div v-if="!isMiniApp" class="mb-8 flex items-center gap-3">
        <button class="nav-btn" @click="goBack">
          <UIcon name="i-lucide-arrow-left" class="size-5 shrink-0" />
          Orqaga
        </button>
        <NuxtLink :to="'/courses/' + course.slug" class="nav-btn">
          Kurslarga qaytish
        </NuxtLink>
      </div>

      <!-- Progress card -->
      <div class="rounded-2xl border border-cx-line overflow-hidden mb-6" :class="isMiniApp ? 'bg-white' : 'bg-[#f7f5ef]'">
        <div class="px-5 pt-5 pb-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
              <UIcon name="i-solar-chart-2-bold" class="size-5 text-cx-blue" />
              <span class="text-[14px] font-bold text-cx-ink">O'quv jarayoni</span>
            </div>
            <span class="text-[14px] font-bold text-cx-blue">{{ progress }}%</span>
          </div>
          <div class="h-2 bg-[#e5e2d8] rounded-full overflow-hidden mb-3">
            <div
              class="h-full bg-cx-blue rounded-full transition-[width] duration-500 ease-out"
              :style="{ width: `${progress}%` }"
            />
          </div>
          <div class="flex items-center gap-1.5 text-[13px] text-cx-muted">
            <UIcon name="i-solar-play-circle-bold" class="size-4" />
            <span>{{ lessonId - 1 }} / {{ course.lessons }} dars</span>
          </div>
        </div>
        <div class="border-t border-cx-line px-5 py-3">
          <div class="text-[12px] font-semibold text-cx-muted uppercase tracking-wide mb-1">Joriy modul</div>
          <div class="text-[14px] font-bold text-cx-ink leading-snug">{{ currentMod.title }}</div>
          <div class="text-[12px] text-cx-muted mt-0.5">{{ currentMod.subtitle }}</div>
        </div>
      </div>

      <!-- Lesson content -->
      <div>
        <!-- Lesson meta row -->
        <div class="flex items-center gap-2.5 mb-5">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-[#f0eee8] px-3 py-1 text-[12px] font-semibold text-cx-ink">
            <UIcon name="i-solar-clapperboard-play-bold" class="size-3.5 text-cx-blue" />
            {{ lesson.type }}
          </span>
          <span class="flex items-center gap-1.5 text-[13px] text-cx-muted">
            <UIcon name="i-solar-clock-circle-bold" class="size-4" />
            {{ lesson.duration }}
          </span>
          <span class="text-[13px] text-cx-muted">
            Dars {{ lesson.flatIndex }} / {{ course.lessons }}
          </span>
        </div>

        <!-- Title -->
        <h1
          class="font-extrabold tracking-tight text-[#1a1a1a] leading-[1.15] mb-6"
          :class="isMiniApp ? 'text-[22px]' : 'text-[32px] mb-8'"
        >{{ lesson.title }}</h1>

        <!-- Video player -->
        <div v-if="lesson.videoUrl" class="mb-8">
          <UiVideoPlayer :src="lesson.videoUrl" />
        </div>

        <!-- Content -->
        <div
          class="lesson-content text-[#1a1a1a]
            [&_strong]:font-bold [&_strong]:text-[#1a1a1a]
            [&_mark]:bg-[#fff3b0] [&_mark]:px-0.5 [&_mark]:rounded
            [&_blockquote]:rounded-xl [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:my-5 [&_blockquote]:text-cx-muted [&_blockquote]:italic
            [&_[data-video-block]]:my-6 [&_video]:w-full [&_video]:rounded-xl [&_video]:block
            [&_code]:bg-[#f0ede8] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px] [&_code]:font-mono
            [&_pre]:bg-[#1a1a1a] [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:mb-4 [&_pre]:text-[13px]
            [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:pl-5 [&_ol]:mb-4 [&_ol_li]:list-decimal"
          :class="isMiniApp
            ? '[&_h2]:text-[18px] [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:tracking-tight [&_h3]:text-[15px] [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_p]:text-[14px] [&_p]:leading-[1.7] [&_p]:mb-3 [&_p]:text-[#2a2c35] [&_li]:text-[14px] [&_li]:leading-[1.7] [&_li]:mb-1 [&_li]:list-disc [&_li]:text-[#2a2c35] [&_blockquote]:bg-[#f0ede8] [&_blockquote]:text-[13px]'
            : '[&_h2]:text-[22px] [&_h2]:font-extrabold [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:tracking-tight [&_h3]:text-[17px] [&_h3]:font-bold [&_h3]:mb-3 [&_h3]:mt-6 [&_p]:text-[16px] [&_p]:leading-[1.75] [&_p]:mb-4 [&_p]:text-[#2a2c35] [&_li]:text-[16px] [&_li]:leading-[1.75] [&_li]:mb-1.5 [&_li]:list-disc [&_li]:text-[#2a2c35] [&_blockquote]:bg-[#f7f5ef] [&_blockquote]:text-[15px]'"
          ref="contentRef"
          v-html="lesson.content"
        />

        <!-- Navigation -->
        <div class="flex items-center justify-between mt-12 pt-6 border-t border-cx-line gap-3">
          <NuxtLink
            v-if="prevLesson"
            :to="`/courses/${course.slug}/lesson/${prevLesson.flatIndex}`"
            class="nav-btn nav-btn-prev"
          >
            <UIcon name="i-solar-alt-arrow-left-bold" class="size-4 shrink-0" />
            <span class="truncate max-w-52">{{ prevLesson.title }}</span>
          </NuxtLink>
          <div v-else />

          <NuxtLink
            v-if="nextLesson"
            :to="`/courses/${course.slug}/lesson/${nextLesson.flatIndex}`"
            class="nav-btn nav-btn-next ml-auto"
          >
            <span class="truncate max-w-52">{{ nextLesson.title }}</span>
            <UIcon name="i-solar-alt-arrow-right-bold" class="size-4 shrink-0" />
          </NuxtLink>
          <NuxtLink
            v-else
            :to="'/courses/' + course.slug"
            class="nav-btn nav-btn-next ml-auto"
          >
            <span>Kursga qaytish</span>
            <UIcon name="i-solar-home-smile-bold" class="size-4 shrink-0" />
          </NuxtLink>
        </div>
      </div>
      </div><!-- /882px inner -->

    </div>
  </div>
</template>

<style scoped>
/* ── Prev button — same as Kurslarga qaytish ────────────── */
.nav-btn {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  gap: 10px;
  padding: 0 22px;
  border-radius: 999px;
  background: #f7f5ef;
  color: #14161f;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  text-decoration: none;
  transition: transform 0.2s ease, color 0.2s ease;
}
.nav-btn:hover {
  transform: scale(1.03);
  color: #3480f1;
}
.nav-btn:active { transform: scale(0.97); }

/* ── Next button — same as Meni nima kutadi ─────────────── */
.nav-btn-next {
  background: #0a0a0a;
  border: 1px solid #0a0a0a;
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(10, 10, 10, 0.12);
  transition: gap 0.2s ease, opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}
.nav-btn-next:hover {
  gap: 16px;
  opacity: 0.9;
  transform: scale(1.04);
  background: #1a1a1a;
  color: #ffffff;
}
.nav-btn-next:active { opacity: 0.7; transform: scale(0.98); }

/* ── Plyr theme for content-embedded videos ─────────────── */
.lesson-content :deep(.plyr) {
  --plyr-color-main: #3480f1;
  --plyr-border-radius: 12px;
  border-radius: 12px;
}

/* ── Accessibility ──────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .nav-btn,
  .nav-btn-next { transition-duration: 0.01ms !important; }
}
</style>
