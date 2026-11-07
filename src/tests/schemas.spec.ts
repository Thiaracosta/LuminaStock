import { criarProdutoSchema, criarPedidoSchema, atualizarStatusSchema } from '../validators/schemas';

describe('Validações de Schemas (Zod)', () => {
  describe('criarProdutoSchema', () => {
    it('deve validar um produto correto e aplicar quantidade padrão 0', () => {
      const resultado = criarProdutoSchema.safeParse({ nome: 'Luminária Lua', preco: 85.5 });
      expect(resultado.success).toBe(true);
      if (resultado.success) {
        expect(resultado.data.quantidade).toBe(0);
      }
    });

    it('deve rejeitar produto sem nome ou com preço inválido', () => {
      expect(criarProdutoSchema.safeParse({ nome: '', preco: 50 }).success).toBe(false);
      expect(criarProdutoSchema.safeParse({ nome: 'Chaveiro', preco: -10 }).success).toBe(false);
      expect(criarProdutoSchema.safeParse({ nome: 'Chaveiro', preco: 10, quantidade: -1 }).success).toBe(false);
    });
  });

  describe('criarPedidoSchema', () => {
    it('deve validar um pedido correto', () => {
      const resultado = criarPedidoSchema.safeParse({ produtoId: 'uuid-123', quantidade: 2 });
      expect(resultado.success).toBe(true);
    });

    it('deve rejeitar pedido sem produtoId ou com quantidade zero/negativa', () => {
      expect(criarPedidoSchema.safeParse({ produtoId: '', quantidade: 2 }).success).toBe(false);
      expect(criarPedidoSchema.safeParse({ produtoId: 'uuid-123', quantidade: 0 }).success).toBe(false);
    });
  });

  describe('atualizarStatusSchema', () => {
    it('deve aceitar status válidos do enum StatusPedido', () => {
      expect(atualizarStatusSchema.safeParse({ status: 'EM_FABRICACAO' }).success).toBe(true);
      expect(atualizarStatusSchema.safeParse({ status: 'ENTREGUE' }).success).toBe(true);
    });

    it('deve rejeitar um status inexistente', () => {
      expect(atualizarStatusSchema.safeParse({ status: 'STATUS_INVENTADO' }).success).toBe(false);
    });
  });
});