import { Request, Response, NextFunction } from "express";

export const bedUpdateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*  
          #swagger.tags = ['bed']
          #swagger.parameters['parameter_name'] = {
            in: 'body',
            description: 'Endpoint to update a bed',
            schema: {
              _id: "65cd9d8d5cae5ffc348ed638",
              bedNo: 101,
              patientName: "John Doe",
              maxNoContributer: 15,
              amount: 100,
              vcLink: "https://meet.example.com/room123",
              organization: "65cd9d8d5cae5ffc348ed638",
              country: "65cd9d8d5cae5ffc348ed639",
              head:  "65cd9d8d5cae5ffc348ed640",
              
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
