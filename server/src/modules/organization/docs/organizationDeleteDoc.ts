import { Request, Response, NextFunction } from "express";

export const organizationDeleteDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 
     #swagger.tags = ['organization']
    #swagger.security = [
      {
        JWT: []
      }
    ] 
  */
  next();
};
