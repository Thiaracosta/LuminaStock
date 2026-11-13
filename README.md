# LuminaStock API

API RESTful para gerenciamento de estoque e controle de pedidos de produção, construída de forma autônoma com foco em confiabilidade transacional (ACID), observabilidade, testes automatizados, containerização completa e deploy em nuvem.

---

## Sobre o Desenvolvimento e Evolução (Projeto B -> Projeto A)

Este projeto foi concebido e desenvolvido integralmente de forma individual por **Thiara Monik Silva Costa**, estruturado em duas grandes entregas evolutivas:

1. **Entrega Base (Projeto B):** Construção de toda a arquitetura central da API do zero, modelagem relacional com Prisma ORM, controle de estoque com transações atômicas (`prisma.$transaction`), validação rigorosa com Zod, documentação OpenAPI 3.0 (Swagger), pipeline de Integração Contínua (CI) e 100% de cobertura em testes unitários e de integração.
2. **Evolução Arquitetural (Projeto A - Nova Release):** Implementada em uma *branch* e *release* dedicada (`release/v1.0.0` / `v1.1.0`), elevando o projeto ao nível de prontidão para produção com containerização completa da aplicação (`Dockerfile` + orquestração `docker-compose.yml` com *healthcheck*), endpoint de saúde ativo (`/health` validando conexão real com o PostgreSQL), bateria de testes de carga em estágios de rampa (*Grafana k6*) e *Continuous Deployment* (CD) na nuvem pelo Render.

---

## Aplicação em Produção (Cloud Deploy - Render)

A API está publicada e acessível na nuvem:

- **URL Base de Produção:** `https://luminastock-api.onrender.com`
- **Health Check Ativo:** [https://luminastock-api.onrender.com/health](https://luminastock-api.onrender.com/health)
- **Documentação Interativa (Swagger UI):** [https://luminastock-api.onrender.com/api-docs](https://luminastock-api.onrender.com/api-docs)

---

## Tecnologias Utilizadas

- **Runtime & Linguagem:** Node.js 20 + TypeScript
- **Framework Web:** Express
- **ORM & Banco de Dados:** Prisma ORM + PostgreSQL 15
- **Validação de Dados:** Zod
- **Documentação da API:** OpenAPI 3.0 / Swagger UI
- **Logs Estruturados:** Pino
- **Testes Unitários e Integração:** Jest + Supertest (100% Coverage)
- **Testes de Carga:** Grafana k6
- **Containerização & CI/CD:** Docker, Docker Compose, GitHub Actions (CI) e Render (CD)

---

## Arquitetura de Containers (C4 Model)

'''mermaid
flowchart LR
    User([Cliente / Avaliador]) -->|HTTP :3000| API[Container: luminastock_api - Node.js 20 + Express + Prisma]
    K6([Grafana k6 - Smoke e Ramp Test]) -->|GET /health, /produtos, /pedidos| API
    API -->|TCP :5432 - SELECT 1 e Transacoes ACID| DB[(Container: luminastock_db - PostgreSQL 15)]
'''

---

## Como Executar o Projeto (Docker Compose - Recomendado)

Com o **Docker Desktop** aberto, suba o banco de dados PostgreSQL e a API juntos com um único comando:

'''bash
docker compose up -d --build
'''

O container da API aguardará o banco ficar saudável (`service_healthy`), aplicará as migrações do Prisma automaticamente (`npx prisma migrate deploy`) e ficará disponível em:

- **API Base URL:** `http://localhost:3000`
- **Health Check:** `http://localhost:3000/health`
- **Documentação Interativa (Swagger UI):** `http://localhost:3000/api-docs`

---

## Como Executar Localmente (Desenvolvimento)

1. Instale as dependências:
'''bash
npm install
'''

2. Suba o banco de dados e aplique as migrações:
'''bash
docker compose up -d db
npx prisma migrate dev
'''

3. Inicie o servidor em modo watch:
'''bash
npm run dev
'''

---

## Endpoints Principais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verifica status da API e conectividade ativa com o PostgreSQL (`SELECT 1`) |
| POST | `/produtos` | Cadastra um novo produto no estoque |
| GET | `/produtos` | Lista todos os produtos cadastrados |
| POST | `/pedidos` | Cria um pedido abatendo o estoque em transação atômica (`prisma.$transaction`) |
| GET | `/pedidos` | Lista todos os pedidos com os dados do produto vinculado |
| PATCH | `/pedidos/:id/status` | Atualiza o status de um pedido (`EM_PREPARACAO`, `CONCLUIDO`, `CANCELADO`) |

---

## Qualidade, Testes e Cobertura (Jest)

Para executar a suíte de testes automatizados com verificação de cobertura (meta global >= 90%, atual **100%**):

'''bash
npm run test:cov
npm run lint
'''

---

## Resultados do Teste de Carga (Grafana k6)

Para executar o teste de carga com estágios de rampa (`ramp-up`, `plato` e `ramp-down`):

'''bash
k6 run tests/smoke-test.js
'''

- **Cenário:** Rampa de até 5 VUs simultâneos por 30s (`10s ramp-up`, `15s plato`, `5s ramp-down`)
- **Total de Requisições (`checks_total`):** 261 (100% de sucesso em `/health`, `/produtos` e `/pedidos`)
- **Taxa de Falha (`http_req_failed`):** `0.00%` (meta: menor que 1%)
- **Latência p(95) (`http_req_duration`):** `147.01ms` (meta: menor que 500ms)

---

## 🔮 Visão de Futuro (Roadmap v2.0)

- [ ] **Controle de Estoque de Matéria-Prima:** Gerenciamento de insumos de produção (rolos de filamento em gramas, primers, tintas e materiais de acabamento) vinculados à ficha técnica de cada peça 3D.
- [ ] **Acompanhamento de Vendas e Inteligência Financeira:** Novos endpoints de métricas (`/relatorios/vendas` e `/relatorios/lucro`) para acompanhar o volume total vendido por período, ticket médio, ranking de peças com maior saída e cálculo automático de **lucro líquido** (cruzando o valor dos pedidos `ENTREGUE` com o custo de matéria-prima e tempo de máquina).

---

## Planos Futuros (Roadmap)

Como evolução contínua do produto nas próximas *releases*, estão planejadas as seguintes implementações:

1. **Controle de Matéria-Prima:** Cadastro e gerenciamento de insumos (filamentos, embalagens e componentes) com baixa proporcional automática a cada produto fabricado.
2. **Rastreamento de Tempo de Produção:** Adição de métricas de tempo estimado versus tempo real de fabricação para cálculo de capacidade produtiva e gargalos de fila.
3. **Interface Front-End em Angular:** Desenvolvimento de uma aplicação web SPA em **Angular** consumindo todos os *endpoints* da API LuminaStock para gestão visual de estoque, acompanhamento de pedidos em tempo real e *dashboard* de indicadores.

---

## Decisões Arquiteturais (ADRs)

- [ADR 001 - Controle de Concorrência e Transações de Estoque](docs/adr/001-transacoes-estoque.md)
- [ADR 002 - Containerização Completa da API, Healthcheck Ativo e Estratégia de Deploy](docs/adr/002-containerizacao-healthcheck-deploy.md)
'@

