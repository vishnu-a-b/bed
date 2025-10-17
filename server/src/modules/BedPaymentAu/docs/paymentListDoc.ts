import { Request, Response, NextFunction } from "express";

export const paymentListDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
     #swagger.tags = ['BedPaymentAu']
     #swagger.description = 'Get list of bed payments (Australia) with filtering, sorting and pagination'
     #swagger.parameters['supporter'] = { description: 'Filter by supporter ID', in: 'query', type: 'string' }
     #swagger.parameters['bed'] = { description: 'Filter by bed ID', in: 'query', type: 'string' }
     #swagger.parameters['status'] = { description: 'Filter by payment status', in: 'query', type: 'string', enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'] }
     #swagger.parameters['paymentMode'] = { description: 'Filter by payment mode', in: 'query', type: 'string', enum: ['online', 'offline'] }
     #swagger.parameters['limit'] = { description: 'Number of items per page', in: 'query', type: 'number' }
     #swagger.parameters['skip'] = { description: 'Number of items to skip', in: 'query', type: 'number' }
     #swagger.responses[200] = {
      description: 'List of bed payments (Australia) retrieved successfully',
      schema: {
        success: true,
        data: {
          total: 1,
          limit: 10,
          skip: 0,
          items: [
            {
              _id: "65cd9d8d5cae5ffc348ed638",
              receiptNumber: "BED-2024-000123",
              paypal_order_id: "ORDER123",
              paypal_payment_id: "PAYMENT123",
              supporter: "65cd9d8d5cae5ffc348ed638",
              bed: "65cd9d8d5cae5ffc348ed638",
              amount: 500,
              currency: "AUD",
              status: "completed",
              paypal_status: "COMPLETED",
              contribution: {
                purpose: "bed_donation",
                description: "Bed sponsorship"
              },
              paymentMode: "online",
              paymentDate: "2024-02-17T07:50:12.025Z",
              isApproved: true,
              createdAt: "2024-02-17T07:50:12.025Z",
              updatedAt: "2024-02-17T07:50:12.025Z",
            }
          ]
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
