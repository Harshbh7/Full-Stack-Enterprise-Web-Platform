import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { courseService } from '../services/course.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination.util.js';
import { BadRequestError } from '../utils/errors.util.js';

export class CourseController {
  async listCourses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
      const search = (req.query.search as string) || '';
      const category = (req.query.category as string) || '';
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

      const result = await courseService.listCourses(
        req.tenantId,
        isSuperAdmin,
        { search, category },
        { page, limit, skip, sortBy, sortOrder }
      );

      const meta = buildPaginationMeta(result.total, page, limit);
      return sendSuccess(res, result.items, 'Courses retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getCourseDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

      // Enforces strict tenant isolation and prevents IDOR
      const data = await courseService.getCourseDetails(id, req.tenantId, isSuperAdmin);
      return sendSuccess(res, data, 'Course details and syllabus retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) {
        throw new BadRequestError('Tenant context is required to create a course');
      }

      const { title, code, description, category, level } = req.body;
      const course = await courseService.createCourse(
        { title, code, description, category, level },
        req.tenantId,
        req.user?.userId || ''
      );

      return sendCreated(res, course, 'Course created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
      const updated = await courseService.updateCourse(id, req.body, req.tenantId, isSuperAdmin);
      return sendSuccess(res, updated, 'Course updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
      await courseService.deleteCourse(id, req.tenantId, isSuperAdmin);
      return sendSuccess(res, null, 'Course deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async addModule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) {
        throw new BadRequestError('Tenant context is required');
      }
      const { id } = req.params;
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
      const module = await courseService.addModule(id, req.body, req.tenantId, isSuperAdmin);
      return sendCreated(res, module, 'Module added to course syllabus');
    } catch (error) {
      next(error);
    }
  }

  async addLesson(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) {
        throw new BadRequestError('Tenant context is required');
      }
      const { id, moduleId } = req.params;
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
      const lesson = await courseService.addLesson(id, moduleId, req.body, req.tenantId, isSuperAdmin);
      return sendCreated(res, lesson, 'Lesson added to syllabus module');
    } catch (error) {
      next(error);
    }
  }

  async addSyllabus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) {
        throw new BadRequestError('Tenant context is required');
      }
      const { id } = req.params;
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
      const result = await courseService.addSyllabus(id, req.body, req.tenantId, isSuperAdmin);
      return sendCreated(res, result, 'Syllabus unit and lessons added successfully');
    } catch (error) {
      next(error);
    }
  }

  async enroll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId || !req.user?.userId) {
        throw new BadRequestError('Authentication and tenant context required');
      }
      const { id } = req.params;
      const enrollment = await courseService.enrollStudent(id, req.user.userId, req.tenantId);
      return sendCreated(res, enrollment, 'Successfully enrolled in course');
    } catch (error) {
      next(error);
    }
  }

  async getMyEnrollments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId || !req.user?.userId) {
        throw new BadRequestError('Authentication and tenant context required');
      }
      const enrollments = await courseService.getMyEnrollments(req.user.userId, req.tenantId);
      return sendSuccess(res, enrollments, 'Student enrollments retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId || !req.user?.userId) {
        throw new BadRequestError('Authentication and tenant context required');
      }
      const { id } = req.params;
      const { progressPercentage } = req.body;
      const enrollment = await courseService.updateProgress(
        id,
        req.user.userId,
        req.tenantId,
        Number(progressPercentage) || 0
      );
      return sendSuccess(res, enrollment, 'Course progress updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const courseController = new CourseController();
