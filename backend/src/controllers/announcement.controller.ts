import { Response, NextFunction } from 'express';
import { Announcement } from '../models/Announcement.js';
import { AuthenticatedRequest } from '../types/index.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export class AnnouncementController {
  async listAnnouncements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filter: Record<string, unknown> = {};
      if (req.user?.role !== 'SUPER_ADMIN' && req.tenantId) {
        filter.tenantId = req.tenantId;
      }

      const items = await Announcement.find(filter)
        .populate('authorId', 'firstName lastName role avatarUrl')
        .sort({ createdAt: -1 })
        .limit(20);

      return sendSuccess(res, items, 'Announcements retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, content, priority, courseId } = req.body;
      const announcement = await Announcement.create({
        tenantId: req.tenantId,
        authorId: req.user?.userId,
        title,
        content,
        priority: priority || 'NORMAL',
        courseId: courseId || undefined,
      });

      return sendCreated(res, announcement, 'Announcement posted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const announcementController = new AnnouncementController();
