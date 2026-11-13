import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger';
import { produtoRoutes } from './routes/produto.routes';
import { pedidoRoutes } from './routes/pedido.routes';
import { healthRoutes } from './routes/health.routes';
import { logger } from './logger';

export const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  /* istanbul ignore next */
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info({ metodo: req.method, rota: req.url }, 'Requisicao recebida');
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', servico: 'LuminaStock API rodando 🚀' });
});


app.use('/produtos', produtoRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/health', healthRoutes);

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT);
}