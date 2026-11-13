export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'LuminaStock API',
    version: '1.1.1',
    description: 'API de controle de estoque e gestão de pedidos para estúdio de impressão 3D (Lumina 3D).',
  },
  servers: [
    {
      url: '/',
      description: 'Servidor Atual (Automatico - Render ou Local)',
    },
    {
      url: 'https://luminastock-api.onrender.com',
      description: 'Servidor de Producao (Render)',
    },
    {
      url: 'http://localhost:3000',
      description: 'Servidor Local',
    },
  ],
  tags: [
    { name: 'Health Check', description: 'Verificação de status do servidor e banco de dados' },
    { name: 'Produtos', description: 'Gerenciamento de itens e filamentos em estoque' },
    { name: 'Pedidos', description: 'Fluxo de pedidos, baixa automática de estoque e status de produção' },
  ],
  paths: {
    '/': {
      get: {
        tags: ['Health Check'],
        summary: 'Verifica se a API está online',
        responses: {
          200: {
            description: 'API funcionando normalmente',
            content: {
              'application/json': {
                example: { status: 'ok', servico: 'LuminaStock API rodando 🚀' },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['Health Check'],
        summary: 'Verifica a saúde da API e conectividade ativa com o PostgreSQL',
        responses: {
          200: {
            description: 'API e Banco de Dados operacionais',
            content: {
              'application/json': {
                example: { status: 'ok', database: 'connected' },
              },
            },
          },
          503: {
            description: 'Falha de comunicação com o Banco de Dados',
          },
        },
      },
    },
    '/produtos': {
      post: {
        tags: ['Produtos'],
        summary: 'Cadastra um novo produto no estoque',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CriarProdutoInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Produto cadastrado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Produto' },
              },
            },
          },
          400: {
            description: 'Erro de validação nos dados enviados',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErroResponse' },
                example: { erro: 'O preço deve ser maior que zero' },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
          },
        },
      },
      get: {
        tags: ['Produtos'],
        summary: 'Lista todos os produtos disponíveis no estoque',
        responses: {
          200: {
            description: 'Lista de produtos retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Produto' },
                },
              },
            },
          },
          500: {
            description: 'Erro interno ao listar os produtos',
          },
        },
      },
    },
    '/produtos/{id}/estoque-preco': {
      patch: {
        tags: ['Produtos'],
        summary: 'Adiciona unidades ao estoque e/ou altera o preço do produto (Sem JSON)',
        description: 'Informe a quantidade a somar ao estoque atual e/ou o novo preço diretamente nos campos abaixo.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID (UUID) do produto',
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'quantidadeAdicionar',
            in: 'query',
            required: false,
            description: 'Quantidade de unidades para somar ao estoque atual (ex: 10)',
            schema: { type: 'integer', minimum: 1 },
          },
          {
            name: 'preco',
            in: 'query',
            required: false,
            description: 'Novo preço unitário do produto (ex: 99.90)',
            schema: { type: 'number', minimum: 0.01 },
          },
        ],
        responses: {
          200: {
            description: 'Estoque e/ou preço atualizados com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Produto' },
              },
            },
          },
          400: {
            description: 'Parâmetros inválidos ou ausentes',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErroResponse' },
              },
            },
          },
          404: {
            description: 'Produto não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErroResponse' },
                example: { erro: 'Produto não encontrado' },
              },
            },
          },
          500: {
            description: 'Erro interno ao atualizar o produto',
          },
        },
      },
    },
    '/pedidos': {
      post: {
        tags: ['Pedidos'],
        summary: 'Cria um pedido e desconta a quantidade do estoque automaticamente',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CriarPedidoInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Pedido criado e estoque atualizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Pedido' },
              },
            },
          },
          400: {
            description: 'Dados inválidos ou estoque insuficiente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErroResponse' },
                example: { erro: 'Estoque insuficiente', estoqueDisponivel: 2 },
              },
            },
          },
          404: {
            description: 'Produto não encontrado pelo ID informado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErroResponse' },
                example: { erro: 'Produto não encontrado' },
              },
            },
          },
          500: {
            description: 'Erro interno ao processar o pedido',
          },
        },
      },
      get: {
        tags: ['Pedidos'],
        summary: 'Lista todos os pedidos com os dados do produto vinculado',
        responses: {
          200: {
            description: 'Lista de pedidos retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/PedidoComProduto' },
                },
              },
            },
          },
          500: {
            description: 'Erro interno ao listar os pedidos',
          },
        },
      },
    },
    '/pedidos/{id}/status': {
      patch: {
        tags: ['Pedidos'],
        summary: 'Atualiza o status de produção/entrega de um pedido (Via Select)',
        description: 'Selecione o novo status na caixa de seleção. Se alterado para ENTREGUE ou CANCELADO, o campo dataFinalizacao é preenchido automaticamente.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID (UUID) do pedido',
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'status',
            in: 'query',
            required: true,
            description: 'Selecione o novo status do pedido',
            schema: {
              type: 'string',
              enum: [
                'EM_PREPARACAO',
                'EM_FABRICACAO',
                'EM_ACABAMENTO',
                'EMBALANDO',
                'ENTREGUE',
                'CANCELADO',
              ],
            },
          },
        ],
        responses: {
          200: {
            description: 'Status do pedido atualizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Pedido' },
              },
            },
          },
          400: {
            description: 'Status inválido (fora do Enum permitido)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErroResponse' },
                example: { erro: 'Status inválido' },
              },
            },
          },
          404: {
            description: 'Pedido não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErroResponse' },
                example: { erro: 'Pedido não encontrado' },
              },
            },
          },
          500: {
            description: 'Erro interno ao atualizar o status',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      CriarProdutoInput: {
        type: 'object',
        required: ['nome', 'preco'],
        properties: {
          nome: { type: 'string', example: 'Luminária Lua 3D' },
          preco: { type: 'number', example: 89.90 },
          quantidade: { type: 'integer', default: 0, example: 10 },
        },
      },
      Produto: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab' },
          nome: { type: 'string', example: 'Luminária Lua 3D' },
          preco: { type: 'number', example: 89.90 },
          quantidade: { type: 'integer', example: 10 },
        },
      },
      CriarPedidoInput: {
        type: 'object',
        required: ['produtoId', 'quantidade'],
        properties: {
          produtoId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab' },
          quantidade: { type: 'integer', example: 2 },
        },
      },
      AtualizarStatusInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['EM_PREPARACAO', 'EM_FABRICACAO', 'EM_ACABAMENTO', 'EMBALANDO', 'ENTREGUE', 'CANCELADO'],
            example: 'EM_FABRICACAO',
          },
        },
      },
      Pedido: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'f9e8d7c6-b5a4-3210-fedc-0987654321fe' },
          produtoId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab' },
          quantidade: { type: 'integer', example: 2 },
          status: {
            type: 'string',
            enum: ['EM_PREPARACAO', 'EM_FABRICACAO', 'EM_ACABAMENTO', 'EMBALANDO', 'ENTREGUE', 'CANCELADO'],
            example: 'EM_PREPARACAO',
          },
          dataPedido: { type: 'string', format: 'date-time', example: '2026-11-07T23:00:00.000Z' },
          dataFinalizacao: { type: 'string', format: 'date-time', nullable: true, example: null },
        },
      },
      PedidoComProduto: {
        allOf: [
          { $ref: '#/components/schemas/Pedido' },
          {
            type: 'object',
            properties: {
              produto: { $ref: '#/components/schemas/Produto' },
            },
          },
        ],
      },
      ErroResponse: {
        type: 'object',
        properties: {
          erro: { type: 'string' },
        },
      },
    },
  },
};