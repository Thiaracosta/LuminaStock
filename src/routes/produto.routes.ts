import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../prisma';
import { criarProdutoSchema, atualizarEstoquePrecoSchema } from '../validators/schemas';
import { logger } from '../logger';

export const produtoRoutes = Router();

produtoRoutes.post('/', async (req: Request, res: Response) => {
  const validacao = criarProdutoSchema.safeParse(req.body);

  if (!validacao.success) {
    logger.warn({ body: req.body, erro: validacao.error.issues[0].message }, 'Tentativa de cadastro de produto com dados invalidos');
    res.status(400).json({ erro: validacao.error.issues[0].message });
    return;
  }

  try {
    const novoProduto = await prisma.produto.create({
      data: validacao.data,
    });
    logger.info({ produtoId: novoProduto.id, nome: novoProduto.nome }, 'Produto cadastrado com sucesso');
    res.status(201).json(novoProduto);
  } catch (error) {
    logger.error({ error }, 'Falha no banco ao cadastrar produto');
    res.status(500).json({ erro: 'Erro interno ao cadastrar o produto' });
  }
});

produtoRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const produtos = await prisma.produto.findMany();
    logger.info({ total: produtos.length }, 'Listagem de produtos realizada com sucesso');
    res.status(200).json(produtos);
  } catch (error) {
    logger.error({ error }, 'Falha no banco ao listar produtos');
    res.status(500).json({ erro: 'Erro interno ao listar os produtos' });
  }
});

produtoRoutes.patch('/:id/estoque-preco', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const qtdRaw = req.query.quantidadeAdicionar ?? req.body?.quantidadeAdicionar;
  const precoRaw = req.query.preco ?? req.body?.preco;

  const validacao = atualizarEstoquePrecoSchema.safeParse({
    quantidadeAdicionar: qtdRaw !== '' ? qtdRaw : undefined,
    preco: precoRaw !== '' ? precoRaw : undefined,
  });

  if (!validacao.success) {
    logger.warn({ produtoId: id, erro: validacao.error.issues[0].message }, 'Dados invalidos ao atualizar estoque/preco');
    res.status(400).json({ erro: validacao.error.issues[0].message });
    return;
  }

  const { quantidadeAdicionar, preco } = validacao.data;

  if (quantidadeAdicionar === undefined && preco === undefined) {
    logger.warn({ produtoId: id }, 'Tentativa de atualizar produto sem informar quantidadeAdicionar ou preco');
    res.status(400).json({ erro: 'Informe quantidadeAdicionar ou preco para atualizar o produto' });
    return;
  }

  try {
    const produtoExistente = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produtoExistente) {
      logger.warn({ produtoId: id }, 'Tentativa de atualizar estoque/preco de produto inexistente');
      res.status(404).json({ erro: 'Produto não encontrado' });
      return;
    }

    const dadosAtualizacao: { quantidade?: { increment: number }; preco?: number } = {};
    if (quantidadeAdicionar !== undefined) {
      dadosAtualizacao.quantidade = { increment: quantidadeAdicionar };
    }
    if (preco !== undefined) {
      dadosAtualizacao.preco = preco;
    }

    const produtoAtualizado = await prisma.produto.update({
      where: { id },
      data: dadosAtualizacao,
    });

    logger.info(
      { produtoId: id, quantidadeAdicionada: quantidadeAdicionar, novoPreco: preco },
      'Estoque e/ou preco do produto atualizados com sucesso'
    );
    res.status(200).json(produtoAtualizado);
  } catch (error) {
    logger.error({ error, produtoId: id }, 'Falha no banco ao atualizar estoque ou preco do produto');
    res.status(500).json({ erro: 'Erro interno ao atualizar o produto' });
  }
});