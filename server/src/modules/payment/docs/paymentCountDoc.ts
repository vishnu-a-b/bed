import { Request, Response, NextFunction } from "express";

export const paymentCountDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 
    #swagger.tags = ['payment']
    #swagger.responses[200] = {
      description: 'Endpoint to get total payments count',
    }
    #swagger.security = [
      {
        JWT: []
      }
    ] 
  */
  next();
};
