import { Request, Response, NextFunction } from "express";

export const paymentCreateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*  
          #swagger.tags = ['payment']
          #swagger.parameters['parameter_name'] = {
            in: 'body',
            description: 'Endpoint to create a payment',
            schema: {
              name: "string",
              user: "65cd9d8d5cae5ffc348ed638",
              country: "65cd9d8d5cae5ffc348ed638",
              organization: "65cd9d8d5cae5ffc348ed638",
              role: "string",
              type: "string",
              joinDate: "string",
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
