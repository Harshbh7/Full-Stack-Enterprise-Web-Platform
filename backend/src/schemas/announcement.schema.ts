import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().min(5, 'Content must be at least 5 characters'),
  courseId: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']).optional(),
});
