import { Response, NextFunction } from 'express';
import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { AuthenticatedRequest } from '../types/index.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination.util.js';
import { NotFoundError } from '../utils/errors.util.js';

export class CourseController {
  async listCourses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
      const search = (req.query.search as string) || '';
      const category = (req.query.category as string) || '';

      const filter: Record<string, unknown> = {};
      if (req.user?.role !== 'SUPER_ADMIN' && req.tenantId) {
        filter.tenantId = req.tenantId;
      }
      if (category) {
        filter.category = category;
      }
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const [items, total] = await Promise.all([
        Course.find(filter)
          .populate('instructorId', 'firstName lastName email avatarUrl')
          .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limit),
        Course.countDocuments(filter),
      ]);

      const meta = buildPaginationMeta(total, page, limit);
      return sendSuccess(res, items, 'Courses retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getCourseDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const course = await Course.findById(id).populate('instructorId', 'firstName lastName email avatarUrl');
      if (!course) throw new NotFoundError('Course not found');

      const modules = await Module.find({ courseId: course._id }).sort({ order: 1 });
      const lessons = await Lesson.find({ courseId: course._id }).sort({ order: 1 });

      const curriculum = modules.map((mod) => ({
        ...mod.toObject(),
        lessons: lessons.filter((l) => l.moduleId.toString() === mod._id.toString()),
      }));

      return sendSuccess(
        res,
        {
          course,
          curriculum,
        },
        'Course details retrieved'
      );
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, code, description, category, level } = req.body;
      const slug = `${code.toLowerCase()}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      const course = await Course.create({
        tenantId: req.tenantId,
        instructorId: req.user?.userId,
        title,
        code,
        slug,
        description,
        category: category || 'Web Engineering',
        level: level || 'INTERMEDIATE',
        status: 'PUBLISHED',
      });

      return sendCreated(res, course, 'Course created successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const courseController = new CourseController();
