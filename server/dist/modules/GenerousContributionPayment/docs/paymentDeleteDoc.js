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
exports.paymentDeleteDoc = void 0;
const paymentDeleteDoc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    /*
       #swagger.tags = ['GenerousContributionPayment']
       #swagger.description = 'Delete a generous contribution payment (Australia) record by ID - requires admin authorization'
       #swagger.parameters['id'] = { description: 'Payment ID', in: 'path', required: true, type: 'string' }
       #swagger.responses[200] = {
        description: 'Payment deleted successfully',
        schema: {
          success: true,
          message: 'Payment deleted successfully'
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
exports.paymentDeleteDoc = paymentDeleteDoc;
