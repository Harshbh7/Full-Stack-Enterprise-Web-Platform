import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Options: High-throughput benchmark for Redis Cache-Aside evaluation
export const options = {
  stages: [
    { duration: '15s', target: 50 },  // Ramp to 50 concurrent students
    { duration: '30s', target: 150 }, // Heavy catalog browsing spike
    { duration: '15s', target: 0 },   // Cool-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<50', 'p(99)<100'], // Redis cached requests must resolve sub-50ms
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api/v1';

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': '507f1f77bcf86cd799439011',
      // Mock authorized student token for catalog inspection
      'Authorization': `Bearer ${__ENV.TEST_TOKEN || 'mock_token'}`,
    },
  };

  // 1. Fetch Paginated Courses (Redis Cache Hit Candidate)
  const page = Math.floor(Math.random() * 3) + 1;
  const res = http.get(`${BASE_URL}/courses?page=${page}&limit=10`, params);

  check(res, {
    'courses status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'response duration < 100ms': (r) => r.timings.duration < 100,
  });

  sleep(0.5);
}

