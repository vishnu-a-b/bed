import { Request, Response, NextFunction } from "express";

export const organizationListofAdminDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 
     #swagger.tags = ['organization']
     #swagger.responses[200] = {
      description: 'Endpoint to get all organizationes of a organization admin',
      schema: {
        success: true,
        data: {
          total: 1,
          limit: 10,
          skip: 0,
          items: [
            {
              huid: "string",
              _id: "65cd9d8d5cae5ffc348ed638",
              name: "string",
              address: "string",
              photos: [
                "string"
              ],
              managementType: "string",
              contactMobileNumbers: [
                "string"
              ],
              contactLandlines: [
                "string"
              ],
              admin: "string",
              createdAt: "2024-02-15T05:53:06.960Z",
              updatedAt: "2024-02-15T05:53:06.960Z",
            }
          ]
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
