import { courseRepository } from '../repositories/course.repository.js';
import { cacheService } from './cache.service.js';
import { Module, IModule } from '../models/Module.js';
import { Lesson, ILesson } from '../models/Lesson.js';
import { Course, ICourse } from '../models/Course.js';
import { Enrollment, IEnrollment } from '../models/Enrollment.js';
import { NotFoundError, BadRequestError } from '../utils/errors.util.js';
import { PaginationOptions, PaginatedResult } from '../repositories/base.repository.js';
import { Types } from 'mongoose';

export interface CourseFilter {
  search?: string;
  category?: string;
  status?: string;
}

export class CourseService {
  async listCourses(
    tenantId: string | undefined,
    isSuperAdmin: boolean,
    filters: CourseFilter,
    options: PaginationOptions
  ): Promise<PaginatedResult<ICourse>> {
    return courseRepository.searchCourses(
      filters.search || '',
      filters.category || '',
      tenantId,
      isSuperAdmin,
      options
    );
  }

  async getCourseDetails(
    identifier: string,
    tenantId: string | undefined,
    isSuperAdmin: boolean
  ) {
    // STRICT TENANT ISOLATION: supports lookup by ObjectId or unique course Code
    const course = await courseRepository.findByCodeOrId(
      identifier,
      tenantId,
      isSuperAdmin
    );

    if (!course) {
      throw new NotFoundError(`Course "${identifier}" not found`);
    }

    const [modules, lessons] = await Promise.all([
      Module.find({ courseId: course._id }).sort({ order: 1 }).lean().exec(),
      Lesson.find({ courseId: course._id }).sort({ order: 1 }).lean().exec(),
    ]);

    const curriculum = modules.map((mod) => ({
      ...mod,
      lessons: lessons.filter((l) => l.moduleId.toString() === mod._id.toString()),
    }));

    return {
      course,
      curriculum,
    };
  }

  async createCourse(
    courseData: {
      title: string;
      code: string;
      description?: string;
      category?: string;
      level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    },
    tenantId: string,
    instructorId: string
  ): Promise<ICourse> {
    const slug = `${courseData.code.toLowerCase()}-${courseData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const newCourse = await courseRepository.create({
      tenantId: tenantId as any,
      instructorId: instructorId as any,
      title: courseData.title,
      code: courseData.code,
      slug,
      description: courseData.description || '',
      category: courseData.category || 'Web Engineering',
      level: courseData.level || 'INTERMEDIATE',
      status: 'PUBLISHED',
    });

    // Invalidate cached courses for this tenant
    await cacheService.invalidateTenantResource(tenantId, 'courses');

    return newCourse;
  }

  async updateCourse(
    courseId: string,
    updateData: Partial<ICourse>,
    tenantId: string | undefined,
    isSuperAdmin: boolean
  ): Promise<ICourse> {
    const updated = await courseRepository.update(courseId, updateData, tenantId, isSuperAdmin);
    if (!updated) {
      throw new NotFoundError('Course not found');
    }

    if (tenantId) {
      await cacheService.invalidateTenantResource(tenantId, 'courses');
      await cacheService.invalidateTenantResource(tenantId, 'course-details');
    }

    return updated;
  }

  async deleteCourse(
    courseId: string,
    tenantId: string | undefined,
    isSuperAdmin: boolean
  ): Promise<boolean> {
    const deleted = await courseRepository.delete(courseId, tenantId, isSuperAdmin);
    if (!deleted) {
      throw new NotFoundError('Course not found');
    }

    if (tenantId) {
      await cacheService.invalidateTenantResource(tenantId, 'courses');
      await cacheService.invalidateTenantResource(tenantId, 'course-details');
    }

    return deleted;
  }

  /**
   * Adds a new Module / Unit to a course syllabus
   */
  async addModule(
    courseIdentifier: string,
    data: { title: string; description?: string; order?: number },
    tenantId: string,
    isSuperAdmin = false
  ): Promise<IModule> {
    const course = await courseRepository.findByCodeOrId(courseIdentifier, tenantId, isSuperAdmin);
    if (!course) {
      throw new NotFoundError(`Course "${courseIdentifier}" not found`);
    }

    let order = data.order;
    if (!order) {
      const existingCount = await Module.countDocuments({ courseId: course._id });
      order = existingCount + 1;
    }

    const module = await Module.create({
      tenantId: course.tenantId,
      courseId: course._id,
      title: data.title.trim(),
      description: data.description,
      order,
    });

    await cacheService.invalidateTenantResource(tenantId, 'courses');
    await cacheService.invalidateTenantResource(tenantId, 'course-details');

    return module;
  }

  /**
   * Adds a new Lesson / Topic under a specific syllabus module
   */
  async addLesson(
    courseIdentifier: string,
    moduleId: string,
    data: {
      title: string;
      contentType?: 'VIDEO' | 'MARKDOWN' | 'PDF' | 'AUDIO';
      contentUrl?: string;
      textContent?: string;
      durationSeconds?: number;
      isFreePreview?: boolean;
      order?: number;
    },
    tenantId: string,
    isSuperAdmin = false
  ): Promise<ILesson> {
    const course = await courseRepository.findByCodeOrId(courseIdentifier, tenantId, isSuperAdmin);
    if (!course) {
      throw new NotFoundError(`Course "${courseIdentifier}" not found`);
    }

    const module = await Module.findOne({
      _id: new Types.ObjectId(moduleId),
      courseId: course._id,
    });
    if (!module) {
      throw new NotFoundError(`Module "${moduleId}" not found in course`);
    }

    let order = data.order;
    if (!order) {
      const existingLessons = await Lesson.countDocuments({ moduleId: module._id });
      order = existingLessons + 1;
    }

    const lesson = await Lesson.create({
      tenantId: course.tenantId,
      courseId: course._id,
      moduleId: module._id,
      title: data.title.trim(),
      contentType: data.contentType || 'VIDEO',
      contentUrl: data.contentUrl,
      textContent: data.textContent,
      durationSeconds: data.durationSeconds || 600,
      isFreePreview: !!data.isFreePreview,
      order,
    });

    await cacheService.invalidateTenantResource(tenantId, 'courses');
    await cacheService.invalidateTenantResource(tenantId, 'course-details');

    return lesson;
  }

  /**
   * Batch adds a full syllabus unit (Module + Topic Lessons)
   */
  async addSyllabus(
    courseIdentifier: string,
    data: {
      moduleTitle: string;
      moduleDescription?: string;
      lessons?: Array<{
        title: string;
        textContent?: string;
        durationMinutes?: number;
        contentUrl?: string;
      }>;
    },
    tenantId: string,
    isSuperAdmin = false
  ) {
    const course = await courseRepository.findByCodeOrId(courseIdentifier, tenantId, isSuperAdmin);
    if (!course) {
      throw new NotFoundError(`Course "${courseIdentifier}" not found`);
    }

    const existingCount = await Module.countDocuments({ courseId: course._id });
    const module = await Module.create({
      tenantId: course.tenantId,
      courseId: course._id,
      title: data.moduleTitle.trim(),
      description: data.moduleDescription,
      order: existingCount + 1,
    });

    if (data.lessons && data.lessons.length > 0) {
      let lessonOrder = 1;
      for (const l of data.lessons) {
        await Lesson.create({
          tenantId: course.tenantId,
          courseId: course._id,
          moduleId: module._id,
          title: l.title.trim(),
          textContent: l.textContent || '',
          contentUrl: l.contentUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          contentType: 'VIDEO',
          durationSeconds: (l.durationMinutes || 15) * 60,
          order: lessonOrder++,
        });
      }
    }

    await cacheService.invalidateTenantResource(tenantId, 'courses');
    await cacheService.invalidateTenantResource(tenantId, 'course-details');

    return this.getCourseDetails(course._id.toString(), tenantId, isSuperAdmin);
  }

  async enrollStudent(
    courseIdentifier: string,
    studentId: string,
    tenantId: string
  ): Promise<IEnrollment> {
    const course = await courseRepository.findByCodeOrId(courseIdentifier, tenantId, false);
    if (!course) {
      throw new NotFoundError(`Course "${courseIdentifier}" not found`);
    }

    let enrollment = await Enrollment.findOne({
      tenantId: new Types.ObjectId(tenantId),
      studentId: new Types.ObjectId(studentId),
      courseId: course._id,
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        tenantId: new Types.ObjectId(tenantId),
        studentId: new Types.ObjectId(studentId),
        courseId: course._id,
        status: 'ACTIVE',
        progressPercentage: 0,
      });

      await Course.findByIdAndUpdate(course._id, { $inc: { enrolledCount: 1 } });
      await cacheService.invalidateTenantResource(tenantId, 'courses');
    }

    return enrollment;
  }

  async getMyEnrollments(
    studentId: string,
    tenantId: string
  ): Promise<any[]> {
    const enrollments = await Enrollment.find({
      tenantId: new Types.ObjectId(tenantId),
      studentId: new Types.ObjectId(studentId),
    })
      .populate('courseId', 'title code category level thumbnail enrolledCount')
      .lean()
      .exec();

    return enrollments;
  }

  async updateProgress(
    courseIdentifier: string,
    studentId: string,
    tenantId: string,
    progressPercentage: number
  ): Promise<IEnrollment> {
    const course = await courseRepository.findByCodeOrId(courseIdentifier, tenantId, false);
    if (!course) {
      throw new NotFoundError(`Course "${courseIdentifier}" not found`);
    }

    const cappedProgress = Math.min(100, Math.max(0, progressPercentage));
    const enrollment = await Enrollment.findOneAndUpdate(
      {
        tenantId: new Types.ObjectId(tenantId),
        studentId: new Types.ObjectId(studentId),
        courseId: course._id,
      },
      {
        progressPercentage: cappedProgress,
        lastAccessedAt: new Date(),
        ...(cappedProgress >= 100 ? { status: 'COMPLETED', completedAt: new Date() } : { status: 'ACTIVE' }),
      },
      { new: true, upsert: true }
    );

    return enrollment;
  }
}

export const courseService = new CourseService();
