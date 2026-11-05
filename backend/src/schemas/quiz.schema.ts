import { z } from 'zod';

export const createQuizSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  title: z.string().min(3, 'Quiz title must be at least 3 characters').max(150),
  description: z.string().optional(),
  passingScorePercentage: z.number().min(0).max(100).optional(),
  timeLimitMinutes: z.number().min(1).max(180).optional(),
  maxAttempts: z.number().min(1).max(10).optional(),
});

export const addQuestionSchema = z.object({
  prompt: z.string().min(5, 'Question prompt is required'),
  questionType: z.enum(['MULTIPLE_CHOICE', 'MULTI_SELECT', 'TRUE_FALSE']).optional(),
  options: z
    .array(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1),
        isCorrect: z.boolean(),
      })
    )
    .min(2, 'At least 2 options are required'),
  explanation: z.string().optional(),
  points: z.number().min(1).optional(),
});

export const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1, 'Question ID is required'),
      selectedOptionIds: z.array(z.string()),
    })
  ),
});
