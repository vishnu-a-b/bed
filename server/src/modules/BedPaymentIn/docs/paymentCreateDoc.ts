import { Request, Response, NextFunction } from "express";

export const paymentCreateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
          #swagger.tags = ['BedPaymentIn']
          #swagger.description = 'Create a bed payment (India - Bed Sponsorship) - Used by client_bed app for India - Supports Razorpay online and offline payment modes'
          #swagger.parameters['parameter_name'] = {
            in: 'body',
            description: 'Bed sponsorship payment details for India',
            schema: {
              supporter: "65cd9d8d5cae5ffc348ed638",
              bed: "65cd9d8d5cae5ffc348ed638",
              amount: 10000,
              currency: "INR",
              status: "pending",
              method: "upi",
              email: "supporter@example.com",
              contact: "+919876543210",
              paymentMode: "online",
              manualMethod: "cash",
              transactionReference: "TXN123456",
              paymentDate: "2024-01-15T10:30:00.000Z",
              remarks: "Payment for bed sponsorship",
              razorpay_payment_id: "pay_xyz123",
              razorpay_order_id: "order_xyz123",
              razorpay_signature: "signature_xyz"
            }
          }
      */
  next();
};
