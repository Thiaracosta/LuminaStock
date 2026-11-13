$bt = '```'
$readme = @"
# LuminaStock API

API RESTful para gerenciamento de estoque e controle de pedidos de producao, construida com foco em confiabilidade transacional (ACID), observabilidade, testes automatizados e containerizacao completa.

---

## Tecnologias Utilizadas

- **Runtime & Linguagem:** Node.js 20 + TypeScript
- **Framework Web:** Express
- **ORM & Banco de Dados:** Prisma ORM + PostgreSQL 15
- **Validacao de Dados:** Zod
- **Documentacao da API:** OpenAPI 3.0 / Swagger UI
- **Logs Estruturados:** Pino
- **Testes Unitarios e Integracao:** Jest + Supertest (100% Coverage)
- **Testes de Carga:** Grafana k6
- **Containerizacao & CI/CD:** Docker, Docker Compose e GitHub Actions

---

## Arquitetura de Containers (C4 Model)

${bt}mermaid
flowchart LR
    User([Cliente / Avaliador]) -->|HTTP :3000| API[Container: luminastock_api - Node.js 20 + Express + Prisma]
    K6([Grafana k6 - Smoke e Ramp Test]) -->|GET /health, /produtos, /pedidos| API
    API -->|TCP :5432 - SELECT 1 e Transacoes ACID| DB[(Container: luminastock_db - PostgreSQL 15)]
${bt}

---

## Como Executar o Projeto (Docker Compose - Recomendado)

Com o **Docker Desktop** aberto, suba o banco de dados PostgreSQL e a API juntos com um unico comando:

${bt}bash
docker compose up -d --build
${bt}

O container da API aguardara o banco ficar saudavel (`service_healthy`), aplicara as migracoes do Prisma automaticamente (`npx prisma migrate deploy`) e ficara disponivel em:

- **API Base URL:** `http://localhost:3000`
- **Health Check:** `http://localhost:3000/health`
- **Documentacao Interativa (Swagger UI):** `http://localhost:3000/api-docs`

---

## Como Executar Localmente (Desenvolvimento)

1. Instale as dependencias:
${bt}bash
npm install
${bt}

2. Suba o banco de dados e aplique as migracoes:
${bt}bash
docker compose up -d db
npx prisma migrate dev
${bt}

3. Inicie o servidor em modo watch:
${bt}bash
npm run dev
${bt}

---

## Endpoints Principais

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/health` | Verifica status da API e conectividade ativa com o PostgreSQL (`SELECT 1`) |
| POST | `/produtos` | Cadastra um novo produto no estoque |
| GET | `/produtos` | Lista todos os produtos cadastrados |
| POST | `/pedidos` | Cria um pedido abatendo o estoque em transacao atomica (`prisma.`$transaction) |
| GET | `/pedidos` | Lista todos os pedidos com os dados do produto vinculado |
| PATCH | `/pedidos/:id/status` | Atualiza o status de um pedido (`EM_PREPARACAO`, `CONCLUIDO`, `CANCELADO`) |

---

## Qualidade, Testes e Cobertura (Jest)

Para executar a suite de testes automatizados com verificacao de cobertura (meta global >= 90%, atual **100%**):

${bt}bash
npm run test:cov
npm run lint
${bt}

---

## Resultados do Teste de Carga (Grafana k6)

Para executar o teste de carga com estagios de rampa (`ramp-up`, `plato` e `ramp-down`):

${bt}bash
k6 run tests/smoke-test.js
${bt}

- **Cenario:** Rampa de ate 5 VUs simultaneos por 30s (`10s ramp-up`, `15s plato`, `5s ramp-down`)
- **Total de Requisicoes (`checks_total`):** 261 (100% de sucesso em `/health`, `/produtos` e `/pedidos`)
- **Taxa de Falha (`http_req_failed`):** `0.00%` (meta: menor que 1%)
- **Latencia p(95) (`http_req_duration`):** `147.01ms` (meta: menor que 500ms)

---

## Decisoes Arquiteturais (ADRs)

- [ADR 001 - Controle de Concorrencia e Transacoes de Estoque](docs/adr/001-transacoes-estoque.md)
- [ADR 002 - Containerizacao Completa da API, Healthcheck Ativo e Estrategia de Deploy](docs/adr/002-containerizacao-healthcheck-deploy.md)
"@
Set-Content -Path README.md -Value $readme -Encoding UTF8