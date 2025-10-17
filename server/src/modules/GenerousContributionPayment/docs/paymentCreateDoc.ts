import { Request, Response, NextFunction } from "express";

export const paymentCreateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
          #swagger.tags = ['GenerousContributionPayment']
          #swagger.description = 'Create a generous contribution payment (General Donations) - Used by client app - Supports PayPal online and offline payment modes'
          #swagger.parameters['parameter_name'] = {
            in: 'body',
            description: 'Generous contribution payment details for general donations',
            schema: {
              name: "John Doe",
              phNo: "+61412345678",
              email: "donor@example.com",
              address: "123 Main St, Sydney NSW 2000, Australia",
              amount: 500,
              currency: "AUD",
              contribution: {
                purpose: "general_donation",
                description: "General donation to support the cause"
              },
              paymentMode: "online",
              manualMethod: "bank_transfer",
              transactionReference: "TXN123456",
              remarks: "Generous contribution",
              source: "website"
            }
          }
      */
  next();
};
