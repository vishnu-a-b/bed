import { Request, Response, NextFunction } from "express";

export const paymentDeleteDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
     #swagger.tags = ['payment-ind']
     #swagger.responses[200] = {
      description: 'Endpoint to delete payment (India)',
      schema: {
        success: true,
        data: {
          message: "Payment deleted successfully"
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
