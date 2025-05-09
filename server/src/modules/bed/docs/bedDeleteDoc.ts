import { Request, Response, NextFunction } from "express";

export const bedDeleteDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 
     #swagger.tags = ['bed']
    #swagger.security = [
      {
        JWT: []
      }
    ] 
  */
  next();
};
