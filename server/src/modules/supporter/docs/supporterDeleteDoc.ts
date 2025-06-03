import { Request, Response, NextFunction } from "express";

export const supporterDeleteDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 
     #swagger.tags = ['supporter']
    #swagger.security = [
      {
        JWT: []
      }
    ] 
  */
  next();
};
