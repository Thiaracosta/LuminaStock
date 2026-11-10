@'
# Relatorio de Desempenho e Smoke Test (k6) - LuminaStock API

## 1. Objetivo e SLO (Service Level Objective)
Este documento registra as evidencias do teste de carga (*Smoke Test*) executado na API **LuminaStock** (Nivel: **Projeto B**), validando a estabilidade e a latencia dos endpoints principais de listagem de estoque (`GET /produtos`) e de pedidos (`GET /pedidos`) integrados ao PostgreSQL via Prisma ORM.

- **SLO de Latencia Definido:** `p(95) < 500ms` (95% das requisicoes devem responder em menos de 500 milissegundos).
- **SLO de Disponibilidade/Erros:** `http_req_failed < 1%` (taxa de falhas inferior a 1%).

## 2. Configuracao do Cenario de Teste
- **Ferramenta:** Grafana k6 (`tests/smoke-test.js`)
- **Usuarios Virtuais Simultaneos (VUs):** 5 VUs constantes
- **Duracao:** 30 segundos
- **Endpoints Alvo:** `GET /produtos` e `GET /pedidos`

Como reproduzir o teste localmente (com o banco no Docker e a API rodando):
`k6 run tests/smoke-test.js`

## 3. Resultados Obtidos (Medicao Real)

| Metrica | Valor Medido | Meta (Threshold) | Status |
| :--- | :--- | :--- | :--- |
| **Total de Requisicoes (`http_reqs`)** | 252 (`8.17 req/s`) | - | Aprovado |
| **Tempo Medio (`avg`)** | `86.85 ms` | - | Aprovado |
| **Mediana (`med` / p50)** | `20.88 ms` | - | Aprovado |
| **Tempo Minimo (`min`)** | `5.59 ms` | - | Aprovado |
| **Percentil 90 (`p90`)** | `185.21 ms` | - | Aprovado |
| **Percentil 95 (`p95`)** | **`242.74 ms`** | **`< 500 ms`** | **Aprovado** |
| **Taxa de Falhas (`http_req_failed`)** | **`0.00%` (0/252)** | **`< 1.00%`** | **Aprovado** |
| **Checks (`GET /produtos` e `GET /pedidos`)** | `100.00%` (252/252) | `100%` | **Aprovado** |

## 4. Saida Bruta do Terminal (k6 Output)

    THRESHOLDS 
    http_req_duration: ✓ 'p(95)<500' p(95)=242.74ms
    http_req_failed..: ✓ 'rate<0.01' rate=0.00%

    TOTAL RESULTS 
    checks_total.......: 252     8.177574/s
    checks_succeeded...: 100.00% 252 out of 252
    checks_failed......: 0.00%   0 out of 252

    ✓ GET /produtos status 200
    ✓ GET /pedidos status 200

    HTTP
    http_req_duration..............: avg=86.85ms min=5.59ms med=20.88ms max=1.89s p(90)=185.21ms p(95)=242.74ms
    http_req_failed................: 0.00% 0 out of 252
    http_reqs......................: 252   8.177574/s

## 5. Conclusao
A API atendeu com folga ao SLO estabelecido nos dois endpoints principais, mantendo mediana de resposta de **20.88ms** e **p95 de 242.74ms** (abaixo do limite de 500ms) com **0% de falhas** em 252 requisicoes consecutivas.
'@ | Set-Content -Path docs/desempenho.md -Encoding UTF8