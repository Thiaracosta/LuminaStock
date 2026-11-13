# Relatorio de Desempenho e Testes de Carga (Grafana k6)

## 1. Ambiente de Execucao
- **Infraestrutura:** Ambiente totalmente containerizado via Docker Compose (luminastock_api + luminastock_db).
- **Banco de Dados:** PostgreSQL 15 Alpine (com healthcheck nativo pg_isready).
- **Ferramenta de Carga:** Grafana k6.

## 2. Perfil de Carga (Ramp-up, Plato e Ramp-down)
O script 	ests/smoke-test.js executa tres estagios progressivos simulando trafego concorrente nos endpoints /health, /produtos e /pedidos:

- **Ramp-up (Subida):** 0 a 5 usuarios virtuais (VUs) em 10s.
- **Plato (Sustentacao):** 5 VUs simultaneos constantes por 15s.
- **Ramp-down (Descida):** 5 a 0 VUs em 5s.
- **SLAs (Thresholds):**
  - http_req_duration: p(95) < 500ms
  - http_req_failed: ate < 0.01 (menos de 1% de erro)

## 3. Resultados Obtidos

| Metrica | Resultado Obtido | Meta (Threshold) | Status |
|---|---|---|---|
| **Checks Totais (checks_total)** | 261 / 261 (100% sucesso) | 100% | Aprovado |
| **Taxa de Falha (http_req_failed)** | 0.00% (0 falhas) | Menor que 1% | Aprovado |
| **Tempo Medio (vg)** | 56.49ms | - | Aprovado |
| **Mediana (med)** | 29.03ms | - | Aprovado |
| **Percentil 90 (p90)** | 108.13ms | - | Aprovado |
| **Percentil 95 (p95)** | 147.01ms | Menor que 500ms | Aprovado |
| **Vazao (http_reqs)** | 8.46 req/s (87 iteracoes) | - | Aprovado |

## 4. Saida Oficial do Terminal

```text
  █ THRESHOLDS 
    http_req_duration
    ✓ 'p(95)<500' p(95)=147.01ms
    http_req_failed
    ✓ 'rate<0.01' rate=0.00%

  █ TOTAL RESULTS 
    checks_total.......: 261     8.468149/s
    checks_succeeded...: 100.00% 261 out of 261
    checks_failed......: 0.00%   0 out of 261

    ✓ GET /health status 200
    ✓ GET /produtos status 200
    ✓ GET /pedidos status 200
```

## 5. Conclusao Tecnica
Mesmo com a sobrecarga de rede entre containers Docker e a execucao ativa da query SELECT 1 no PostgreSQL a cada ciclo pela rota /health, o percentil 95 (147.01ms) permaneceu 70% abaixo do limite maximo estabelecido (500ms), com zero falhas sob concorrencia.
