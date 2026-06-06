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
  id: number
  title: string
  type: string
  duration: string
  free: boolean
  content: string | null
  videoUrl?: string | null
  locked?: boolean
}

interface CourseModule {
  id?: number
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

interface CourseApiDetail {
  slug: string
  title: string
  modulesList?: CourseModule[] | null
}

interface FlatLesson extends Lesson {
  flatIndex: number
  modIndex: number
  modTitle: string
}

const requestFetch = useRequestFetch()
const courseData = await requestFetch<CourseApiDetail>(`/api/courses/${slug}`).catch(() => null)
if (!courseData) throw createError({ statusCode: 404, statusMessage: 'Kurs topilmadi' })

const isAccessModalOpen = ref(false)

const course: CourseDetail = {
  slug: courseData.slug,
  title: courseData.title,
  lessons: courseData.modulesList?.reduce((s, m) => s + m.lessons.length, 0) ?? 0,
  modulesList: courseData.modulesList ?? []
}

const flatLessons: FlatLesson[] = []
let idx = 1
for (let mi = 0; mi < course.modulesList.length; mi++) {
  const mod = course.modulesList[mi]
  if (!mod) continue
  for (const l of mod.lessons) {
    flatLessons.push({ ...l, flatIndex: idx, modIndex: mi, modTitle: mod.title })
    idx++
  }
}

const lesson = flatLessons.find(l => l.flatIndex === lessonId)
if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Dars topilmadi' })

const prevLesson = flatLessons.find(l => l.flatIndex === lessonId - 1)
const nextLesson = flatLessons.find(l => l.flatIndex === lessonId + 1)
const currentMod = course.modulesList[lesson.modIndex]
if (!currentMod) throw createError({ statusCode: 404, statusMessage: 'Modul topilmadi' })

const progress = computed(() => Math.round((lessonId - 1) / course.lessons * 100))

const contentRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  const videos = contentRef.value?.querySelectorAll('video')
  if (!videos?.length) return
  const [{ default: Plyr }] = await Promise.all([
    import('plyr'),
    import('plyr/dist/plyr.css')
  ])
  videos.forEach(video => new Plyr(video, {
    controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'settings', 'pip', 'fullscreen'],
    settings: ['speed'],
    speed: { selected: 1, options: [0.75, 1, 1.25, 1.5, 2] }
  }))
})

useSeoMeta({ title: `${lesson.flatIndex}. ${lesson.title} — ${course.title}` })
</script>

<template>
  <div
    class="min-h-screen"
    :class="isMiniApp ? 'bg-[#efefef]' : 'bg-cx-surface'"
  >
    <div
      class="mx-auto max-w-full"
      :class="isMiniApp ? 'px-4 py-5' : 'w-310 max-w-[calc(100vw-40px)] px-0 py-8 max-md:px-5'"
    >
      <div
        class="mx-auto max-w-full"
        :class="isMiniApp ? '' : 'w-220.5'"
      >
        <!-- Back buttons — desktop only -->
        <div
          v-if="!isMiniApp"
          class="mb-8 flex items-center gap-3"
        >
          <button
            class="nav-btn"
            @click="goBack"
          >
            <UIcon
              name="i-lucide-arrow-left"
              class="size-5 shrink-0"
            />
            Orqaga
          </button>
          <NuxtLink
            :to="'/courses/' + course.slug"
            class="nav-btn"
          >
            Kurslarga qaytish
          </NuxtLink>
        </div>

        <!-- Progress card -->
        <div
          class="rounded-2xl border border-cx-line overflow-hidden mb-6"
          :class="isMiniApp ? 'bg-white' : 'bg-[#f7f5ef]'"
        >
          <div class="px-5 pt-5 pb-4">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2.5">
                <UIcon
                  name="i-solar-chart-2-bold"
                  class="size-5 text-cx-blue"
                />
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
              <UIcon
                name="i-solar-play-circle-bold"
                class="size-4"
              />
              <span>{{ lessonId - 1 }} / {{ course.lessons }} dars</span>
            </div>
          </div>
          <div class="border-t border-cx-line px-5 py-3">
            <div class="text-[12px] font-semibold text-cx-muted uppercase tracking-wide mb-1">
              Joriy modul
            </div>
            <div class="text-[14px] font-bold text-cx-ink leading-snug">
              {{ currentMod.title }}
            </div>
            <div class="text-[12px] text-cx-muted mt-0.5">
              {{ currentMod.subtitle }}
            </div>
          </div>
        </div>

        <!-- Lesson content -->
        <div>
          <!-- Lesson meta row -->
          <div class="flex items-center gap-2.5 mb-5">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-[#f0eee8] px-3 py-1 text-[12px] font-semibold text-cx-ink">
              <UIcon
                name="i-solar-clapperboard-play-bold"
                class="size-3.5 text-cx-blue"
              />
              {{ lesson.type }}
            </span>
            <span class="flex items-center gap-1.5 text-[13px] text-cx-muted">
              <UIcon
                name="i-solar-clock-circle-bold"
                class="size-4"
              />
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
          >
            {{ lesson.title }}
          </h1>

          <!-- Locked: subscription required -->
          <div
            v-if="lesson.locked"
            class="rounded-2xl border border-[#e8e5dd] bg-[#f7f5ef] px-6 py-12 text-center max-md:px-5 max-md:py-10"
          >
            <div class="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-[#eef4ff]">
              <UIcon
                name="i-solar-lock-keyhole-bold"
                class="size-7 text-cx-blue"
              />
            </div>
            <h3 class="mb-2 text-[20px] font-extrabold tracking-tight text-[#14161f] max-md:text-[18px]">
              Bu dars obuna uchun
            </h3>
            <p class="mx-auto mb-6 max-w-md text-[15px] leading-relaxed text-cx-muted max-md:text-[14px]">
              Darsni to'liq ko'rish uchun AI Room Club obunasini faollashtiring.
            </p>
            <button
              class="inline-flex items-center gap-2 rounded-full bg-cx-blue px-6 py-3 text-[15px] font-bold text-white transition-all duration-200 hover:scale-[1.03] hover:opacity-90 active:scale-95"
              @click="isAccessModalOpen = true"
            >
              Kirish huquqini olish
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4"
              />
            </button>
          </div>

          <!-- Video player -->
          <div
            v-if="!lesson.locked && lesson.videoUrl"
            class="mb-8"
          >
            <UiVideoPlayer :src="lesson.videoUrl" />
          </div>

          <!-- Content -->
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="!lesson.locked"
            ref="contentRef"
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
            v-html="lesson.content"
          />
          <!-- eslint-enable vue/no-v-html -->

          <!-- Navigation -->
          <div class="flex items-center justify-between mt-12 pt-6 border-t border-cx-line gap-3">
            <NuxtLink
              v-if="prevLesson"
              :to="`/courses/${course.slug}/lesson/${prevLesson.flatIndex}`"
              class="nav-btn nav-btn-prev"
            >
              <UIcon
                name="i-solar-alt-arrow-left-bold"
                class="size-4 shrink-0"
              />
              <span class="truncate max-w-52">{{ prevLesson.title }}</span>
            </NuxtLink>
            <div v-else />

            <NuxtLink
              v-if="nextLesson"
              :to="`/courses/${course.slug}/lesson/${nextLesson.flatIndex}`"
              class="nav-btn nav-btn-next ml-auto"
            >
              <span class="truncate max-w-52">{{ nextLesson.title }}</span>
              <UIcon
                name="i-solar-alt-arrow-right-bold"
                class="size-4 shrink-0"
              />
            </NuxtLink>
            <NuxtLink
              v-else
              :to="'/courses/' + course.slug"
              class="nav-btn nav-btn-next ml-auto"
            >
              <span>Kursga qaytish</span>
              <UIcon
                name="i-solar-home-smile-bold"
                class="size-4 shrink-0"
              />
            </NuxtLink>
          </div>
        </div>
      </div><!-- /882px inner -->
    </div>

    <AppAccessModal v-model="isAccessModalOpen" />
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
