import { Request, Response, NextFunction } from "express";

export const bedListDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 
    #swagger.tags = ['Bed']
    #swagger.summary = 'Get list of beds with pagination'
    #swagger.description = 'Endpoint to retrieve a paginated list of beds with filtering options'
    
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of items per page',
      type: 'integer',
      default: 10
    }
    #swagger.parameters['skip'] = {
      in: 'query',
      description: 'Number of items to skip',
      type: 'integer',
      default: 0
    }
    #swagger.parameters['search'] = {
      in: 'query',
      description: 'Search term (filters by bed number or patient name)',
      type: 'string',
      required: false
    }
    
    #swagger.parameters['organization'] = {
      in: 'query',
      description: 'Filter by organization ID',
      type: 'string',
      required: false
    }
    #swagger.parameters['country'] = {
      in: 'query',
      description: 'Filter by country ID',
      type: 'string',
      required: false
    }

    #swagger.responses[200] = {
      description: 'Successful operation',
      schema: {
        success: true,
        data: {
          total: 1,
          limit: 10,
          skip: 0,
          items: [
            {
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
          ]
        }
      }
    }
    
    #swagger.security = [{
      "JWT": []
    }]
  */
  next();
};