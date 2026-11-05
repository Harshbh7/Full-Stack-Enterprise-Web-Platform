import { announcementRepository } from '../repositories/announcement.repository.js';
import { IAnnouncement } from '../models/Announcement.js';
import { cacheService } from './cache.service.js';
import { emitToTenant } from '../sockets/socket.server.js';
import { NotFoundError } from '../utils/errors.util.js';
import { PaginationOptions, PaginatedResult } from '../repositories/base.repository.js';

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  courseId?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
}

export class AnnouncementService {
  async listAnnouncements(
    tenantId: string | undefined,
    isSuperAdmin: boolean,
    courseId?: string,
    options: PaginationOptions = { page: 1, limit: 10, skip: 0 }
  ): Promise<PaginatedResult<IAnnouncement>> {
    return announcementRepository.findAnnouncements(
      tenantId,
      isSuperAdmin,
      courseId,
      options
    );
  }

  async createAnnouncement(
    input: CreateAnnouncementInput,
    tenantId: string,
    authorId: string
  ): Promise<IAnnouncement> {
    const announcement = await announcementRepository.create({
      tenantId: tenantId as any,
      authorId: authorId as any,
      courseId: input.courseId as any,
      title: input.title.trim(),
      content: input.content.trim(),
      priority: input.priority || 'NORMAL',
    });

    // Invalidate tenant announcement cache
    await cacheService.invalidateTenantResource(tenantId, 'announcements');

    // Broadcast live WebSocket event to all connected users in this tenant
    try {
      emitToTenant(tenantId, 'announcement:new', {
        id: announcement._id,
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        courseId: announcement.courseId,
        createdAt: announcement.createdAt,
      });
    } catch {
      // Non-fatal if socket server not yet running in test harness
    }

    return announcement;
  }

  async deleteAnnouncement(
    id: string,
    tenantId: string | undefined,
    isSuperAdmin: boolean
  ): Promise<boolean> {
    const deleted = await announcementRepository.delete(id, tenantId, isSuperAdmin);
    if (!deleted) {
      throw new NotFoundError('Announcement not found');
    }

    if (tenantId) {
      await cacheService.invalidateTenantResource(tenantId, 'announcements');
    }

    return deleted;
  }
}

export const announcementService = new AnnouncementService();
