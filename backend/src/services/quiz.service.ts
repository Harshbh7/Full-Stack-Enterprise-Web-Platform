import { quizRepository } from '../repositories/quiz.repository.js';
import { IQuiz } from '../models/Quiz.js';
import { IQuestion } from '../models/Question.js';
import { IQuizAttempt } from '../models/QuizAttempt.js';
import { NotFoundError, BadRequestError } from '../utils/errors.util.js';
import { PaginationOptions, PaginatedResult } from '../repositories/base.repository.js';

export interface SubmitAnswerInput {
  questionId: string;
  selectedOptionIds: string[];
}

export interface QuizSubmissionResult {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  attemptId: string;
  breakdown: Array<{
    questionId: string;
    prompt: string;
    isCorrect: boolean;
    pointsAwarded: number;
    explanation?: string;
  }>;
}

export class QuizService {
  async listQuizzes(
    tenantId: string | undefined,
    isSuperAdmin: boolean,
    courseId?: string,
    options: PaginationOptions = { page: 1, limit: 10, skip: 0 }
  ): Promise<PaginatedResult<IQuiz>> {
    return quizRepository.findByCourse(courseId || '', tenantId, isSuperAdmin, options);
  }

  async getQuizDetails(
    quizId: string,
    tenantId: string | undefined,
    isSuperAdmin: boolean,
    isStudent = false
  ): Promise<{ quiz: IQuiz; questions: IQuestion[] }> {
    const quiz = await quizRepository.findById(quizId, tenantId, isSuperAdmin, 'courseId');
    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    const questions = await quizRepository.getQuestions(quizId, tenantId, isSuperAdmin, isStudent);

    return {
      quiz,
      questions,
    };
  }

  async createQuiz(
    data: {
      courseId: string;
      title: string;
      description?: string;
      passingScorePercentage?: number;
      timeLimitMinutes?: number;
      maxAttempts?: number;
    },
    tenantId: string
  ): Promise<IQuiz> {
    return quizRepository.create({
      tenantId: tenantId as any,
      courseId: data.courseId as any,
      title: data.title.trim(),
      description: data.description,
      passingScorePercentage: data.passingScorePercentage || 70,
      timeLimitMinutes: data.timeLimitMinutes || 20,
      maxAttempts: data.maxAttempts || 3,
      status: 'PUBLISHED',
    });
  }

  async addQuestion(
    quizId: string,
    questionData: {
      prompt: string;
      questionType?: 'MULTIPLE_CHOICE' | 'MULTI_SELECT' | 'TRUE_FALSE';
      options: Array<{ id: string; text: string; isCorrect: boolean }>;
      explanation?: string;
      points?: number;
    },
    tenantId: string
  ): Promise<IQuestion> {
    const quiz = await quizRepository.findById(quizId, tenantId);
    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    return quizRepository.createQuestion({
      tenantId: tenantId as any,
      quizId: quiz._id,
      prompt: questionData.prompt,
      questionType: questionData.questionType || 'MULTIPLE_CHOICE',
      options: questionData.options,
      explanation: questionData.explanation,
      points: questionData.points || 10,
    });
  }

  /**
   * Automated grading engine: compares student answers against canonical answer keys.
   */
  async submitQuiz(
    quizId: string,
    answers: SubmitAnswerInput[],
    studentId: string,
    tenantId: string
  ): Promise<QuizSubmissionResult> {
    const quiz = await quizRepository.findById(quizId, tenantId);
    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    // Retrieve real questions with correct options (not sanitized)
    const questions = await quizRepository.getQuestions(quizId, tenantId, false, false);
    if (questions.length === 0) {
      throw new BadRequestError('Quiz has no questions configured');
    }

    let earnedScore = 0;
    let totalMaxScore = 0;

    const breakdown = questions.map((q) => {
      const qPoints = q.points || 10;
      totalMaxScore += qPoints;

      const submission = answers.find(
        (a) => a.questionId.toString() === q._id.toString()
      );

      const submittedOptionIds = submission?.selectedOptionIds || [];
      const correctOptionIds = q.options.filter((opt) => opt.isCorrect).map((opt) => opt.id);

      // Check if student's selected options match exactly the correct options
      const isCorrect =
        submittedOptionIds.length === correctOptionIds.length &&
        correctOptionIds.every((id) => submittedOptionIds.includes(id));

      const pointsAwarded = isCorrect ? qPoints : 0;
      earnedScore += pointsAwarded;

      return {
        questionId: q._id.toString(),
        prompt: q.prompt,
        isCorrect,
        pointsAwarded,
        explanation: q.explanation,
      };
    });

    const percentage = totalMaxScore > 0 ? Math.round((earnedScore / totalMaxScore) * 100) : 0;
    const passed = percentage >= quiz.passingScorePercentage;

    const attempt = await quizRepository.createAttempt({
      tenantId: tenantId as any,
      quizId: quiz._id,
      studentId: studentId as any,
      courseId: quiz.courseId,
      answers: answers.map((a) => ({
        questionId: a.questionId as any,
        selectedOptionIds: a.selectedOptionIds,
      })),
      score: earnedScore,
      maxScore: totalMaxScore,
      percentage,
      passed,
      submittedAt: new Date(),
    });

    return {
      score: earnedScore,
      maxScore: totalMaxScore,
      percentage,
      passed,
      attemptId: attempt._id.toString(),
      breakdown,
    };
  }

  async getAttempts(
    quizId: string,
    studentId?: string,
    tenantId?: string,
    isSuperAdmin = false
  ): Promise<IQuizAttempt[]> {
    return quizRepository.getAttempts(quizId, studentId, tenantId, isSuperAdmin);
  }

  async getAllAttempts(
    tenantId?: string,
    isSuperAdmin = false
  ): Promise<IQuizAttempt[]> {
    return quizRepository.getAllAttempts(tenantId, isSuperAdmin);
  }
}

export const quizService = new QuizService();
