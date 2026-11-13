import request from 'supertest';
import { app } from '../../src/server';
import { prisma } from '../../src/prisma';

jest.mock('../../src/prisma', () => ({
  prisma: {
    produto: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
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

  describe('PATCH /produtos/:id/estoque-preco', () => {
    it('deve adicionar estoque e atualizar preco via query params com sucesso (200)', async () => {
      (prisma.produto.findUnique as jest.Mock).mockResolvedValue({
        id: 'p1',
        nome: 'Filamento PLA',
        preco: 120,
        quantidade: 5,
      });
      const mockAtualizado = { id: 'p1', nome: 'Filamento PLA', preco: 135.5, quantidade: 15 };
      (prisma.produto.update as jest.Mock).mockResolvedValue(mockAtualizado);

      const res = await request(app)
        .patch('/produtos/p1/estoque-preco?quantidadeAdicionar=10&preco=135.5');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockAtualizado);
      expect(prisma.produto.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: {
          quantidade: { increment: 10 },
          preco: 135.5,
        },
      });
    });

    it('deve atualizar apenas a quantidade quando preco nao for informado (200)', async () => {
      (prisma.produto.findUnique as jest.Mock).mockResolvedValue({ id: 'p1', quantidade: 5 });
      (prisma.produto.update as jest.Mock).mockResolvedValue({ id: 'p1', quantidade: 8 });

      const res = await request(app)
        .patch('/produtos/p1/estoque-preco?quantidadeAdicionar=3&preco=');

      expect(res.status).toBe(200);
    });

    it('deve atualizar apenas o preco via body quando quantidadeAdicionar nao for informada (200)', async () => {
      (prisma.produto.findUnique as jest.Mock).mockResolvedValue({ id: 'p1', preco: 100 });
      (prisma.produto.update as jest.Mock).mockResolvedValue({ id: 'p1', preco: 110 });

      const res = await request(app)
        .patch('/produtos/p1/estoque-preco?quantidadeAdicionar=')
        .send({ preco: 110 });

      expect(res.status).toBe(200);
    });

    it('deve retornar 400 se nenhum parametro for enviado ou se valores forem invalidos', async () => {
      const resVazio = await request(app).patch('/produtos/p1/estoque-preco');
      expect(resVazio.status).toBe(400);

      const resInvalido = await request(app).patch('/produtos/p1/estoque-preco?quantidadeAdicionar=-5');
      expect(resInvalido.status).toBe(400);
    });

    it('deve retornar 404 se o produto nao existir', async () => {
      (prisma.produto.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).patch('/produtos/id-inexistente/estoque-preco?preco=99.9');
      expect(res.status).toBe(404);
      expect(res.body.erro).toBe('Produto não encontrado');
    });

    it('deve retornar 500 se o banco falhar ao atualizar estoque/preco', async () => {
      (prisma.produto.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const res = await request(app).patch('/produtos/p1/estoque-preco?quantidadeAdicionar=5');
      expect(res.status).toBe(500);
      expect(res.body.erro).toBe('Erro interno ao atualizar o produto');
    });
  });
});