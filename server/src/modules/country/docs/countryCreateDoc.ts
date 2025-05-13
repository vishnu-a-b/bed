import { Request, Response, NextFunction } from "express";

export const countryCreateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  /*  
          #swagger.tags = ['country']
          #swagger.consumes = ['multipart/form-data']
          #swagger.parameters["name"] = {
            "in": "formData",
            "required": true,
            "type": "string",
            "description": "Name of the country"
          }
          #swagger.parameters["organization"] = {
            "in": "formData",
            "required": true,
            "type": "string",
            "description": "ID of the associated organization"
          }
          #swagger.parameters["flag"] = {
            "in": "formData",
            "required": false,
            "type": "file",
            "description": "Country flag image file"
          }
          #swagger.parameters["currency"] = {
            "in": "formData",
            "required": true,
            "type": "string",
            "description": "Currency code (e.g., USD, EUR)",
            "example": "USD"
          }
          #swagger.parameters["head"] = {
            "in": "formData",
            "required": true,
            "type": "string",
            "description": "ID of the country head/user"
          }
          
          #swagger.security = [
            {
              JWT: []
            }
          ]
          
          
      */
  next();
};