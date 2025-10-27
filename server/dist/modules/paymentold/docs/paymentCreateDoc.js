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
exports.paymentCreateDoc = void 0;
const paymentCreateDoc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    /*
            #swagger.tags = ['payment']
            #swagger.parameters['parameter_name'] = {
              in: 'body',
              description: 'Endpoint to create a payment',
              schema: {
                name: "string",
                user: "65cd9d8d5cae5ffc348ed638",
                country: "65cd9d8d5cae5ffc348ed638",
                organization: "65cd9d8d5cae5ffc348ed638",
                role: "string",
                type: "string",
                joinDate: "string",
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
exports.paymentCreateDoc = paymentCreateDoc;
