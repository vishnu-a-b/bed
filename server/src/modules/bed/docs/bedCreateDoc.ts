import { Request, Response, NextFunction } from "express";

export const bedCreateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*  
          #swagger.tags = ['bed']
          #swagger.parameters['parameter_name'] = {
            in: 'body',
            description: 'Endpoint to create a bed',
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
