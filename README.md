@'
> **Nivel do Projeto Final:** **Projeto B** (API de Dominio Unico - Gestao de Estoque e Pedidos 3D)

# LuminaStock API

![CI Pipeline](https://github.com/Thiaracosta/LuminaStock/actions/workflows/ci.yml/badge.svg)

API RESTful desenvolvida em **Node.js**, **TypeScript**, **Express**, **Prisma ORM** e **PostgreSQL** para controle de estoque de filamentos/pecas e gestao de pedidos de impressao 3D (**Lumina 3D**).

## 1. Arquitetura, SOLID e Design Patterns (M1)
- **Separacao de Responsabilidades (SRP / Modularizacao de Rotas e Validacao):** As rotas (`produto.routes.ts` e `pedido.routes.ts`), a camada de acesso a dados (`prisma.ts`), a documentacao (`swagger.ts`) e a observabilidade (`logger.ts`) possuem fronteiras explicitas e desacopladas do ponto de entrada (`server.ts` vs `app.ts`), permitindo testes de integracao isolados em memoria.
- **Database Pattern & Controle Transacional (Unit of Work / Atomic Transaction):** Na criacao de pedidos (`POST /pedidos`), foi aplicado o padrao de **Transacao Atomica (`prisma.$transaction`)** aliado ao decremento atomico no banco (`{ decrement: quantidade }`). Essa escolha garante que o registro do pedido e a baixa no estoque ocorram como uma unica unidade indivisivel (ACID), prevenindo *race conditions* e *overselling* (detalhado no [ADR 001](./docs/adr/001-transacao-atomica-estoque.md)).
- **Fail-Fast Validation (Schema Pattern com Zod):** Todos os payloads de entrada sao validados estaticamente e em tempo de execucao via schemas do **Zod** antes de abrir transacoes no banco de dados.

## 2. Estrutura de Documentacao e Entregaveis (M1 a M4)
- **Contrato OpenAPI 3.0 Estatico:** [`openapi.yaml`](./openapi.yaml) (e interface Swagger UI interativa em `/api-docs`)
- **Registro de Decisao Arquitetural (ADR 001):** [`docs/adr/001-transacao-atomica-estoque.md`](./docs/adr/001-transacao-atomica-estoque.md)
- **Relatorio de Desempenho e SLO (k6 Smoke Test):** [`docs/desempenho.md`](./docs/desempenho.md)
- **Declaracao de Uso de IA:** [`docs/ia.md`](./docs/ia.md)
- **Autoria e Contribuicoes:** [`CONTRIBUTORS.md`](./CONTRIBUTORS.md)
- **Pipeline de CI (Lint + Testes + Coverage >90%):** [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)

## 3. Como Executar o Projeto Localmente

### Pre-requisitos
- **Node.js** (v20+)
- **Docker** e **Docker Compose**
- **Grafana k6** (opcional, para rodar o teste de carga)

### Passo a Passo
1. **Clone o repositorio e instale as dependencias:**

    git clone [https://github.com/Thiaracosta/LuminaStock.git](https://github.com/Thiaracosta/LuminaStock.git)
    cd LuminaStock
    npm install

2. **Configure as variaveis de ambiente:**
   Copie o arquivo `.env.example` para `.env`:

    cp .env.example .env

3. **Suba o banco de dados PostgreSQL com 1 comando (Docker Compose):**

    docker compose up -d

4. **Execute as migracoes do Prisma e inicie o servidor:**

    npx prisma migrate dev
    npm run dev

- **API disponivel em:** `http://localhost:3000`
- **Documentacao Swagger UI:** `http://localhost:3000/api-docs`

## 4. Como Rodar o Lint, Testes e Smoke Test (k6)

- **Analise Estatica de Codigo (ESLint):**

    npm run lint

- **Testes Automatizados e Cobertura (Jest + Supertest - Meta >90%):**

    npm run test:cov

- **Smoke Test de Desempenho (k6 - SLO `p(95) < 500ms`):**
  Com a API rodando em `http://localhost:3000`, execute em outro terminal:

    k6 run tests/smoke-test.js
'@ | Set-Content -Path README.md -Encoding UTF8