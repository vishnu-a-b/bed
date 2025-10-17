import { Request, Response, NextFunction } from "express";

export const paymentDeleteDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
     #swagger.tags = ['BedPaymentIn']
     #swagger.description = 'Delete a bed payment (India) record by ID - requires admin authorization'
     #swagger.parameters['id'] = { description: 'Payment ID', in: 'path', required: true, type: 'string' }
     #swagger.responses[200] = {
      description: 'Payment deleted successfully',
      schema: {
        success: true,
        message: 'Payment deleted successfully'
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
