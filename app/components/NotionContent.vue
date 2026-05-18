<script setup lang="ts">
defineProps<{ blocks: any[] }>()

function getRichText(richText: any[]): string {
  return richText.map((r: any) => r.plain_text).join('')
}
</script>

<template>
  <div class="notion-content flex flex-col gap-3 text-[15px] leading-relaxed text-[#1a1a1a]">
    <template v-for="block in blocks" :key="block.id">
      <!-- Heading 1 -->
      <h1 v-if="block.type === 'heading_1'" class="text-[26px] font-extrabold tracking-tight mt-4">
        {{ getRichText(block.heading_1.rich_text) }}
      </h1>

      <!-- Heading 2 -->
      <h2 v-else-if="block.type === 'heading_2'" class="text-[20px] font-bold mt-3">
        {{ getRichText(block.heading_2.rich_text) }}
      </h2>

      <!-- Heading 3 -->
      <h3 v-else-if="block.type === 'heading_3'" class="text-[17px] font-semibold mt-2">
        {{ getRichText(block.heading_3.rich_text) }}
      </h3>

      <!-- Paragraph -->
      <p v-else-if="block.type === 'paragraph' && block.paragraph.rich_text.length" class="text-cx-muted">
        {{ getRichText(block.paragraph.rich_text) }}
      </p>

      <!-- Bulleted list -->
      <li v-else-if="block.type === 'bulleted_list_item'" class="ml-5 text-cx-muted list-disc">
        {{ getRichText(block.bulleted_list_item.rich_text) }}
      </li>

      <!-- Numbered list -->
      <li v-else-if="block.type === 'numbered_list_item'" class="ml-5 text-cx-muted list-decimal">
        {{ getRichText(block.numbered_list_item.rich_text) }}
      </li>

      <!-- Callout -->
      <div
        v-else-if="block.type === 'callout'"
        class="flex gap-3 p-4 rounded-xl bg-[#f0f4ff] border border-cx-blue/20"
      >
        <span>{{ block.callout.icon?.emoji ?? 'ℹ️' }}</span>
        <p class="text-[14px]">{{ getRichText(block.callout.rich_text) }}</p>
      </div>

      <!-- Code -->
      <pre
        v-else-if="block.type === 'code'"
        class="bg-[#0d1117] text-white rounded-xl p-4 text-[13px] overflow-x-auto"
      ><code>{{ getRichText(block.code.rich_text) }}</code></pre>

      <!-- Image -->
      <img
        v-else-if="block.type === 'image'"
        :src="block.image.type === 'external' ? block.image.external.url : block.image.file.url"
        class="rounded-xl w-full"
        alt=""
      >

      <!-- Embed (Kinescope) -->
      <div
        v-else-if="block.type === 'embed'"
        class="relative w-full rounded-2xl overflow-hidden"
        style="aspect-ratio: 16/9"
      >
        <iframe
          :src="block.embed.url.includes('kinescope') ? block.embed.url.replace('kinescope.io/', 'kinescope.io/embed/') : block.embed.url"
          class="absolute inset-0 w-full h-full"
          frameborder="0"
          allowfullscreen
        />
      </div>

      <!-- Divider -->
      <hr v-else-if="block.type === 'divider'" class="border-cx-line my-2">
    </template>
  </div>
</template>
