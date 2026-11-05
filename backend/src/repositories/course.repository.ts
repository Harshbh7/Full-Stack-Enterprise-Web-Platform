import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository.js';
import { Course, ICourse } from '../models/Course.js';
import { Module, IModule } from '../models/Module.js';
import { Lesson, ILesson } from '../models/Lesson.js';
import { FilterQuery, Types } from 'mongoose';

export class CourseRepository extends BaseRepository<ICourse> {
  constructor() {
    super(Course, true);
  }

  async searchCourses(
    search: string,
    category: string,
    tenantId: string | undefined,
    isSuperAdmin: boolean,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<ICourse>> {
    const filter: FilterQuery<ICourse> = {};

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

    return this.findPaginated(
      filter,
      tenantId,
      isSuperAdmin,
      pagination,
      ['instructorId']
    );
  }

  async findByCodeOrId(
    identifier: string,
    tenantId?: string,
    isSuperAdmin = false
  ): Promise<ICourse | null> {
    if (Types.ObjectId.isValid(identifier)) {
      const byId = await this.findById(identifier, tenantId, isSuperAdmin, 'instructorId');
      if (byId) return byId;
    }

    const filter: FilterQuery<ICourse> = { code: identifier.toUpperCase().trim() };
    return this.findOne(filter, tenantId, isSuperAdmin, 'instructorId');
  }

  async getCurriculum(courseId: string | Types.ObjectId) {
    const [modules, lessons] = await Promise.all([
      Module.find({ courseId }).sort({ order: 1 }).lean().exec(),
      Lesson.find({ courseId }).sort({ order: 1 }).lean().exec(),
    ]);

    return modules.map((mod) => ({
      ...mod,
      lessons: lessons.filter((l) => l.moduleId.toString() === mod._id.toString()),
    }));
  }
}

export const courseRepository = new CourseRepository();
