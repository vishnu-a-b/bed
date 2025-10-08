import { Request, Response, NextFunction } from "express";

export const paymentUpdateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*  
          #swagger.tags = ['payment']
          #swagger.parameters['parameter_name'] = {
            in: 'body',
            description: 'Endpoint to update a payment',
            schema: {
              schema: {
              name: "string",
              country: "65cd9d8d5cae5ffc348ed638",
              organization: "65cd9d8d5cae5ffc348ed638",
              role: "string",
              joinDate: "string",
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
