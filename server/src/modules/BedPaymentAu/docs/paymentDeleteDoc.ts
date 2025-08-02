import { Request, Response, NextFunction } from "express";

export const paymentDeleteDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 
     #swagger.tags = ['payment']
    #swagger.security = [
      {
        JWT: []
      }
    ] 
  */
  next();
};
