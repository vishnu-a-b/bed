import { Request, Response, NextFunction } from "express";

export const supporterCreateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
          #swagger.tags = ['Supporter']
          #swagger.description = 'Create a new supporter/sponsor for a bed'
          #swagger.parameters['parameter_name'] = {
            in: 'body',
            description: 'Supporter details',
            schema: {
              user: "65cd9d8d5cae5ffc348ed638",
              name: "John Doe",
              panNo: "ABCDE1234F",
              nameVisible: true,
              bed: "65cd9d8d5cae5ffc348ed638",
              startDate: "2024-01-01T00:00:00.000Z",
              endDate: "2024-12-31T23:59:59.999Z",
              role: "head",
              type: "individual",
              isActive: true,
              amount: 5000,
              verificationStatus: "verified",
              address: "123 Main St, City, State, ZIP"
            }
          }
      */
  next();
};
