import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  code: z.string().min(2, 'Course code is required').max(20),
  description: z.string().optional(),
  category: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const addModuleSchema = z.object({
  title: z.string().min(2, 'Module title is required').max(150),
  description: z.string().optional(),
  order: z.number().optional(),
});

export const addLessonSchema = z.object({
  title: z.string().min(2, 'Lesson title is required').max(150),
  contentType: z.enum(['VIDEO', 'MARKDOWN', 'PDF', 'AUDIO']).optional(),
  contentUrl: z.string().optional(),
  textContent: z.string().optional(),
  durationSeconds: z.number().min(1).optional(),
  isFreePreview: z.boolean().optional(),
  order: z.number().optional(),
});

export const addSyllabusSchema = z.object({
  moduleTitle: z.string().min(2, 'Module title is required').max(150),
  moduleDescription: z.string().optional(),
  lessons: z
    .array(
      z.object({
        title: z.string().min(2, 'Lesson title is required').max(150),
        textContent: z.string().optional(),
        durationMinutes: z.number().min(1).optional(),
        contentUrl: z.string().optional(),
      })
    )
    .optional(),
});
