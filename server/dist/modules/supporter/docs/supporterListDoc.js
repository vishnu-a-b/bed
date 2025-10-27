"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supporterListDoc = void 0;
const supporterListDoc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    /*
       #swagger.tags = ['Supporter']
       #swagger.description = 'Get list of supporters/sponsors with filtering, sorting and pagination'
       #swagger.parameters['user'] = { description: 'Filter by user ID', in: 'query', type: 'string' }
       #swagger.parameters['bed'] = { description: 'Filter by bed ID', in: 'query', type: 'string' }
       #swagger.parameters['isActive'] = { description: 'Filter by active status', in: 'query', type: 'boolean' }
       #swagger.parameters['limit'] = { description: 'Number of items per page', in: 'query', type: 'number' }
       #swagger.parameters['skip'] = { description: 'Number of items to skip', in: 'query', type: 'number' }
       #swagger.responses[200] = {
        description: 'List of supporters retrieved successfully',
        schema: {
          success: true,
          data: {
            total: 1,
            limit: 10,
            skip: 0,
            items: [
              {
                _id: "65cd9d8d5cae5ffc348ed638",
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
                address: "123 Main St, City",
                createdAt: "2024-02-17T07:50:12.025Z",
                updatedAt: "2024-02-17T07:50:12.025Z",
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
});
exports.supporterListDoc = supporterListDoc;
