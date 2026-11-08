# ADR 001: Controle de Concorrência e Baixa de Estoque com Transações Atômicas

- **Status:** Aceito
- **Data:** 08/11/2026
- **Contexto do Projeto:** LuminaStock API (Gestão de Estoque e Pedidos 3D)

## 1. Contexto e Problema
No fluxo de criação de pedidos (`POST /pedidos`), o sistema precisa realizar duas operações críticas de escrita no banco de dados após validar a disponibilidade de itens:
1. Registrar o novo pedido na tabela `Pedido`.
2. Decrementar a quantidade correspondente na tabela `Produto`.

Se essas duas operações fossem executadas de forma independente (`await prisma.pedido.create(...)` seguido de `await prisma.produto.update(...)`), uma falha de rede, queda do banco ou exceção inesperada entre a primeira e a segunda instrução deixaria o banco em estado inconsistente: um pedido seria criado sem que o estoque real fosse descontado, gerando risco de venda sem estoque (*overselling*) na produção das peças 3D.

## 2. Decisão Arquitetural
Optamos por utilizar **banco de dados relacional PostgreSQL** aliado ao recurso de **Transações Atômicas Interativas/Sequenciais do Prisma ORM (`prisma.$transaction([...])`)**, combinado com a operação nativa de decremento atômico (`{ decrement: quantidade }`).

```typescript
const [novoPedido] = await prisma.$transaction([
  prisma.pedido.create({
    data: { produtoId, quantidade },
  }),
  prisma.produto.update({
    where: { id: produtoId },
    data: { quantidade: { decrement: quantidade } },
  }),
]);
