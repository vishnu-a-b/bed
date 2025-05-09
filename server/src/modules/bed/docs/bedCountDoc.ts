import { Request, Response, NextFunction } from "express";

export const bedCountDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 
    #swagger.tags = ['bed']
    #swagger.responses[200] = {
      description: 'Endpoint to get total beds count',
    }
    #swagger.security = [
      {
        JWT: []
      }
    ] 
  */
  next();
};
