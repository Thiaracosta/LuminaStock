import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../prisma';
import { criarPedidoSchema, atualizarStatusSchema } from '../validators/schemas';
import { logger } from '../logger';

export const pedidoRoutes = Router();

pedidoRoutes.post('/', async (req: Request, res: Response) => {
  const validacao = criarPedidoSchema.safeParse(req.body);

  if (!validacao.success) {
    res.status(400).json({ erro: validacao.error.issues[0].message });
    return;
  }

  const { produtoId, quantidade } = validacao.data;

  try {
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
    });

    if (!produto) {
      res.status(404).json({ erro: 'Produto não encontrado' });
      return;
    }

    if (produto.quantidade < quantidade) {
      res.status(400).json({
        erro: 'Estoque insuficiente',
        estoqueDisponivel: produto.quantidade,
      });
      return;
    }

    const [novoPedido] = await prisma.$transaction([
      prisma.pedido.create({
        data: { produtoId, quantidade },
      }),
      prisma.produto.update({
        where: { id: produtoId },
        data: { quantidade: { decrement: quantidade } },
      }),
    ]);

    res.status(201).json(novoPedido);
  } catch (error) {
    logger.error({ error }, 'Falha no banco ao criar pedido');
    res.status(500).json({ erro: 'Erro interno ao processar o pedido' });
  }
});

pedidoRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: { produto: true },
    });
    res.status(200).json(pedidos);
  } catch (error) {
    logger.error({ error }, 'Falha no banco ao listar pedidos');
    res.status(500).json({ erro: 'Erro interno ao listar os pedidos' });
  }
});

pedidoRoutes.patch('/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const validacao = atualizarStatusSchema.safeParse(req.body);

  if (!validacao.success) {
    res.status(400).json({ erro: validacao.error.issues[0].message });
    return;
  }

  const { status } = validacao.data;

  try {
    const pedidoExistente = await prisma.pedido.findUnique({
      where: { id: String(id) },
    });

    if (!pedidoExistente) {
      res.status(404).json({ erro: 'Pedido não encontrado' });
      return;
    }

    const finalizado = status === 'ENTREGUE' || status === 'CANCELADO';

    const pedidoAtualizado = await prisma.pedido.update({
      where: { id: String(id) },
      data: {
        status,
        dataFinalizacao: finalizado ? new Date() : null,
      },
    });

    res.status(200).json(pedidoAtualizado);
  } catch (error) {
    logger.error({ error }, 'Falha no banco ao atualizar status do pedido');
    res.status(500).json({ erro: 'Erro interno ao atualizar o status do pedido' });
  }
});