<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const lessonId = parseInt(route.params.id as string)

interface Lesson {
  title: string
  type: string
  duration: string
  free: boolean
  content: string
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

// Flatten all lessons with metadata
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

useSeoMeta({ title: `${lesson.flatIndex}. ${lesson.title} — ${course.title}` })
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-180 mx-auto px-10 py-8">

      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-cx-muted mb-6 flex-wrap">
        <NuxtLink to="/courses" class="hover:text-cx-ink transition-colors">Kurslar</NuxtLink>
        <span>/</span>
        <NuxtLink :to="'/courses/' + course.slug" class="hover:text-cx-ink transition-colors truncate max-w-48">{{ course.title }}</NuxtLink>
        <span>/</span>
        <span class="text-cx-ink font-medium truncate max-w-60">{{ lesson.title }}</span>
      </div>

      <!-- Progress card -->
      <div class="rounded-2xl border border-cx-line bg-[#f7f7f5] p-5 mb-8">
        <div class="flex items-center gap-2 mb-1">
          <NuxtLink :to="'/courses/' + course.slug" class="text-[13px] font-bold text-cx-blue hover:underline">
            Modul {{ lesson.modIndex + 1 }}
          </NuxtLink>
          <span class="text-[13px] text-cx-muted">{{ currentMod.title }}</span>
        </div>
        <div class="text-[18px] font-extrabold text-[#1a1a1a] mb-3">
          Dars {{ lesson.flatIndex }} / {{ course.lessons }}
        </div>
        <div class="flex items-center gap-3">
          <div class="flex-1 h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
            <div
              class="h-full bg-cx-blue rounded-full transition-all duration-500"
              :style="{ width: `${Math.round((lessonId - 1) / course.lessons * 100)}%` }"
            />
          </div>
          <span class="text-[12px] text-cx-muted shrink-0">{{ Math.round((lessonId - 1) / course.lessons * 100) }}%</span>
        </div>
      </div>

      <!-- Lesson meta -->
      <div class="flex items-center gap-3 mb-4">
        <span class="px-3 py-1 rounded-full bg-[#EAEAE8] text-[#6B6B6B] text-[12px] font-medium">{{ lesson.type }}</span>
        <span class="flex items-center gap-1 text-[13px] text-cx-muted">
          <UIcon name="i-lucide-clock" class="size-3.5" />
          {{ lesson.duration }}
        </span>
      </div>

      <!-- Title -->
      <h1 class="text-[28px] font-extrabold tracking-tight text-[#1a1a1a] leading-tight mb-8">
        {{ lesson.flatIndex }}. {{ lesson.title }}
      </h1>

      <!-- Content -->
      <div
        class="text-[#1a1a1a]
          [&_h2]:text-[22px] [&_h2]:font-extrabold [&_h2]:mb-4 [&_h2]:mt-8
          [&_h3]:text-[17px] [&_h3]:font-bold [&_h3]:mb-3 [&_h3]:mt-6
          [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:mb-4
          [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:pl-5 [&_ol]:mb-4
          [&_li]:text-[15px] [&_li]:leading-[1.7] [&_li]:mb-1.5 [&_li]:list-disc
          [&_ol_li]:list-decimal
          [&_strong]:font-bold
          [&_mark]:bg-[#fff3b0] [&_mark]:px-0.5 [&_mark]:rounded
          [&_blockquote]:border-l-4 [&_blockquote]:border-[#e5e5e5] [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-5 [&_blockquote]:text-cx-muted [&_blockquote]:italic
          [&_code]:bg-[#f0f0f0] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px]
          [&_pre]:bg-[#1a1a1a] [&_pre]:text-white [&_pre]:p-5 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:mb-5 [&_pre]:text-[13px]"
        v-html="lesson.content"
      />

      <!-- Navigation -->
      <div class="flex items-center justify-between mt-12 pt-6 border-t border-cx-line">
        <NuxtLink
          v-if="prevLesson"
          :to="`/courses/${course.slug}/lesson/${prevLesson.flatIndex}`"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-cx-line text-[13px] font-semibold text-cx-ink hover:bg-[#f7f7f5] transition-colors"
        >
          <span>←</span>
          <span>{{ prevLesson.flatIndex }}. {{ prevLesson.title }}</span>
        </NuxtLink>
        <div v-else />

        <NuxtLink
          v-if="nextLesson"
          :to="`/courses/${course.slug}/lesson/${nextLesson.flatIndex}`"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-cx-line text-[13px] font-semibold text-cx-ink hover:bg-[#f7f7f5] transition-colors"
        >
          <span>{{ nextLesson.flatIndex }}. {{ nextLesson.title }}</span>
          <span>→</span>
        </NuxtLink>
        <NuxtLink
          v-else
          :to="'/courses/' + course.slug"
          class="btn-primary px-5! py-2.5! text-[13px]!"
        >
          <span>Kursga qaytish</span>
          <span>→</span>
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
