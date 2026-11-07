import { z } from 'zod';
import { StatusPedido } from '@prisma/client';

export const criarProdutoSchema = z.object({
  nome: z
    .string({ message: 'O nome do produto é obrigatório' })
    .trim()
    .min(1, { message: 'O nome do produto não pode ser vazio' }),
  preco: z.coerce
    .number({ message: 'O preço deve ser um número válido' })
    .positive({ message: 'O preço deve ser maior que zero' }),
  quantidade: z.coerce
    .number({ message: 'A quantidade deve ser um número válido' })
    .int({ message: 'A quantidade deve ser um número inteiro' })
    .min(0, { message: 'A quantidade não pode ser negativa' })
    .default(0)
});

export const criarPedidoSchema = z.object({
  produtoId: z
    .string({ message: 'O produtoId é obrigatório' })
    .trim()
    .min(1, { message: 'O produtoId é obrigatório' }),
  quantidade: z.coerce
    .number({ message: 'A quantidade deve ser um número válido' })
    .int({ message: 'A quantidade deve ser um número inteiro' })
    .positive({ message: 'A quantidade do pedido deve ser maior que zero' })
});

export const atualizarStatusSchema = z.object({
  status: z.nativeEnum(StatusPedido, {
    message: 'Status inválido'
  })
});