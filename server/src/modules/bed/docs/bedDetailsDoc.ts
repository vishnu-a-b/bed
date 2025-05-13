import { Request, Response, NextFunction } from "express";

export const bedDetailsDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 
     #swagger.tags = ['bed']
     #swagger.responses[200] = {
      description: 'Endpoint to get bed details',
      schema: {
        success: true,
        data: {
              _id: "65cd9d8d5cae5ffc348ed638",
              bedNo: 101,
              patientName: "John Doe",
              maxNoContributer: 15,
              amount: 100,
              vcLink: "https://meet.example.com/room123",
              organization: {
                _id: "65cd9d8d5cae5ffc348ed638",
                name: "General Hospital"
              },
              country: {
                _id: "65cd9d8d5cae5ffc348ed639",
                name: "United States"
              },
              head: {
                _id: "65cd9d8d5cae5ffc348ed640",
                name: "Dr. Smith"
              },
              createdAt: "2024-02-17T07:50:12.025Z",
              updatedAt: "2024-02-17T07:50:12.025Z"
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
