import express, { Request, Response } from 'express';
import { produtoRoutes } from './routes/produto.routes';
import { pedidoRoutes } from './routes/pedido.routes';

export const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', servico: 'LuminaStock API rodando 🚀' });
});


app.use('/produtos', produtoRoutes);
app.use('/pedidos', pedidoRoutes);

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => {
    console.log('API LuminaStock rodando na porta 3000 🚀');
  });
}