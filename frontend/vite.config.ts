import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function apiSyncPlugin(): Plugin {
  const syncFile = path.resolve(__dirname, '.sync_users.json');

  const getSyncUsers = () => {
    try {
      if (fs.existsSync(syncFile)) {
        const raw = fs.readFileSync(syncFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    const initial = [
      {
        id: 'usr-lpu-anuj',
        name: 'Anuj Bhardwaj',
        firstName: 'Anuj',
        lastName: 'Bhardwaj',
        email: 'anuj123@gmail.com',
        role: 'INSTRUCTOR',
        requestedRole: 'INSTRUCTOR',
        status: 'PENDING_VERIFICATION',
        tenantSlug: 'lpu',
        authProvider: 'GOOGLE',
        requestedAt: '2026-11-05T08:20:00.000Z',
        verifierRole: 'TENANT_ADMIN',
      },
    ];
    try {
      fs.writeFileSync(syncFile, JSON.stringify(initial, null, 2), 'utf-8');
    } catch {}
    return initial;
  };

  const saveSyncUsers = (users: any[]) => {
    try {
      fs.writeFileSync(syncFile, JSON.stringify(users, null, 2), 'utf-8');
    } catch {}
  };

  return {
    name: 'api-sync-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/v1/')) {
          return next();
        }

        // GET /api/v1/users/pending
        if (req.method === 'GET' && req.url.startsWith('/api/v1/users/pending')) {
          const users = getSyncUsers();
          const pending = users.filter((u: any) => u.status === 'PENDING_VERIFICATION');
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ success: true, data: pending }));
        }

        // POST /api/v1/auth/sso/google
        if (req.method === 'POST' && req.url.startsWith('/api/v1/auth/sso/google')) {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const cleanEmail = (data.email || '').toLowerCase().trim();
              const users = getSyncUsers();
              let matched = users.find((u: any) => u.email.toLowerCase() === cleanEmail);

              if (data.requestedRole) {
                // Registration request
                if (!matched) {
                  matched = {
                    id: `usr-sso-${Date.now().toString(36)}`,
                    name: data.name || cleanEmail.split('@')[0],
                    firstName: (data.name || '').split(' ')[0] || 'User',
                    lastName: (data.name || '').split(' ').slice(1).join(' ') || '',
                    email: cleanEmail,
                    role: data.requestedRole,
                    requestedRole: data.requestedRole,
                    status: 'PENDING_VERIFICATION',
                    tenantSlug: data.tenantSlug || 'lpu',
                    verifierRole: data.requestedRole === 'TENANT_ADMIN' ? 'SUPER_ADMIN' : 'TENANT_ADMIN',
                    requestedAt: new Date().toISOString(),
                  };
                  users.unshift(matched);
                } else {
                  matched.status = 'PENDING_VERIFICATION';
                  matched.requestedRole = data.requestedRole;
                  matched.role = data.requestedRole;
                  matched.tenantSlug = data.tenantSlug || 'lpu';
                }
                saveSyncUsers(users);

                res.setHeader('Content-Type', 'application/json');
                return res.end(
                  JSON.stringify({
                    success: true,
                    data: { isPending: true, user: matched },
                  })
                );
              }

              // Login / Status check
              if (matched) {
                res.setHeader('Content-Type', 'application/json');
                return res.end(
                  JSON.stringify({
                    success: true,
                    data: {
                      isPending: matched.status === 'PENDING_VERIFICATION',
                      user: matched,
                      accessToken: `token-${matched.id}-${Date.now()}`,
                      tenant: {
                        id: matched.tenantSlug,
                        slug: matched.tenantSlug,
                        name:
                          matched.tenantSlug === 'lpu'
                            ? 'Lovely Professional University'
                            : 'Apex University',
                        status: 'ACTIVE',
                      },
                    },
                  })
                );
              }

              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: false, message: 'No registered account found' }));
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: false, message: 'Invalid payload' }));
            }
          });
          return;
        }

        // POST /api/v1/users/:id/approve
        if (req.method === 'POST' && req.url.includes('/approve')) {
          const parts = req.url.split('?')[0].split('/');
          const idOrEmail = decodeURIComponent(parts[parts.indexOf('approve') - 1] || '');
          const users = getSyncUsers();
          const target = users.find(
            (u: any) => u.id === idOrEmail || u.email.toLowerCase() === idOrEmail.toLowerCase()
          );
          if (target) {
            target.status = 'ACTIVE';
            saveSyncUsers(users);
          }
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ success: true, data: target }));
        }

        // POST /api/v1/users/:id/reject
        if (req.method === 'POST' && req.url.includes('/reject')) {
          const parts = req.url.split('?')[0].split('/');
          const idOrEmail = decodeURIComponent(parts[parts.indexOf('reject') - 1] || '');
          const users = getSyncUsers();
          const target = users.find(
            (u: any) => u.id === idOrEmail || u.email.toLowerCase() === idOrEmail.toLowerCase()
          );
          if (target) {
            target.status = 'REJECTED';
            saveSyncUsers(users);
          }
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ success: true, data: target }));
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiSyncPlugin()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react-redux', '@reduxjs/toolkit'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
  },
});
