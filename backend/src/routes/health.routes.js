import { Router } from 'express';

const healthRouter = Router();

healthRouter.get('/', (request, response) => {
  response.status(200).json({
    success: true,
    message: 'Perpus SKB Kota Tegal API aktif',
    timestamp: new Date().toISOString()
  });
});

export default healthRouter;
