import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../prisma';
import { criarPedidoSchema, atualizarStatusSchema } from '../validators/schemas';
import { logger } from '../logger';

export const pedidoRoutes = Router();

pedidoRoutes.post('/', async (req: Request, res: Response) => {
  const validacao = criarPedidoSchema.safeParse(req.body);

  if (!validacao.success) {
    logger.warn({ body: req.body, erro: validacao.error.issues[0].message }, 'Dados invalidos ao criar pedido');
    res.status(400).json({ erro: validacao.error.issues[0].message });
    return;
  }

  const { produtoId, quantidade } = validacao.data;

  try {
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
    });

    if (!produto) {
      logger.warn({ produtoId }, 'Tentativa de criar pedido para produto inexistente');
      res.status(404).json({ erro: 'Produto não encontrado' });
      return;
    }

    if (produto.quantidade < quantidade) {
      logger.warn(
        { produtoId, solicitado: quantidade, disponivel: produto.quantidade },
        'Estoque insuficiente para criar pedido'
      );
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

    logger.info(
      { pedidoId: novoPedido.id, produtoId, quantidade },
      'Pedido criado e estoque abatido com sucesso'
    );
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
    logger.info({ total: pedidos.length }, 'Listagem de pedidos realizada com sucesso');
    res.status(200).json(pedidos);
  } catch (error) {
    logger.error({ error }, 'Falha no banco ao listar pedidos');
    res.status(500).json({ erro: 'Erro interno ao listar os pedidos' });
  }
});

pedidoRoutes.patch('/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const statusRecebido = (req.query.status as string) ?? req.body?.status;

  const validacao = atualizarStatusSchema.safeParse({ status: statusRecebido });

  if (!validacao.success) {
    logger.warn(
      { pedidoId: id, statusRecebido, erro: validacao.error.issues[0].message },
      'Tentativa de atualizar pedido com status invalido'
    );
    res.status(400).json({ erro: validacao.error.issues[0].message });
    return;
  }

  const { status } = validacao.data;

  try {
    const pedidoExistente = await prisma.pedido.findUnique({
      where: { id: String(id) },
    });

    if (!pedidoExistente) {
      logger.warn({ pedidoId: id }, 'Tentativa de atualizar status de pedido inexistente');
      res.status(404).json({ erro: 'Pedido não encontrado' });
      return;
    }

    const finalizado = status === 'ENTREGUE' || status === 'CANCELADO';
    const deveEstornarEstoque = status === 'CANCELADO' && pedidoExistente.status !== 'CANCELADO';

    if (deveEstornarEstoque) {
      const [pedidoAtualizado] = await prisma.$transaction([
        prisma.pedido.update({
          where: { id: String(id) },
          data: {
            status,
            dataFinalizacao: new Date(),
          },
        }),
        prisma.produto.update({
          where: { id: pedidoExistente.produtoId },
          data: {
            quantidade: { increment: pedidoExistente.quantidade },
          },
        }),
      ]);

      logger.info(
        {
          pedidoId: id,
          produtoId: pedidoExistente.produtoId,
          quantidadeEstornada: pedidoExistente.quantidade,
        },
        'Pedido cancelado e estoque devolvido ao produto com sucesso'
      );
      res.status(200).json(pedidoAtualizado);
      return;
    }

    const pedidoAtualizado = await prisma.pedido.update({
      where: { id: String(id) },
      data: {
        status,
        dataFinalizacao: finalizado ? new Date() : null,
      },
    });

    logger.info(
      { pedidoId: id, statusAnterior: pedidoExistente.status, novoStatus: status },
      'Status do pedido atualizado com sucesso'
    );
    res.status(200).json(pedidoAtualizado);
  } catch (error) {
    logger.error({ error, pedidoId: id }, 'Falha no banco ao atualizar status do pedido');
    res.status(500).json({ erro: 'Erro interno ao atualizar o status do pedido' });
  }
});