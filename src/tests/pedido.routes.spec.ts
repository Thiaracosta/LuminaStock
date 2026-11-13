import request from 'supertest';
import { app } from '../../src/server';
import { prisma } from '../../src/prisma';

jest.mock('../../src/prisma', () => ({
  prisma: {
    produto: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    pedido: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('Rotas de Pedidos (/pedidos)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /pedidos', () => {
    it('deve criar pedido e baixar estoque com sucesso (201)', async () => {
      (prisma.produto.findUnique as jest.Mock).mockResolvedValue({
        id: 'p1',
        nome: 'Chaveiro 3D',
        preco: 15,
        quantidade: 10,
      });
      const mockPedido = { id: 'ped1', produtoId: 'p1', quantidade: 3, status: 'EM_PREPARACAO' };
      (prisma.$transaction as jest.Mock).mockResolvedValue([mockPedido, {}]);

      const res = await request(app)
        .post('/pedidos')
        .send({ produtoId: 'p1', quantidade: 3 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockPedido);
    });

    it('deve retornar 400 se o body for inválido', async () => {
      const res = await request(app)
        .post('/pedidos')
        .send({ produtoId: '', quantidade: 0 });

      expect(res.status).toBe(400);
    });

    it('deve retornar 404 se o produto não existir', async () => {
      (prisma.produto.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/pedidos')
        .send({ produtoId: 'id-inexistente', quantidade: 2 });

      expect(res.status).toBe(404);
      expect(res.body.erro).toBe('Produto não encontrado');
    });

    it('deve retornar 400 se o estoque for insuficiente', async () => {
      (prisma.produto.findUnique as jest.Mock).mockResolvedValue({
        id: 'p1',
        quantidade: 1,
      });

      const res = await request(app)
        .post('/pedidos')
        .send({ produtoId: 'p1', quantidade: 5 });

      expect(res.status).toBe(400);
      expect(res.body.erro).toBe('Estoque insuficiente');
    });

    it('deve retornar 500 em caso de erro inesperado no banco', async () => {
      (prisma.produto.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .post('/pedidos')
        .send({ produtoId: 'p1', quantidade: 2 });

      expect(res.status).toBe(500);
    });
  });

  describe('GET /pedidos', () => {
    it('deve listar todos os pedidos (200)', async () => {
      (prisma.pedido.findMany as jest.Mock).mockResolvedValue([{ id: 'ped1' }]);

      const res = await request(app).get('/pedidos');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('deve retornar 500 se falhar ao listar pedidos', async () => {
      (prisma.pedido.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/pedidos');
      expect(res.status).toBe(500);
    });
  });

  describe('PATCH /pedidos/:id/status', () => {
    it('deve atualizar para status em andamento com dataFinalizacao null via body (200)', async () => {
      (prisma.pedido.findUnique as jest.Mock).mockResolvedValue({ id: 'ped1', status: 'EM_PREPARACAO' });
      (prisma.pedido.update as jest.Mock).mockResolvedValue({
        id: 'ped1',
        status: 'EM_FABRICACAO',
        dataFinalizacao: null,
      });

      const res = await request(app)
        .patch('/pedidos/ped1/status')
        .send({ status: 'EM_FABRICACAO' });

      expect(res.status).toBe(200);
      expect(res.body.dataFinalizacao).toBeNull();
    });

    it('deve atualizar status via query param (Select do Swagger) e preencher dataFinalizacao quando ENTREGUE (200)', async () => {
      (prisma.pedido.findUnique as jest.Mock).mockResolvedValue({ id: 'ped1', status: 'EMBALANDO' });
      (prisma.pedido.update as jest.Mock).mockResolvedValue({
        id: 'ped1',
        status: 'ENTREGUE',
        dataFinalizacao: new Date().toISOString(),
      });

      const res = await request(app)
        .patch('/pedidos/ped1/status?status=ENTREGUE');

      expect(res.status).toBe(200);
      expect(res.body.dataFinalizacao).toBeTruthy();
    });

    it('deve estornar o estoque e preencher dataFinalizacao quando CANCELADO (200)', async () => {
      (prisma.pedido.findUnique as jest.Mock).mockResolvedValue({
        id: 'ped1',
        produtoId: 'p1',
        quantidade: 2,
        status: 'EM_PREPARACAO',
      });
      (prisma.$transaction as jest.Mock).mockResolvedValue([
        {
          id: 'ped1',
          produtoId: 'p1',
          quantidade: 2,
          status: 'CANCELADO',
          dataFinalizacao: new Date().toISOString(),
        },
        { id: 'p1', quantidade: 12 },
      ]);

      const res = await request(app)
        .patch('/pedidos/ped1/status')
        .send({ status: 'CANCELADO' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('CANCELADO');
      expect(res.body.dataFinalizacao).toBeTruthy();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('deve retornar 400 para status inválido', async () => {
      const res = await request(app)
        .patch('/pedidos/ped1/status')
        .send({ status: 'INVALIDO' });

      expect(res.status).toBe(400);
    });

    it('deve retornar 404 se o pedido não existir', async () => {
      (prisma.pedido.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .patch('/pedidos/id-falso/status')
        .send({ status: 'ENTREGUE' });

      expect(res.status).toBe(404);
    });

    it('deve retornar 500 se o banco falhar na atualização', async () => {
      (prisma.pedido.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .patch('/pedidos/ped1/status')
        .send({ status: 'ENTREGUE' });

      expect(res.status).toBe(500);
    });
  });
});