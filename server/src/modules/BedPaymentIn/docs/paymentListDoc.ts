import { Request, Response, NextFunction } from "express";

export const paymentListDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
     #swagger.tags = ['BedPaymentIn']
     #swagger.description = 'Get list of bed payments (India) with filtering, sorting and pagination support'
     #swagger.parameters['supporter'] = { description: 'Filter by supporter ID', in: 'query', type: 'string' }
     #swagger.parameters['bed'] = { description: 'Filter by bed ID', in: 'query', type: 'string' }
     #swagger.parameters['status'] = { description: 'Filter by payment status', in: 'query', type: 'string', enum: ['captured', 'failed', 'pending'] }
     #swagger.parameters['paymentMode'] = { description: 'Filter by payment mode', in: 'query', type: 'string', enum: ['online', 'offline'] }
     #swagger.parameters['limit'] = { description: 'Number of items per page', in: 'query', type: 'number' }
     #swagger.parameters['skip'] = { description: 'Number of items to skip', in: 'query', type: 'number' }
     #swagger.responses[200] = {
      description: 'List of bed payments retrieved successfully',
      schema: {
        success: true,
        data: {
          total: 1,
          limit: 10,
          skip: 0,
          items: [
            {
              _id: "65cd9d8d5cae5ffc348ed638",
              razorpay_payment_id: "pay_xyz123",
              razorpay_order_id: "order_xyz123",
              razorpay_signature: "signature_xyz",
              amount: 10000,
              currency: "INR",
              status: "captured",
              method: "upi",
              email: "supporter@example.com",
              contact: "+919876543210",
              paymentMode: "online",
              supporter: "65cd9d8d5cae5ffc348ed638",
              bed: "65cd9d8d5cae5ffc348ed638",
              isVerified: true,
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
