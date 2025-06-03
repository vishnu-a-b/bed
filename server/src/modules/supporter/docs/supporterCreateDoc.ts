import { Request, Response, NextFunction } from "express";

export const supporterCreateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*  
          #swagger.tags = ['supporter']
          #swagger.parameters['parameter_name'] = {
            in: 'body',
            description: 'Endpoint to create a supporter',
            schema: {
              name: "string",
              user: "65cd9d8d5cae5ffc348ed638",
              country: "65cd9d8d5cae5ffc348ed638",
              organization: "65cd9d8d5cae5ffc348ed638",
              role: "string",
              type: "string",
              joinDate: "string",
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
