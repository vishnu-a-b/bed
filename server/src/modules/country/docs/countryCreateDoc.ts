import { Request, Response, NextFunction } from "express";

export const countryCreateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*  
          #swagger.tags = ['country']
          #swagger.parameters['parameter_name'] = {
            in: 'body',
            description: 'Endpoint to create a country',
            schema: {
              name: "string",
              organization: "string",
              head: "string"
            }
          } 
          
          #swagger.security = [
            {
              JWT: []
            }
          ] 
      */
  next();
};
