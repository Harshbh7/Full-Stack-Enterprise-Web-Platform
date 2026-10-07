import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.util.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, tenantSlug } = req.body;
      const userAgent = req.header('user-agent');
      const ipAddress = req.ip;

      const result = await authService.login(email, password, tenantSlug, userAgent, ipAddress);

      // Set HTTP-Only Cookie for Refresh Token
      res.cookie('edusphere_refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return sendSuccess(
        res,
        {
          accessToken: result.accessToken,
          user: result.user,
          tenant: result.tenant,
        },
        'Authentication successful'
      );
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.edusphere_refresh_token || req.body?.refreshToken;
      const userAgent = req.header('user-agent');
      const ipAddress = req.ip;

      const result = await authService.rotateRefreshToken(refreshToken, userAgent, ipAddress);

      // Rotate cookie
      res.cookie('edusphere_refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, { accessToken: result.accessToken }, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.edusphere_refresh_token;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      res.clearCookie('edusphere_refresh_token');
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthenticated' });
      }
      const data = await authService.getCurrentUser(req.user.userId);
      return sendSuccess(res, data, 'User profile retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
