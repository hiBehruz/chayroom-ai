<template>
  <footer class="footer-shell">
    <div class="w-[1240px] max-w-[calc(100vw-40px)] mx-auto px-0 pt-22 pb-8 max-md:px-5 max-md:pt-14">
      <div class="grid grid-cols-[1.2fr_0.9fr_0.9fr_1fr] gap-x-18 gap-y-0 items-start max-lg:grid-cols-2 max-lg:gap-10 max-md:grid-cols-1">
        <div>
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-3 text-[#111318]"
          >
            <span class="footer-logo-mark">
              <UIcon
                name="i-lucide-sparkles"
                class="size-5"
              />
            </span>
            <span class="text-[28px] font-semibold tracking-tight leading-none">
              Chayroom AI Club
            </span>
          </NuxtLink>
          <p class="mt-4 max-w-56 text-[16px] leading-normal text-[#858585]">
            AI bilan rivojlanish uchun<br>yopiq hamjamiyat va muhit.
          </p>
        </div>

        <nav class="footer-link-col items-start">
          <span class="footer-link">
            Club bilan
          </span>
          <NuxtLink
            to="/courses"
            class="footer-link"
          >
            Kurslar
          </NuxtLink>
          <NuxtLink
            to="/guides"
            class="footer-link"
          >
            Qo’llanmalar
          </NuxtLink>
        </nav>

        <nav class="footer-link-col items-start">
          <NuxtLink
            to="/#faq"
            class="footer-link"
          >
            Savollar
          </NuxtLink>
          <NuxtLink
            to="/dashboard"
            class="footer-link"
          >
            Panel
          </NuxtLink>
        </nav>

        <div class="flex items-start justify-end gap-3 text-[#111318] max-lg:justify-start">
          <a
            v-for="social in socials"
            :key="social.label"
            href="#"
            :aria-label="social.label"
            class="footer-social"
          >
            <UIcon
              :name="social.icon"
              class="size-5"
            />
          </a>
        </div>

        <!-- Bottom panel: full width -->
        <div class="col-span-full mt-14 border-t border-[#d7d2ca] pt-8 flex items-center justify-between gap-6 max-md:flex-col max-md:items-start max-md:gap-3">
          <p class="text-[16px] text-[#858585]">
            © 2026 All rights reserved
          </p>
          <div class="flex items-center gap-9">
            <a
              href="#"
              class="footer-legal"
            >Terms of use</a>
            <a
              href="#"
              class="footer-legal"
            >Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const socials = [
  { label: 'Telegram', icon: 'i-simple-icons-telegram' },
  { label: 'LinkedIn', icon: 'i-simple-icons-linkedin' },
  { label: 'X', icon: 'i-simple-icons-x' },
  { label: 'YouTube', icon: 'i-simple-icons-youtube' }
]
</script>

<style scoped>
.footer-shell {
  background: #fffdf9;
  border-radius: 0 0 14px 14px;
}

.footer-logo-mark {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  color: #fffdf9;
  background: #111318;
}

.footer-link-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.footer-link {
  color: #14161f;
  font-family: var(--font-inter), 'Inter Fallback', sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  transition: color 0.2s ease, transform 0.2s ease;
}

.footer-link:hover,
.footer-social:hover,
.footer-legal:hover {
  color: #3480f1;
}

.footer-link:hover,
.footer-social:hover {
  transform: translateY(-1px);
}

.footer-badge {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  border-radius: 9999px;
  color: #fff;
  background: #3480f1;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
}

.footer-social {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #111318;
  transition: color 0.2s ease, transform 0.2s ease;
}

.footer-legal {
  color: #858585;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.2s ease;
}
</style>
