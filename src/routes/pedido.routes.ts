import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { criarPedidoSchema, atualizarStatusSchema } from '../validators/schemas';

export const pedidoRoutes = Router();

pedidoRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const validacao = criarPedidoSchema.safeParse(req.body);
    if (!validacao.success) {
      return res.status(400).json({ erro: validacao.error.issues[0]?.message });
    }

    const { produtoId, quantidade } = validacao.data;

    const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    if (produto.quantidade < quantidade) {
      return res.status(400).json({
        erro: 'Estoque insuficiente',
        estoqueDisponivel: produto.quantidade
      });
    }

    const [pedido] = await prisma.$transaction([
      prisma.pedido.create({ data: { produtoId, quantidade } }),
      prisma.produto.update({
        where: { id: produtoId },
        data: { quantidade: produto.quantidade - quantidade }
      })
    ]);

    return res.status(201).json(pedido);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno ao processar o pedido' });
  }
});

pedidoRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: { produto: true }
    });
    return res.json(pedidos);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno ao listar os pedidos' });
  }
});

pedidoRoutes.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const validacao = atualizarStatusSchema.safeParse(req.body);
    if (!validacao.success) {
      return res.status(400).json({ erro: validacao.error.issues[0]?.message });
    }

    const { status } = validacao.data;

    const pedidoExistente = await prisma.pedido.findUnique({ where: { id } });
    if (!pedidoExistente) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    const finalizado = status === 'ENTREGUE' || status === 'CANCELADO';

    const pedidoAtualizado = await prisma.pedido.update({
      where: { id },
      data: {
        status,
        dataFinalizacao: finalizado ? new Date() : null
      }
    });

    return res.json(pedidoAtualizado);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno ao atualizar o status do pedido' });
  }
});