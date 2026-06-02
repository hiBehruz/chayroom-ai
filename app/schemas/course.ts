import { z } from 'zod'

export const courseSchema = z.object({
  title: z.string().min(3, "Sarlavha kamida 3 belgi bo'lishi kerak"),
  desc: z.string().min(10, "Tavsif kamida 10 belgi bo'lishi kerak"),
  duration: z.string().min(1, "Davomiylik kiritilishi shart"),
  badge: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type CourseFormData = z.infer<typeof courseSchema>
