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
exports.paymentCountDoc = void 0;
const paymentCountDoc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    /*
      #swagger.tags = ['BedPaymentIn']
      #swagger.description = 'Get total count of bed payments (India) with optional filters'
      #swagger.parameters['supporter'] = { description: 'Filter by supporter ID', in: 'query', type: 'string' }
      #swagger.parameters['bed'] = { description: 'Filter by bed ID', in: 'query', type: 'string' }
      #swagger.parameters['status'] = { description: 'Filter by payment status', in: 'query', type: 'string' }
      #swagger.parameters['paymentMode'] = { description: 'Filter by payment mode', in: 'query', type: 'string', enum: ['online', 'offline'] }
      #swagger.responses[200] = {
        description: 'Total payments count retrieved successfully',
        schema: {
          success: true,
          data: {
            count: 150
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
exports.paymentCountDoc = paymentCountDoc;
