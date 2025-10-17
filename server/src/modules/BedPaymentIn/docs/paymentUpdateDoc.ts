import { Request, Response, NextFunction } from "express";

export const paymentUpdateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
          #swagger.tags = ['BedPaymentIn']
          #swagger.description = 'Update a bed payment (India) record - typically for manual/offline payments or status updates'
          #swagger.parameters['id'] = { description: 'Payment ID', in: 'path', required: true, type: 'string' }
          #swagger.parameters['parameter_name'] = {
            in: 'body',
            description: 'Payment update details',
            schema: {
              status: "captured",
              isVerified: true,
              remarks: "Payment verified",
              transactionReference: "TXN123456",
              paymentDate: "2024-01-15T10:30:00.000Z"
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
