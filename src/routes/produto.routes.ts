import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const produtoRoutes = Router();

produtoRoutes.post('/', async (req: Request, res: Response) => {
  const { nome, preco, quantidade } = req.body;
  const produto = await prisma.produto.create({
    data: { nome, preco: Number(preco), quantidade: Number(quantidade) }
  });
  res.status(201).json(produto);
});

produtoRoutes.get('/', async (req: Request, res: Response) => {
  const produtos = await prisma.produto.findMany();
  res.json(produtos);
});