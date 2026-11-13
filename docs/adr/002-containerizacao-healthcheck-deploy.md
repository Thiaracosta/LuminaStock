# ADR 002: Containerizacao Completa da API, Healthcheck Ativo e Estrategia de Deploy

- **Status:** Aceito
- **Data:** 2026-11-12
- **Autora:** Thiara Monik Silva Costa

## 1. Contexto e Problema
Para evoluir a API LuminaStock para o nivel **Projeto A**, era necessario eliminar a dependencia do ambiente local de desenvolvimento (Node.js instalado diretamente no host) e garantir que a aplicacao pudesse ser executada de forma identica em qualquer ambiente (local via Docker Compose ou em nuvem publica/PaaS), alem de fornecer observabilidade ativa sobre a disponibilidade do banco de dados PostgreSQL.

## 2. Opcoes Consideradas
1. **Execucao direta no host e healthcheck superficial (Apenas status HTTP 200 estatico):** Simples, mas nao detecta quedas de conexao com o banco de dados PostgreSQL e sofre com diferencas de versao de sistema operacional e Node.js.
2. **Containerizacao com `Dockerfile` (Node 20 Alpine) + Orquestracao `depends_on` com `service_healthy` + Rota `/health` com query real (`SELECT 1`):** Empacota a API com suas dependencias e aplica migracoes automaticamente na inicializacao (`prisma migrate deploy`).

## 3. Decisao
Adotamos a **Opcao 2**. A API foi empacotada em um `Dockerfile` baseado em `node:20-alpine` com OpenSSL para compatibilidade do motor do Prisma. No `docker-compose.yml`, configuramos o servico `api` aguardando o `healthcheck` nativo do container `db` (`pg_isready`). Implementamos tambem o endpoint `GET /health` que executa `SELECT 1` no banco via Prisma, retornando `200 OK` (`UP`) quando conectado ou `503 Service Unavailable` (`DOWN`) em caso de falha.

## 4. Consequencias
- **Positivas:** Subida de todo o ecossistema (API + Banco + Migracoes) com um unico comando (`docker compose up -d`), paridade total entre desenvolvimento e producao em nuvem (Render/Railway) e monitoramento real de saude da aplicacao.
- **Negativas / Trade-offs:** Tempo adicional no primeiro build da imagem Docker para instalacao de pacotes e geracao do Prisma Client.
