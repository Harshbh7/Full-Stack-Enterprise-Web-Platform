import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Options: 3-stage ramp up simulating 50 to 100 Virtual Users
export const options = {
  stages: [
    { duration: '10s', target: 20 },  // Warm-up ramp to 20 users
    { duration: '30s', target: 50 },  // Sustained load at 50 users
    { duration: '20s', target: 100 }, // Concurrency spike at 100 users
    { duration: '10s', target: 0 },   // Cool-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<150', 'p(99)<300'], // 95% of requests under 150ms
    http_req_failed: ['rate<0.01'],                 // Error rate < 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api/v1';

export default function () {
  const payload = JSON.stringify({
    email: 'admin@apex.edu',
    password: 'Password123!',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': '507f1f77bcf86cd799439011',
    },
  };

  // 1. User Login Request
  const loginRes = http.post(`${BASE_URL}/auth/login`, payload, params);

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'access token returned': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.accessToken !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  sleep(1);
}

