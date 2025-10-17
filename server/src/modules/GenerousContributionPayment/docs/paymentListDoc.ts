import { Request, Response, NextFunction } from "express";

export const paymentListDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
     #swagger.tags = ['GenerousContributionPayment']
     #swagger.description = 'Get list of generous contribution payments (Australia) with filtering, sorting and pagination'
     #swagger.parameters['status'] = { description: 'Filter by payment status', in: 'query', type: 'string', enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'] }
     #swagger.parameters['paymentMode'] = { description: 'Filter by payment mode', in: 'query', type: 'string', enum: ['online', 'offline'] }
     #swagger.parameters['currency'] = { description: 'Filter by currency', in: 'query', type: 'string' }
     #swagger.parameters['limit'] = { description: 'Number of items per page', in: 'query', type: 'number' }
     #swagger.parameters['skip'] = { description: 'Number of items to skip', in: 'query', type: 'number' }
     #swagger.responses[200] = {
      description: 'List of generous contribution payments retrieved successfully',
      schema: {
        success: true,
        data: {
          total: 1,
          limit: 10,
          skip: 0,
          items: [
            {
              _id: "65cd9d8d5cae5ffc348ed638",
              receiptNumber: "GC-2024-000123",
              paypal_order_id: "ORDER123",
              paypal_payment_id: "PAYMENT123",
              name: "John Doe",
              phNo: "+61412345678",
              email: "donor@example.com",
              address: "123 Main St, Sydney NSW 2000",
              amount: 500,
              currency: "AUD",
              status: "completed",
              paypal_status: "COMPLETED",
              contribution: {
                purpose: "general_donation",
                description: "General donation"
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
