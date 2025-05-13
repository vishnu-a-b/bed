import { Request, Response, NextFunction } from "express";

export const supporterUpdateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*  
          #swagger.tags = ['supporter']
          #swagger.parameters['parameter_name'] = {
            in: 'body',
            description: 'Endpoint to update a supporter',
            schema: {
              schema: {
              name: "string",
              country: "65cd9d8d5cae5ffc348ed638",
              organization: "65cd9d8d5cae5ffc348ed638",
              role: "string",
              joinDate: "string",
            }
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
