import { Request, Response, NextFunction } from "express";

export const paymentUpdateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
          #swagger.tags = ['GenerousContributionPayment']
          #swagger.description = 'Update a generous contribution payment (Australia) record'
          #swagger.parameters['id'] = { description: 'Payment ID', in: 'path', required: true, type: 'string' }
          #swagger.parameters['parameter_name'] = {
            in: 'body',
            description: 'Payment update details',
            schema: {
              status: "completed",
              isApproved: true,
              remarks: "Payment verified",
              transactionReference: "TXN123456"
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
