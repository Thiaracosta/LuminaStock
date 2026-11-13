import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },  // Ramp-up: sobe para 5 usuarios em 10s
    { duration: '15s', target: 5 },  // Plato: mantem 5 usuarios simultaneos por 15s
    { duration: '5s', target: 0 },   // Ramp-down: desce para 0 em 5s
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const resHealth = http.get(`${BASE_URL}/health`);
  check(resHealth, {
    'GET /health status 200': (r) => r.status === 200,
  });

  const resProd = http.get(`${BASE_URL}/produtos`);
  check(resProd, {
    'GET /produtos status 200': (r) => r.status === 200,
  });

  const resPed = http.get(`${BASE_URL}/pedidos`);
  check(resPed, {
    'GET /pedidos status 200': (r) => r.status === 200,
  });

  sleep(1);
}
