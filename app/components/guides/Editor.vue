<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import { Extension, Node } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import FontFamily from '@tiptap/extension-font-family'
import Link from '@tiptap/extension-link'
import { onClickOutside } from '@vueuse/core'

const FontSizeExt = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: el => (el as HTMLElement).style.fontSize || null,
          renderHTML: attrs => attrs.fontSize ? { style: `font-size:${attrs.fontSize}` } : {}
        }
      }
    }]
  }
})

const FontWeightExt = Extension.create({
  name: 'fontWeight',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontWeight: {
          default: null,
          parseHTML: el => (el as HTMLElement).style.fontWeight || null,
          renderHTML: attrs => attrs.fontWeight ? { style: `font-weight:${attrs.fontWeight}` } : {}
        }
      }
    }]
  }
})

const VideoBlock = Node.create({
  name: 'videoBlock',
  group: 'block',
  atom: true,
  addAttributes() {
    return { src: { default: null } }
  },
  parseHTML() {
    return [{ tag: 'div[data-video-block]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { 'data-video-block': '' },
      ['video', { src: HTMLAttributes.src, controls: '', playsinline: '' }]
    ]
  }
})

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    TextStyle,
    FontSizeExt,
    FontWeightExt,
    Color,
    Highlight.configure({ multicolor: true }),
    Image.configure({ allowBase64: true, inline: false }),
    FontFamily,
    Link.configure({ openOnClick: false }),
    VideoBlock
  ],
  editorProps: {
    attributes: {
      class: 'guide-editor-body prose max-w-none outline-none min-h-80 px-6 py-5 text-[15px] text-[#14161f] leading-relaxed',
      style: 'font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    handlePaste(view, event) {
      const items = Array.from(event.clipboardData?.items ?? [])
      const imageItem = items.find(item => item.type.startsWith('image/'))
      if (!imageItem) return false

      event.preventDefault()
      const file = imageItem.getAsFile()
      if (!file) return true

      const ext = file.type.split('/')[1] || 'png'
      const filename = `paste-${Date.now()}.${ext}`

      fetch('/api/upload/image', {
        method: 'POST',
        body: file,
        headers: { 'Content-Type': file.type, 'X-Filename': encodeURIComponent(filename) }
      })
        .then(res => res.json())
        .then(({ publicUrl }) => {
          const imageNode = view.state.schema.nodes.image
          if (!imageNode) return
          view.dispatch(
            view.state.tr.replaceSelectionWith(
              imageNode.create({ src: publicUrl })
            )
          )
        })

      return true
    }
  },
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  }
})

watch(() => props.modelValue, (val) => {
  if (!editor.value) return
  if (editor.value.getHTML() === val) return
  editor.value.commands.setContent(val, { emitUpdate: false, parseOptions: { preserveWhitespace: true } })
})

onBeforeUnmount(() => editor.value?.destroy())

const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72]

function currentFontSize() {
  return editor.value?.getAttributes('textStyle').fontSize?.replace('px', '') ?? '16'
}

function setFontSize(size: string) {
  if (!editor.value) return
  editor.value.chain().focus().setMark('textStyle', { fontSize: size ? `${size}px` : null }).run()
}

const fontWeights = [
  { label: 'Thin', value: '100' },
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Heavy', value: '800' },
  { label: 'Black', value: '900' }
]

function currentFontWeight() {
  return editor.value?.getAttributes('textStyle').fontWeight ?? '400'
}

function setFontWeight(weight: string) {
  if (!editor.value) return
  editor.value.chain().focus().setMark('textStyle', { fontWeight: weight || null }).run()
}

const fonts = [
  { label: 'SF Pro', value: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Mono', value: '"SF Mono", "Fira Code", monospace' }
]
const defaultFontValue = fonts[0]?.value ?? '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

function currentFont() {
  const f = editor.value?.getAttributes('textStyle').fontFamily
  return fonts.find(x => x.value === f)?.label ?? 'SF Pro'
}

function setFont(value: string) {
  if (!editor.value) return
  editor.value.chain().focus().setFontFamily(value).run()
}

const translating = ref(false)
const translateError = ref('')

async function translateToUzbek() {
  if (!editor.value || translating.value) return
  translating.value = true
  translateError.value = ''
  try {
    const { html } = await $fetch<{ html: string }>('/api/translate', {
      method: 'POST',
      body: { html: editor.value.getHTML() }
    })
    editor.value.commands.setContent(html, { emitUpdate: false, parseOptions: { preserveWhitespace: true } })
  } catch (e: unknown) {
    translateError.value = e instanceof Error ? e.message : 'Xatolik yuz berdi'
  } finally {
    translating.value = false
  }
}

const colorPickerOpen = ref(false)
const colorPickerRef = ref<HTMLElement | null>(null)
onClickOutside(colorPickerRef, () => {
  colorPickerOpen.value = false
})

const bubbleColorPickerOpen = ref(false)
const bubbleColorPickerRef = ref<HTMLElement | null>(null)
onClickOutside(bubbleColorPickerRef, () => {
  bubbleColorPickerOpen.value = false
})

const bubbleLinkOpen = ref(false)
const bubbleLinkRef = ref<HTMLElement | null>(null)
const bubbleLinkInput = ref('')
onClickOutside(bubbleLinkRef, () => {
  bubbleLinkOpen.value = false
})

function openLinkInput() {
  bubbleLinkInput.value = editor.value?.getAttributes('link').href ?? ''
  bubbleLinkOpen.value = true
  nextTick(() => {
    (bubbleLinkRef.value?.querySelector('input') as HTMLInputElement | null)?.focus()
  })
}

function applyLink() {
  if (!editor.value) return
  const url = bubbleLinkInput.value.trim()
  if (url) {
    editor.value.chain().focus().setLink({ href: url }).run()
  } else {
    editor.value.chain().focus().unsetLink().run()
  }
  bubbleLinkOpen.value = false
}

function removeLink() {
  editor.value?.chain().focus().unsetLink().run()
  bubbleLinkOpen.value = false
}

const textColors = [
  { label: 'Default', value: null },
  { label: 'Dark', value: '#3f3f3f' },
  { label: 'Gray', value: '#6b7280' },
  { label: 'Brown', value: '#92400e' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Yellow', value: '#ca8a04' },
  { label: 'Green', value: '#16a34a' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Purple', value: '#9333ea' },
  { label: 'Pink', value: '#db2777' },
  { label: 'Red', value: '#dc2626' }
]

const bgColors = [
  { label: 'Yo\'q', value: null },
  { label: 'Oltin', value: '#fef08a' },
  { label: 'Shaftoli', value: '#fed7aa' },
  { label: 'Pushti', value: '#fecdd3' },
  { label: 'Lavanda', value: '#e9d5ff' },
  { label: 'Ko\'k', value: '#bfdbfe' },
  { label: 'Yashil', value: '#bbf7d0' },
  { label: 'Champagne', value: '#fde8c8' },
  { label: 'Kumush', value: '#dde3ec' },
  { label: 'Zangori', value: '#c7f2fa' }
]

function setTextColor(color: string | null) {
  if (!editor.value) return
  if (color) editor.value.chain().focus().setColor(color).run()
  else editor.value.chain().focus().unsetColor().run()
  colorPickerOpen.value = false
  bubbleColorPickerOpen.value = false
}

function setBgColor(color: string | null) {
  if (!editor.value) return
  if (color) editor.value.chain().focus().setHighlight({ color }).run()
  else editor.value.chain().focus().unsetHighlight().run()
  colorPickerOpen.value = false
  bubbleColorPickerOpen.value = false
}

const videoUploading = ref(false)

async function insertVideo(file: File) {
  if (!editor.value) return
  videoUploading.value = true
  try {
    const { uploadUrl, publicUrl } = await $fetch<{ uploadUrl: string, publicUrl: string }>(
      '/api/upload/presign',
      { method: 'POST', body: { filename: file.name, contentType: file.type } }
    )
    const res = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
    editor.value.chain().focus().insertContent({ type: 'videoBlock', attrs: { src: publicUrl } }).run()
  } finally {
    videoUploading.value = false
  }
}

const tools = [
  { label: 'B', action: () => editor.value?.chain().focus().toggleBold().run(), active: () => editor.value?.isActive('bold'), class: 'font-black' },
  { label: 'I', action: () => editor.value?.chain().focus().toggleItalic().run(), active: () => editor.value?.isActive('italic'), class: 'italic' },
  { label: '—', action: () => editor.value?.chain().focus().setHorizontalRule().run(), active: () => false },
  { label: '•', action: () => editor.value?.chain().focus().toggleBulletList().run(), active: () => editor.value?.isActive('bulletList') },
  { label: '1.', action: () => editor.value?.chain().focus().toggleOrderedList().run(), active: () => editor.value?.isActive('orderedList') },
  { label: '<>', action: () => editor.value?.chain().focus().toggleCodeBlock().run(), active: () => editor.value?.isActive('codeBlock'), class: 'font-mono text-[11px]' },
  { label: '❝', action: () => editor.value?.chain().focus().toggleBlockquote().run(), active: () => editor.value?.isActive('blockquote') }
]
</script>

<template>
  <div class="rounded-xl border border-cx-line overflow-visible bg-white">
    <div class="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-cx-line bg-[#f7f7f5] rounded-t-xl">
      <!-- Font section: icon + family + weight -->
      <div class="flex items-center gap-0.5">
        <!-- Font icon -->
        <span class="flex items-center justify-center w-6 h-7 text-cx-muted">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="1"
              y="11"
              font-family="Georgia, serif"
              font-size="12"
              font-style="italic"
              fill="currentColor"
            >T</text>
            <text
              x="7"
              y="13"
              font-family="Georgia, serif"
              font-size="8"
              fill="currentColor"
            >T</text>
          </svg>
        </span>
        <!-- Font family -->
        <select
          class="h-7 px-1.5 rounded-lg text-[12px] font-semibold text-cx-ink bg-transparent border border-cx-line hover:border-cx-blue focus:outline-none focus:border-cx-blue transition-colors cursor-pointer"
          :value="currentFont()"
          @change="setFont(fonts.find(f => f.label === ($event.target as HTMLSelectElement).value)?.value ?? defaultFontValue)"
        >
          <option
            v-for="f in fonts"
            :key="f.label"
            :value="f.label"
          >
            {{ f.label }}
          </option>
        </select>
        <!-- Font weight -->
        <select
          class="h-7 px-1.5 rounded-lg text-[12px] font-semibold text-cx-ink bg-transparent border border-cx-line hover:border-cx-blue focus:outline-none focus:border-cx-blue transition-colors cursor-pointer"
          :value="fontWeights.find(w => w.value === currentFontWeight())?.label ?? 'Regular'"
          @change="setFontWeight(fontWeights.find(w => w.label === ($event.target as HTMLSelectElement).value)?.value ?? '400')"
        >
          <option
            v-for="w in fontWeights"
            :key="w.value"
            :value="w.label"
          >
            {{ w.label }}
          </option>
        </select>
      </div>

      <div class="w-px h-4 bg-cx-line mx-0.5" />

      <!-- Size section: icon + size -->
      <div class="flex items-center gap-0.5">
        <!-- Size icon -->
        <span class="flex items-center justify-center w-6 h-7 text-cx-muted">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="0"
              y="13"
              font-family="Georgia, serif"
              font-size="14"
              font-style="italic"
              fill="currentColor"
            >T</text>
          </svg>
        </span>
        <!-- Font size -->
        <select
          class="h-7 w-16 px-1.5 rounded-lg text-[12px] font-semibold text-cx-ink bg-transparent border border-cx-line hover:border-cx-blue focus:outline-none focus:border-cx-blue transition-colors cursor-pointer"
          :value="currentFontSize()"
          @change="setFontSize(($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="size in fontSizes"
            :key="size"
            :value="size"
          >
            {{ size }} pt
          </option>
        </select>
      </div>

      <div class="w-px h-4 bg-cx-line mx-0.5" />

      <!-- Formatting tools -->
      <button
        v-for="tool in tools"
        :key="tool.label"
        type="button"
        :class="[
          'min-w-7 h-7 px-2 rounded-lg text-[13px] font-semibold transition-colors',
          tool.class ?? '',
          tool.active?.()
            ? 'bg-cx-blue text-white'
            : 'text-cx-muted hover:bg-[#ebebea] hover:text-cx-ink'
        ]"
        @click="tool.action()"
      >
        {{ tool.label }}
      </button>

      <div class="w-px h-4 bg-cx-line mx-0.5" />

      <!-- Color picker trigger -->
      <div
        ref="colorPickerRef"
        class="relative"
      >
        <button
          type="button"
          class="min-w-7 h-7 px-2 rounded-lg text-[13px] font-black transition-colors text-cx-muted hover:bg-[#ebebea] hover:text-cx-ink"
          :style="{ color: editor?.getAttributes('textStyle').color ?? undefined }"
          @click="colorPickerOpen = !colorPickerOpen"
        >
          A
        </button>

        <!-- Dropdown -->
        <div
          v-if="colorPickerOpen"
          class="absolute left-0 top-9 z-50 w-64 rounded-xl border border-cx-line bg-white shadow-lg p-3 flex flex-col gap-3"
        >
          <div>
            <p class="text-[10px] font-bold text-cx-muted uppercase tracking-wider mb-2">
              Matn rangi
            </p>
            <div class="grid grid-cols-5 gap-1.5">
              <button
                v-for="c in textColors"
                :key="c.label"
                type="button"
                class="h-8 rounded-lg border border-cx-line flex items-center justify-center text-[13px] font-black transition-colors hover:border-cx-blue"
                :style="c.value ? { color: c.value } : {}"
                :title="c.label"
                @click="setTextColor(c.value)"
              >
                A
              </button>
            </div>
          </div>
          <div>
            <p class="text-[10px] font-bold text-cx-muted uppercase tracking-wider mb-2">
              Fon rangi
            </p>
            <div class="grid grid-cols-5 gap-1.5">
              <button
                v-for="c in bgColors"
                :key="c.label"
                type="button"
                class="h-8 rounded-lg border border-cx-line flex items-center justify-center text-[13px] font-black transition-colors hover:border-cx-blue"
                :style="c.value ? { backgroundColor: c.value } : { backgroundColor: '#f9fafb' }"
                :title="c.label"
                @click="setBgColor(c.value)"
              >
                <span :style="{ color: '#1a1a1a', opacity: c.value ? 0.65 : 0.25 }">A</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="w-px h-4 bg-cx-line mx-0.5" />

      <!-- Video upload -->
      <label
        class="min-w-7 h-7 px-2 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
        :class="videoUploading ? 'text-cx-blue' : 'text-cx-muted hover:bg-[#ebebea] hover:text-cx-ink'"
        title="Video qo'shish"
      >
        <UIcon
          :name="videoUploading ? 'i-lucide-loader-2' : 'i-lucide-video'"
          class="size-3.5"
          :class="{ 'animate-spin': videoUploading }"
        />
        <input
          type="file"
          accept="video/*"
          class="hidden"
          :disabled="videoUploading"
          @change="(e: Event) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) insertVideo(f); (e.target as HTMLInputElement).value = '' }"
        >
      </label>

      <!-- Translate button -->
      <div class="ml-auto flex items-center gap-2">
        <span
          v-if="translateError"
          class="text-[11px] text-red-500 max-w-48 truncate"
          :title="translateError"
        >{{ translateError }}</span>
        <button
          type="button"
          :disabled="translating"
          class="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[12px] font-semibold transition-colors text-cx-muted hover:bg-[#ebebea] hover:text-cx-ink disabled:opacity-50"
          @click="translateToUzbek"
        >
          <span
            v-if="translating"
            class="inline-block size-3 border-2 border-cx-muted border-t-cx-blue rounded-full animate-spin"
          />
          <template v-else>
            RU→UZ Tarjima
          </template>
        </button>
      </div>
    </div>

    <!-- Bubble menu: appears on text selection -->
    <BubbleMenu
      v-if="editor"
      :editor="editor"
      :tippy-options="{ duration: 100, placement: 'top' }"
      class="flex items-center gap-0.5 px-1.5 py-1 rounded-xl bg-white border border-cx-line shadow-lg"
    >
      <!-- Font size -->
      <select
        class="h-7 w-16 px-1.5 rounded-lg text-[12px] font-semibold text-cx-ink bg-transparent border border-cx-line hover:border-cx-blue focus:outline-none focus:border-cx-blue transition-colors cursor-pointer"
        :value="currentFontSize()"
        @change="setFontSize(($event.target as HTMLSelectElement).value)"
      >
        <option
          v-for="size in fontSizes"
          :key="size"
          :value="size"
        >
          {{ size }} pt
        </option>
      </select>

      <!-- Font weight -->
      <select
        class="h-7 px-1.5 rounded-lg text-[12px] font-semibold text-cx-ink bg-transparent border border-cx-line hover:border-cx-blue focus:outline-none focus:border-cx-blue transition-colors cursor-pointer"
        :value="fontWeights.find(w => w.value === currentFontWeight())?.label ?? 'Regular'"
        @change="setFontWeight(fontWeights.find(w => w.label === ($event.target as HTMLSelectElement).value)?.value ?? '400')"
      >
        <option
          v-for="w in [{ label: 'Regular', value: '400' }, { label: 'Bold', value: '700' }, { label: 'Heavy', value: '800' }, { label: 'Black', value: '900' }]"
          :key="w.value"
          :value="w.label"
        >
          {{ w.label }}
        </option>
      </select>

      <div class="w-px h-4 bg-cx-line mx-0.5" />

      <!-- Bold -->
      <button
        type="button"
        :class="[
          'min-w-7 h-7 px-2 rounded-lg text-[13px] font-black transition-colors',
          editor.isActive('bold') ? 'bg-cx-blue text-white' : 'text-cx-muted hover:bg-[#ebebea] hover:text-cx-ink'
        ]"
        @click="editor.chain().focus().toggleBold().run()"
      >
        B
      </button>

      <!-- Italic -->
      <button
        type="button"
        :class="[
          'min-w-7 h-7 px-2 rounded-lg text-[13px] italic transition-colors',
          editor.isActive('italic') ? 'bg-cx-blue text-white' : 'text-cx-muted hover:bg-[#ebebea] hover:text-cx-ink'
        ]"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        I
      </button>

      <div class="w-px h-4 bg-cx-line mx-0.5" />

      <!-- Link -->
      <div
        ref="bubbleLinkRef"
        class="relative"
      >
        <button
          type="button"
          :class="[
            'min-w-7 h-7 px-2 rounded-lg text-[13px] transition-colors',
            editor.isActive('link') ? 'bg-cx-blue text-white' : 'text-cx-muted hover:bg-[#ebebea] hover:text-cx-ink'
          ]"
          @click="openLinkInput"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
        </button>

        <div
          v-if="bubbleLinkOpen"
          class="absolute left-1/2 -translate-x-1/2 top-9 z-50 w-72 rounded-xl border border-cx-line bg-white shadow-lg p-3 flex flex-col gap-2"
        >
          <p class="text-[10px] font-bold text-cx-muted uppercase tracking-wider">
            Link URL
          </p>
          <input
            v-model="bubbleLinkInput"
            type="url"
            placeholder="https://..."
            class="w-full px-3 py-2 rounded-lg border border-cx-line text-[13px] text-cx-ink placeholder:text-cx-faint focus:outline-none focus:border-cx-blue transition-colors"
            @keydown.enter.prevent="applyLink"
            @keydown.esc.prevent="bubbleLinkOpen = false"
          >
          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 py-1.5 rounded-lg bg-cx-blue text-white text-[12px] font-semibold hover:bg-cx-blue/90 transition-colors"
              @click="applyLink"
            >
              Saqlash
            </button>
            <button
              v-if="editor.isActive('link')"
              type="button"
              class="py-1.5 px-3 rounded-lg border border-red-200 text-red-500 text-[12px] font-semibold hover:bg-red-50 transition-colors"
              @click="removeLink"
            >
              O'chirish
            </button>
          </div>
        </div>
      </div>

      <div class="w-px h-4 bg-cx-line mx-0.5" />

      <!-- Color picker -->
      <div
        ref="bubbleColorPickerRef"
        class="relative"
      >
        <button
          type="button"
          class="min-w-7 h-7 px-2 rounded-lg text-[13px] font-black transition-colors text-cx-muted hover:bg-[#ebebea] hover:text-cx-ink"
          :style="{ color: editor.getAttributes('textStyle').color ?? undefined }"
          @click="bubbleColorPickerOpen = !bubbleColorPickerOpen"
        >
          A
        </button>

        <div
          v-if="bubbleColorPickerOpen"
          class="absolute left-1/2 -translate-x-1/2 top-9 z-50 w-64 rounded-xl border border-cx-line bg-white shadow-lg p-3 flex flex-col gap-3"
        >
          <div>
            <p class="text-[10px] font-bold text-cx-muted uppercase tracking-wider mb-2">
              Matn rangi
            </p>
            <div class="grid grid-cols-5 gap-1.5">
              <button
                v-for="c in textColors"
                :key="c.label"
                type="button"
                class="h-8 rounded-lg border border-cx-line flex items-center justify-center text-[13px] font-black transition-colors hover:border-cx-blue"
                :style="c.value ? { color: c.value } : {}"
                :title="c.label"
                @click="setTextColor(c.value)"
              >
                A
              </button>
            </div>
          </div>
          <div>
            <p class="text-[10px] font-bold text-cx-muted uppercase tracking-wider mb-2">
              Fon rangi
            </p>
            <div class="grid grid-cols-5 gap-1.5">
              <button
                v-for="c in bgColors"
                :key="c.label"
                type="button"
                class="h-8 rounded-lg border border-cx-line flex items-center justify-center text-[13px] font-black transition-colors hover:border-cx-blue"
                :style="c.value ? { backgroundColor: c.value } : { backgroundColor: '#f9fafb' }"
                :title="c.label"
                @click="setBgColor(c.value)"
              >
                <span :style="{ color: '#1a1a1a', opacity: c.value ? 0.65 : 0.25 }">A</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </BubbleMenu>

    <EditorContent :editor="editor" />
  </div>
</template>
