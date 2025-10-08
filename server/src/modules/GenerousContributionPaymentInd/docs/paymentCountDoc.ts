import { Request, Response, NextFunction } from "express";

export const paymentCountDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
     #swagger.tags = ['payment-ind']
     #swagger.responses[200] = {
      description: 'Endpoint to get payment count (India)',
      schema: {
        success: true,
        data: {
          total: 1
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
