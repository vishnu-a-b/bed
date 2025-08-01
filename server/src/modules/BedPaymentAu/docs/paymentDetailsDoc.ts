import { Request, Response, NextFunction } from "express";

export const paymentDetailsDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 
     #swagger.tags = ['payment']
     #swagger.responses[200] = {
      description: 'Endpoint to get payment details',
      schema: {
        success: true,
        data: {
              _id: "65cd9d8d5cae5ffc348ed638",
              name: "string",
              user: "65cd9d8d5cae5ffc348ed638",
              country: "65cd9d8d5cae5ffc348ed638",
              organization: "65cd9d8d5cae5ffc348ed638",
              roles: "string",
              joinDate: "string",
              createdBy: "65cd9d8d5cae4ffc348ed682",
              createdAt: "2024-02-17T07:50:12.025Z",
              updatedAt: "2024-02-17T07:50:12.025Z",
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
