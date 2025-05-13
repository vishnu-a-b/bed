import { Request, Response, NextFunction } from "express";

export const bedCreateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*  
    #swagger.tags = ['Bed']
    #swagger.summary = 'Create or update a bed'
    #swagger.parameters['organization'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'Organization ID'
    }
    #swagger.parameters['country'] = {
      in: 'formData',
      required: true,
      type: 'string',
      description: 'Country ID'
    }
    #swagger.parameters['bedNo'] = {
      in: 'formData',
      required: true,
      type: 'number',
      description: 'Bed number'
    }
    #swagger.parameters['maxNoContributer'] = {
      in: 'formData',
      type: 'number',
      default: 15,
      description: 'Maximum number of contributors'
    }
    #swagger.parameters['amount'] = {
      in: 'formData',
      type: 'number',
      description: 'Minimum contribution amount'
    }
    #swagger.parameters['patientName'] = {
      in: 'formData',
      type: 'string',
      description: 'Patient name (optional)'
    }
    #swagger.parameters['head'] = {
      in: 'formData',
      type: 'string',
      description: 'Head user ID'
    }
    #swagger.parameters['vcLink'] = {
      in: 'formData',
      type: 'string',
      description: 'Video conference link (optional)'
    }
    #swagger.security = [{
      "JWT": []
    }]
  */
  next();
};