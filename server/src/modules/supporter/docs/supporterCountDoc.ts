import { Request, Response, NextFunction } from "express";

export const supporterCountDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 
    #swagger.tags = ['supporter']
    #swagger.responses[200] = {
      description: 'Endpoint to get total supporters count',
    }
    #swagger.security = [
      {
        JWT: []
      }
    ] 
  */
  next();
};
