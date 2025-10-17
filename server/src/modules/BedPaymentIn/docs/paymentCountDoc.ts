import { Request, Response, NextFunction } from "express";

export const paymentCountDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
    #swagger.tags = ['BedPaymentIn']
    #swagger.description = 'Get total count of bed payments (India) with optional filters'
    #swagger.parameters['supporter'] = { description: 'Filter by supporter ID', in: 'query', type: 'string' }
    #swagger.parameters['bed'] = { description: 'Filter by bed ID', in: 'query', type: 'string' }
    #swagger.parameters['status'] = { description: 'Filter by payment status', in: 'query', type: 'string' }
    #swagger.parameters['paymentMode'] = { description: 'Filter by payment mode', in: 'query', type: 'string', enum: ['online', 'offline'] }
    #swagger.responses[200] = {
      description: 'Total payments count retrieved successfully',
      schema: {
        success: true,
        data: {
          count: 150
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
