import { Request, Response, NextFunction } from "express";

export const countryDeleteDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 
     #swagger.tags = ['country']
    #swagger.security = [
      {
        JWT: []
      }
    ] 
  */
  next();
};
