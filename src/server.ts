import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger';
import { produtoRoutes } from './routes/produto.routes';
import { pedidoRoutes } from './routes/pedido.routes';

export const app = express();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', servico: 'LuminaStock API rodando 🚀' });
});

app.use('/produtos', produtoRoutes);
app.use('/pedidos', pedidoRoutes);

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  app.listen(3000);
}