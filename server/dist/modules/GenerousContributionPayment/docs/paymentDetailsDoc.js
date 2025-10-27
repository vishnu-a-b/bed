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
exports.paymentDetailsDoc = void 0;
const paymentDetailsDoc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    /*
       #swagger.tags = ['GenerousContributionPayment']
       #swagger.description = 'Get detailed information about a specific generous contribution payment (Australia) by ID'
       #swagger.parameters['id'] = { description: 'Payment ID', in: 'path', required: true, type: 'string' }
       #swagger.responses[200] = {
        description: 'Generous contribution payment details retrieved successfully',
        schema: {
          success: true,
          data: {
                _id: "65cd9d8d5cae5ffc348ed638",
                receiptNumber: "GC-2024-000123",
                paypal_order_id: "ORDER123",
                paypal_payment_id: "PAYMENT123",
                paypal_payer_id: "PAYER123",
                name: "John Doe",
                phNo: "+61412345678",
                email: "donor@example.com",
                address: "123 Main St, Sydney NSW 2000",
                payer: {
                  email_address: "donor@example.com",
                  payer_id: "PAYER123",
                  name: {
                    given_name: "John",
                    surname: "Doe"
                  }
                },
                amount: 500,
                currency: "AUD",
                status: "completed",
                paypal_status: "COMPLETED",
                contribution: {
                  purpose: "general_donation",
                  description: "General donation"
                },
                paymentMode: "online",
                paymentDate: "2024-02-17T07:50:12.025Z",
                isApproved: true,
                createdAt: "2024-02-17T07:50:12.025Z",
                updatedAt: "2024-02-17T07:50:12.025Z",
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
exports.paymentDetailsDoc = paymentDetailsDoc;
