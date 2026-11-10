import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {

  const resProdutos = http.get(`${BASE_URL}/produtos`);
  check(resProdutos, {
    'GET /produtos status 200': (r) => r.status === 200,
  });


  const resPedidos = http.get(`${BASE_URL}/pedidos`);
  check(resPedidos, {
    'GET /pedidos status 200': (r) => r.status === 200,
  });

  sleep(1);
}