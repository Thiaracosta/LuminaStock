import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../prisma';
import { criarProdutoSchema } from '../validators/schemas';
import { logger } from '../logger';

export const produtoRoutes = Router();

produtoRoutes.post('/', async (req: Request, res: Response) => {
  const validacao = criarProdutoSchema.safeParse(req.body);

  if (!validacao.success) {
    res.status(400).json({ erro: validacao.error.issues[0].message });
    return;
  }

  try {
    const novoProduto = await prisma.produto.create({
      data: validacao.data,
    });
    res.status(201).json(novoProduto);
  } catch (error) {
    logger.error({ error }, 'Falha no banco ao cadastrar produto');
    res.status(500).json({ erro: 'Erro interno ao cadastrar o produto' });
  }
});

produtoRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const produtos = await prisma.produto.findMany();
    res.status(200).json(produtos);
  } catch (error) {
    logger.error({ error }, 'Falha no banco ao listar produtos');
    res.status(500).json({ erro: 'Erro interno ao listar os produtos' });
  }
});