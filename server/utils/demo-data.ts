export const DEMO_COURSES = [
  {
    id: 'demo-course-1',
    title: 'Вайб-кодинг: создавай приложения без опыта',
    description: 'Научись создавать полноценные веб-приложения с помощью ИИ — без знания программирования. Cursor, Claude, v0 и другие инструменты нового поколения.',
    category: 'Вайбкодинг',
    tags: ['Cursor', 'Claude', 'v0', 'Nuxt'],
    level: 'Начинающий',
    level_color: '#22c55e',
    modules_count: 5,
    lessons_count: 24,
    duration: '8 часов',
    cover_url: '',
    bg_color: '#0f172a',
    is_dark: true,
    kinescope_video_id: '',
    is_published: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-course-2',
    title: 'AI-агенты: автоматизируй свою жизнь',
    description: 'Разберись как создавать автономных ИИ-агентов, которые работают за тебя. N8N, Make, Zapier и кастомные агенты на базе Claude.',
    category: 'AI-агенты',
    tags: ['N8N', 'Make', 'Claude API', 'Автоматизация'],
    level: 'Средний',
    level_color: '#f59e0b',
    modules_count: 7,
    lessons_count: 31,
    duration: '12 часов',
    cover_url: '',
    bg_color: '#1e1b4b',
    is_dark: true,
    kinescope_video_id: '',
    is_published: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-course-3',
    title: 'ChatGPT для контента и бизнеса',
    description: 'Как использовать нейросети в реальной работе: тексты, маркетинг, аналитика, переговоры. Практические сценарии для предпринимателей.',
    category: 'Нейросети',
    tags: ['ChatGPT', 'Контент', 'Маркетинг', 'Бизнес'],
    level: 'Начинающий',
    level_color: '#22c55e',
    modules_count: 4,
    lessons_count: 18,
    duration: '5 часов',
    cover_url: '',
    bg_color: '#f5ede0',
    is_dark: false,
    kinescope_video_id: '',
    is_published: true,
    created_at: new Date().toISOString()
  }
]

export const DEMO_GUIDES = [
  {
    id: 'demo-guide-1',
    title: 'Как написать идеальный промпт',
    description: 'Структура, техники и реальные примеры промптов, которые дают качественный результат с первого раза.',
    category: 'Нейросети',
    tags: ['Промпты', 'ChatGPT', 'Claude'],
    cover_url: '',
    bg_color: '#0d1117',
    accent_color: '#60a5fa',
    badge: 'гайд',
    is_free: true,
    notion_page_id: 'demo',
    is_published: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-guide-2',
    title: 'Топ-10 AI-инструментов 2025',
    description: 'Разбор лучших ИИ-инструментов по категориям: код, текст, изображения, автоматизация.',
    category: 'Нейросети',
    tags: ['Инструменты', 'Подборка', '2025'],
    cover_url: '',
    bg_color: '#1a1a2e',
    accent_color: '#a78bfa',
    badge: 'подборка',
    is_free: false,
    notion_page_id: '',
    is_published: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-guide-3',
    title: 'N8N с нуля: первый AI-агент за час',
    description: 'Пошаговый гайд по созданию первого рабочего агента в N8N — от установки до деплоя.',
    category: 'AI-агенты',
    tags: ['N8N', 'Агенты', 'Автоматизация'],
    cover_url: '',
    bg_color: '#0f2417',
    accent_color: '#4ade80',
    badge: 'туториал',
    is_free: false,
    notion_page_id: '',
    is_published: true,
    created_at: new Date().toISOString()
  }
]

export const DEMO_NOTION_BLOCKS = [
  {
    id: 'b1',
    type: 'heading_1',
    heading_1: { rich_text: [{ plain_text: 'Что такое промпт и почему он важен' }] }
  },
  {
    id: 'b2',
    type: 'paragraph',
    paragraph: {
      rich_text: [{
        plain_text: 'Промпт — это инструкция, которую ты даёшь ИИ. Качество ответа напрямую зависит от качества промпта. Хороший промпт даёт точный результат с первого раза и экономит время.'
      }]
    }
  },
  {
    id: 'b3',
    type: 'heading_2',
    heading_2: { rich_text: [{ plain_text: 'Структура идеального промпта' }] }
  },
  {
    id: 'b4',
    type: 'numbered_list_item',
    numbered_list_item: { rich_text: [{ plain_text: 'Роль — кем должен выступить ИИ («ты — опытный маркетолог»)' }] }
  },
  {
    id: 'b5',
    type: 'numbered_list_item',
    numbered_list_item: { rich_text: [{ plain_text: 'Контекст — что уже известно и что за проект' }] }
  },
  {
    id: 'b6',
    type: 'numbered_list_item',
    numbered_list_item: { rich_text: [{ plain_text: 'Задача — что конкретно нужно сделать' }] }
  },
  {
    id: 'b7',
    type: 'numbered_list_item',
    numbered_list_item: { rich_text: [{ plain_text: 'Формат — как должен выглядеть ответ (список, таблица, 3 варианта)' }] }
  },
  {
    id: 'b8',
    type: 'callout',
    callout: {
      icon: { emoji: '💡' },
      rich_text: [{ plain_text: 'Совет: добавляй «объясни пошагово» или «дай 3 варианта» — это сильно улучшает результат.' }]
    }
  },
  {
    id: 'b9',
    type: 'heading_2',
    heading_2: { rich_text: [{ plain_text: 'Пример промпта' }] }
  },
  {
    id: 'b10',
    type: 'code',
    code: {
      rich_text: [{
        plain_text: 'Ты — опытный копирайтер для B2B SaaS.\nНапиши 3 варианта заголовка для лендинга AI-платформы.\nЦелевая аудитория: основатели стартапов, 25–40 лет.\nФормат: короткий заголовок + подзаголовок на 1 предложение.'
      }]
    }
  },
  {
    id: 'b11',
    type: 'divider',
    divider: {}
  },
  {
    id: 'b12',
    type: 'heading_2',
    heading_2: { rich_text: [{ plain_text: 'Частые ошибки' }] }
  },
  {
    id: 'b13',
    type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: [{ plain_text: 'Слишком расплывчатая задача: «напиши что-нибудь про наш продукт»' }] }
  },
  {
    id: 'b14',
    type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: [{ plain_text: 'Нет контекста: ИИ не знает твою аудиторию и продукт' }] }
  },
  {
    id: 'b15',
    type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: [{ plain_text: 'Не указан формат: получаешь эссе вместо списка' }] }
  },
  {
    id: 'b16',
    type: 'callout',
    callout: {
      icon: { emoji: '🚀' },
      rich_text: [{ plain_text: 'Практикуйся каждый день. Чем больше промптов пишешь — тем быстрее чувствуешь как работает ИИ.' }]
    }
  }
]
