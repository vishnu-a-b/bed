import { Request, Response, NextFunction } from "express";

export const paymentCreateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
          #swagger.tags = ['BedPaymentAu']
          #swagger.description = 'Create a bed payment (Bed Sponsorship) - Used by client_bed app - Supports PayPal online and offline payment modes'
          #swagger.parameters['parameter_name'] = {
            in: 'body',
            description: 'Bed sponsorship payment details for Australia',
            schema: {
              supporter: "65cd9d8d5cae5ffc348ed638",
              bed: "65cd9d8d5cae5ffc348ed638",
              amount: 500,
              currency: "AUD",
              contribution: {
                purpose: "bed_donation",
                description: "Bed sponsorship donation"
              },
              paymentMode: "online",
              manualMethod: "bank_transfer",
              transactionReference: "TXN123456",
              remarks: "Bed sponsorship payment",
              source: "website"
            }
          }
      */
  next();
};
