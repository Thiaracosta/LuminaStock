import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger';
import { produtoRoutes } from './routes/produto.routes';
import { pedidoRoutes } from './routes/pedido.routes';
import { logger } from './logger';

export const app = express();

app.use(express.json());

// Log estruturado de todas as requisições recebidas
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info({ metodo: req.method, rota: req.url }, 'Requisicao recebida');
  next();
});

// Documentação interativa Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota de Health Check
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', servico: 'LuminaStock API rodando 🚀' });
});

// Conecta as rotas separadas
app.use('/produtos', produtoRoutes);
app.use('/pedidos', pedidoRoutes);

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT);
}