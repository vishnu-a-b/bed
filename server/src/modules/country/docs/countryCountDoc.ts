import { Request, Response, NextFunction } from "express";

export const countryCountDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 
    #swagger.tags = ['country']
    #swagger.responses[200] = {
      description: 'Endpoint to total countrys count',
    }
    #swagger.security = [
      {
        JWT: []
      }
    ] 
  */
  next();
};
