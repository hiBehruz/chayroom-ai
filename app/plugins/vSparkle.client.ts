import gsap from 'gsap'

const STARS = ['✦', '✧', '★', '✶', '✸'] as const
const COLORS = ['#3480f1', '#3480f1', '#3480f1', '#3480f1'] as const

type SparkleElement = HTMLElement & {
  _sparkle?: (event: MouseEvent) => void
}

function spawnStar(el: HTMLElement, x: number, y: number) {
  const span = document.createElement('span')
  const size = 6 + Math.random() * 7
  const color = COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0]
  const char = STARS[Math.floor(Math.random() * STARS.length)] ?? STARS[0]

  span.textContent = char
  span.style.cssText = `
    position:absolute;
    left:${x}px;
    top:${y}px;
    font-size:${size}px;
    color:${color};
    pointer-events:none;
    user-select:none;
    z-index:20;
    opacity:0;
    line-height:1;
    text-shadow:0 0 6px ${color};
    transform:translate(-50%,-50%) scale(0) rotate(0deg);
  `
  el.appendChild(span)

  const drift = (Math.random() - 0.5) * 36
  const rot = (Math.random() - 0.5) * 60

  gsap.timeline({ onComplete: () => span.remove() })
    .to(span, { opacity: 0.18, scale: 1, rotation: rot, duration: 0.18, ease: 'back.out(2)' })
    .to(span, { opacity: 0, scale: 0.3, y: -(28 + Math.random() * 22), x: drift, rotation: rot * 2, duration: 0.5, ease: 'power2.in' })
}

export default defineNuxtPlugin((nuxt) => {
  nuxt.vueApp.directive('sparkle', {
    mounted(el: HTMLElement) {
      el.style.position = 'relative'
      el.style.overflow = 'hidden'

      let last = 0
      const handler = (e: MouseEvent) => {
        const now = Date.now()
        if (now - last < 55) return
        last = now
        const rect = el.getBoundingClientRect()
        spawnStar(el, e.clientX - rect.left, e.clientY - rect.top)
      }

      el.addEventListener('mousemove', handler)
      const sparkleEl = el as SparkleElement
      sparkleEl._sparkle = handler
    },
    unmounted(el: HTMLElement) {
      const handler = (el as SparkleElement)._sparkle
      if (handler) {
        el.removeEventListener('mousemove', handler)
      }
    }
  })
})
