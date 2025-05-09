import { Request, Response, NextFunction } from "express";

export const countryUpdateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*  
          #swagger.tags = ['country']
          #swagger.parameters['parameter_name'] = {
            in: 'body',
            description: 'Endpoint to update an country',
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
