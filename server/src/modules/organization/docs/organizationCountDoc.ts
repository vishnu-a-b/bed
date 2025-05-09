import { Request, Response, NextFunction } from "express";

export const organizationCountDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 
    #swagger.tags = ['organization']
    #swagger.responses[200] = {
      description: 'Endpoint to total organization count',
    }
    #swagger.security = [
      {
        JWT: []
      }
    ] 
  */
  next();
};
