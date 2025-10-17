import { Request, Response, NextFunction } from "express";

export const paymentCountDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
    #swagger.tags = ['GenerousContributionPayment']
    #swagger.description = 'Get total count of generous contribution payments (Australia) with optional filters'
    #swagger.parameters['status'] = { description: 'Filter by payment status', in: 'query', type: 'string' }
    #swagger.parameters['paymentMode'] = { description: 'Filter by payment mode', in: 'query', type: 'string', enum: ['online', 'offline'] }
    #swagger.responses[200] = {
      description: 'Total generous contribution payments count retrieved successfully',
      schema: {
        success: true,
        data: {
          count: 250
        }
      }
    }
    #swagger.security = [
      {
        JWT: []
      }
    ]
  */
  next();
};
