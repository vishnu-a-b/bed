import { Request, Response, NextFunction } from "express";

export const countryDetailsDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 
     #swagger.tags = ['country']
     #swagger.responses[200] = {
      description: 'Endpoint to the details of a country',
      schema: {
        success: true,
        data: {
            _id: "65cd9d8d5cae5ffc348ed638",
            name: "string",
            organization: "string",
            head: "string",
            createdAt: "2024-02-15T05:53:06.960Z",
            updatedAt: "2024-02-15T05:53:06.960Z",
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
