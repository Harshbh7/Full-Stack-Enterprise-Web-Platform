import { Types, FilterQuery } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository.js';
import { Announcement, IAnnouncement } from '../models/Announcement.js';

export class AnnouncementRepository extends BaseRepository<IAnnouncement> {
  constructor() {
    super(Announcement, true);
  }

  async findAnnouncements(
    tenantId: string | undefined,
    isSuperAdmin: boolean,
    courseId?: string,
    options: PaginationOptions = { page: 1, limit: 10, skip: 0 }
  ): Promise<PaginatedResult<IAnnouncement>> {
    const filter: FilterQuery<IAnnouncement> = {};
    if (courseId && Types.ObjectId.isValid(courseId)) {
      filter.courseId = new Types.ObjectId(courseId);
    }

    return this.findPaginated(
      filter,
      tenantId,
      isSuperAdmin,
      { ...options, sortBy: 'createdAt', sortOrder: 'desc' },
      ['authorId', 'courseId']
    );
  }
}

export const announcementRepository = new AnnouncementRepository();
