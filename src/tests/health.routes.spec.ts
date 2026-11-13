import request from 'supertest';
import { app } from '../server';
import { prisma } from '../prisma';

// Mock apontando para ../prisma (sem o /lib)
jest.mock('../prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

describe('Rota de Health Check (GET /health)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 200 e status UP quando o banco de dados estiver conectado', async () => {
    // Simula que o SELECT 1 no banco funcionou
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ '?column?': 1 }]);

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'UP');
    expect(response.body).toHaveProperty('database', 'connected');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('deve retornar 503 e status DOWN quando o banco de dados falhar', async () => {
    // Simula uma queda de conexão no banco de dados
    (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('Falha de conexao'));

    const response = await request(app).get('/health');

    expect(response.status).toBe(503);
    expect(response.body).toHaveProperty('status', 'DOWN');
    expect(response.body).toHaveProperty('database', 'disconnected');
    expect(response.body).toHaveProperty('error', 'Falha de conexao');
  });
});