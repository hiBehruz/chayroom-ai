<script setup lang="ts">
const route = useRoute()

const tabs = [
  { to: '/dashboard', icon: 'i-solar-home-bold', label: 'Asosiy' },
  { to: '/catalog', icon: 'i-solar-library-bold', label: 'Materiallar' }
]

const isProfileActive = computed(() => route.path === '/profile')
</script>

<template>
  <div
    class="fixed z-50"
    style="bottom:20px;left:50%;transform:translateX(-50%);padding-bottom:env(safe-area-inset-bottom,0px)"
  >
    <div
      class="flex items-center"
      style="background:#0f1115;border-radius:999px;padding:6px 10px;gap:4px;box-shadow:0 4px 20px rgba(15,17,21,0.18),0 1px 3px rgba(15,17,21,0.12)"
    >
      <!-- Regular tabs -->
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="nav-tab"
        :class="route.path === tab.to ? 'nav-tab--active' : ''"
      >
        <!-- White bg layer — animates independently -->
        <span
          class="nav-bg"
          :class="route.path === tab.to ? 'nav-bg--visible' : ''"
        />

        <!-- Content -->
        <span class="nav-content">
          <UIcon
            :name="tab.icon"
            class="nav-icon size-6"
            :class="route.path === tab.to ? 'nav-icon--active' : ''"
          />
          <span
            v-if="route.path === tab.to"
            class="nav-label"
          >{{ tab.label }}</span>
        </span>
      </NuxtLink>

      <!-- Profile tab -->
      <NuxtLink
        to="/profile"
        class="nav-tab"
        :class="isProfileActive ? 'nav-tab--active' : ''"
      >
        <span
          class="nav-bg"
          :class="isProfileActive ? 'nav-bg--visible' : ''"
        />
        <span class="nav-content">
          <UIcon
            name="i-solar-user-bold"
            class="nav-icon size-6"
            :class="isProfileActive ? 'nav-icon--active' : ''"
          />
          <span
            v-if="isProfileActive"
            class="nav-label"
          >Profil</span>
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
/* ── Tab shell ────────────────────────────────── */
.nav-tab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  border-radius: 999px;
  width: 56px;
  /* Spring width expansion */
  transition: width 340ms cubic-bezier(0.34, 1.22, 0.64, 1);
  will-change: width;
  overflow: hidden;
}
.nav-tab--active { width: 136px; }

/* ── White bg — GPU animated ──────────────────── */
.nav-bg {
  position: absolute;
  inset: 6px;
  border-radius: 999px;
  background: #fffdf9;
  /* Start: invisible + squashed */
  opacity: 0;
  transform: scaleX(0.4) scaleY(0.7);
  transform-origin: center;
  /* Exit: fast fade out */
  transition:
    opacity  140ms cubic-bezier(0.4, 0, 1, 1),
    transform 140ms cubic-bezier(0.4, 0, 1, 1);
  will-change: transform, opacity;
  pointer-events: none;
}
.nav-bg--visible {
  opacity: 1;
  /* Enter: spring overshoot — scaleY briefly goes 1.08 via keyframe */
  transform: scaleX(1) scaleY(1);
  animation: bg-pop 360ms cubic-bezier(0.34, 1.4, 0.64, 1) forwards;
  transition: none;
}

@keyframes bg-pop {
  0%   { opacity: 0; transform: scaleX(0.35) scaleY(0.65); }
  40%  { opacity: 1; transform: scaleX(1.04) scaleY(1.08); }
  70%  { transform: scaleX(0.98) scaleY(0.97); }
  100% { transform: scaleX(1)    scaleY(1); }
}

/* ── Content row ──────────────────────────────── */
.nav-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 14px;
}

/* ── Icon ─────────────────────────────────────── */
.nav-icon {
  color: rgba(255,255,255,0.72);
  flex-shrink: 0;
  transition: color 180ms ease;
  transform-origin: center;
}
.nav-icon--active {
  color: #111827;
  animation: icon-pop 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes icon-pop {
  0%   { transform: scale(0.7) rotate(-8deg); }
  55%  { transform: scale(1.2) rotate(4deg); }
  100% { transform: scale(1)   rotate(0deg); }
}

/* ── Label ────────────────────────────────────── */
.nav-label {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  letter-spacing: -0.01em;
  /* Follow Through: arrives after bg finishes */
  animation: label-in 260ms cubic-bezier(0, 0, 0.2, 1) 100ms both;
}

@keyframes label-in {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ── Press squash ─────────────────────────────── */
.nav-tab:active {
  transform: scale(0.94, 1.05);
  transition: transform 80ms cubic-bezier(0.4, 0, 1, 1);
}
</style>
