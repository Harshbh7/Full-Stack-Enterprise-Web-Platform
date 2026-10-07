import { env } from './env.js';

export const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) return true; // Allow mobile apps, curl, server-to-server, and Postman
  if (origin === env.CLIENT_URL) return true;
  // Allow all local development origins across any dynamic port
  if (/^http:\/\/localhost:[0-9]+$/.test(origin)) return true;
  if (/^http:\/\/127\.0\.0\.1:[0-9]+$/.test(origin)) return true;
  return false;
};

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin [${origin}] not permitted by EduSphere CORS policy.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
};
