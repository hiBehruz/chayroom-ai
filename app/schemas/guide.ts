import { z } from 'zod'

export const guideSchema = z.object({
  title: z.string().min(3, "Sarlavha kamida 3 belgi bo'lishi kerak"),
  desc: z.string().min(10, "Tavsif kamida 10 belgi bo'lishi kerak"),
  badge: z.string().optional(),
  tags: z.array(z.string()).optional(),
  accent: z.string().optional(),
  content: z.string().min(1, "Kontent bo'sh bo'lmasligi kerak"),
})

export type GuideFormData = z.infer<typeof guideSchema>
