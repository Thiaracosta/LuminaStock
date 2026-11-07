import request from 'supertest';
import { app } from '../../src/server';
import { prisma } from '../../src/prisma';

jest.mock('../../src/prisma', () => ({
  prisma: {
    produto: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('Rotas de Produtos (/produtos) e Health Check', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET / (Health Check)', () => {
    it('deve retornar status ok na rota raiz', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /produtos', () => {
    it('deve cadastrar um produto com sucesso (201)', async () => {
      const mockProduto = { id: 'p1', nome: 'Filamento PLA Silk', preco: 120, quantidade: 5 };
      (prisma.produto.create as jest.Mock).mockResolvedValue(mockProduto);

      const res = await request(app)
        .post('/produtos')
        .send({ nome: 'Filamento PLA Silk', preco: 120, quantidade: 5 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockProduto);
    });

    it('deve retornar 400 se os dados forem inválidos', async () => {
      const res = await request(app)
        .post('/produtos')
        .send({ nome: '', preco: -10 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
    });

    it('deve retornar 500 se o banco falhar ao cadastrar', async () => {
      (prisma.produto.create as jest.Mock).mockRejectedValue(new Error('Falha no DB'));

      const res = await request(app)
        .post('/produtos')
        .send({ nome: 'Filamento PLA', preco: 120, quantidade: 5 });

      expect(res.status).toBe(500);
      expect(res.body.erro).toBe('Erro interno ao cadastrar o produto');
    });
  });

  describe('GET /produtos', () => {
    it('deve listar todos os produtos (200)', async () => {
      const lista = [{ id: 'p1', nome: 'Filamento PLA', preco: 120, quantidade: 5 }];
      (prisma.produto.findMany as jest.Mock).mockResolvedValue(lista);

      const res = await request(app).get('/produtos');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(lista);
    });

    it('deve retornar 500 se o banco falhar ao listar', async () => {
      (prisma.produto.findMany as jest.Mock).mockRejectedValue(new Error('Falha no DB'));

      const res = await request(app).get('/produtos');
      expect(res.status).toBe(500);
      expect(res.body.erro).toBe('Erro interno ao listar os produtos');
    });
  });
});