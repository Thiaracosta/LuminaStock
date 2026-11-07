import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { criarProdutoSchema } from '../validators/schemas';

export const produtoRoutes = Router();

produtoRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const validacao = criarProdutoSchema.safeParse(req.body);
    if (!validacao.success) {
      return res.status(400).json({ erro: validacao.error.issues[0]?.message });
    }

    const { nome, preco, quantidade } = validacao.data;

    const produto = await prisma.produto.create({
      data: { nome, preco, quantidade }
    });

    return res.status(201).json(produto);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno ao cadastrar o produto' });
  }
});

produtoRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const produtos = await prisma.produto.findMany();
    return res.json(produtos);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno ao listar os produtos' });
  }
});