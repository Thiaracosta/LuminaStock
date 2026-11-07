import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const pedidoRoutes = Router();

pedidoRoutes.post('/', async (req: Request, res: Response) => {
  const { produtoId, quantidade } = req.body;

  const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
  if (!produto || produto.quantidade < quantidade) {
    return res.status(400).json({ erro: 'Estoque insuficiente ou produto não encontrado' });
  }

  const [pedido] = await prisma.$transaction([
    prisma.pedido.create({
      data: { produtoId, quantidade: Number(quantidade) }
    }),
    prisma.produto.update({
      where: { id: produtoId },
      data: { quantidade: produto.quantidade - Number(quantidade) }
    })
  ]);

  res.status(201).json(pedido);
});

pedidoRoutes.get('/', async (req: Request, res: Response) => {
  const pedidos = await prisma.pedido.findMany({
    include: { produto: true }
  });
  res.json(pedidos);
});


pedidoRoutes.patch('/:id/status', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status } = req.body;

  const finalizado = status === 'ENTREGUE' || status === 'CANCELADO';

  try {
    const pedidoAtualizado = await prisma.pedido.update({
      where: { id },
      data: {
        status,
        dataFinalizacao: finalizado ? new Date() : null
      }
    });
    res.json(pedidoAtualizado);
  } catch (error) {
    res.status(400).json({ erro: 'Status inválido ou pedido não encontrado' });
  }
});