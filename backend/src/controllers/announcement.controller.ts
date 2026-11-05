import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { announcementService } from '../services/announcement.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination.util.js';
import { BadRequestError } from '../utils/errors.util.js';

export class AnnouncementController {
  async listAnnouncements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
      const courseId = req.query.courseId as string | undefined;
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

      const result = await announcementService.listAnnouncements(
        req.tenantId,
        isSuperAdmin,
        courseId,
        { page, limit, skip, sortBy, sortOrder }
      );

      const meta = buildPaginationMeta(result.total, page, limit);
      return sendSuccess(res, result.items, 'Announcements retrieved', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async createAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.tenantId) {
        throw new BadRequestError('Tenant context is required to create an announcement');
      }

      const { title, content, priority, courseId } = req.body;
      const announcement = await announcementService.createAnnouncement(
        { title, content, priority, courseId },
        req.tenantId,
        req.user?.userId || ''
      );

      return sendCreated(res, announcement, 'Announcement posted successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
      await announcementService.deleteAnnouncement(id, req.tenantId, isSuperAdmin);
      return sendSuccess(res, null, 'Announcement deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const announcementController = new AnnouncementController();
