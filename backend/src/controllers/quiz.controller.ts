import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { quizService } from '../services/quiz.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination.util.js';
import { BadRequestError } from '../utils/errors.util.js';

export class QuizController {
  async listQuizzes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
      const courseId = req.query.courseId as string | undefined;
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

      const result = await quizService.listQuizzes(
        req.tenantId,
        isSuperAdmin,
        courseId,
        { page, limit, skip, sortBy, sortOrder }
      );

      const meta = buildPaginationMeta(result.total, page, limit);
      return sendSuccess(res, result.items, 'Quizzes retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getQuizDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
      const isStudent = req.user?.role === 'STUDENT';

      const data = await quizService.getQuizDetails(id, req.tenantId, isSuperAdmin, isStudent);
      return sendSuccess(res, data, 'Quiz details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) {
        throw new BadRequestError('Tenant context is required to create a quiz');
      }

      const quiz = await quizService.createQuiz(req.body, req.tenantId);
      return sendCreated(res, quiz, 'Quiz created successfully');
    } catch (error) {
      next(error);
    }
  }

  async addQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) {
        throw new BadRequestError('Tenant context is required to add questions');
      }

      const { id } = req.params;
      const question = await quizService.addQuestion(id, req.body, req.tenantId);
      return sendCreated(res, question, 'Question added successfully');
    } catch (error) {
      next(error);
    }
  }

  async submitQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) {
        throw new BadRequestError('Tenant context is required to submit a quiz');
      }

      const { id } = req.params;
      const studentId = req.user?.userId || '';
      const result = await quizService.submitQuiz(id, req.body.answers, studentId, req.tenantId);

      return sendSuccess(res, result, 'Quiz evaluated and graded successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAttempts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
      const studentId = req.user?.role === 'STUDENT' ? req.user.userId : (req.query.studentId as string);

      const attempts = await quizService.getAttempts(id, studentId, req.tenantId, isSuperAdmin);
      return sendSuccess(res, attempts, 'Quiz attempts retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getAllAttempts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
      const attempts = await quizService.getAllAttempts(req.tenantId, isSuperAdmin);
      return sendSuccess(res, attempts, 'All tenant quiz attempts retrieved for grading center');
    } catch (error) {
      next(error);
    }
  }
}

export const quizController = new QuizController();
