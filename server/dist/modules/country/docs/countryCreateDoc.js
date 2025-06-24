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
exports.countryCreateDoc = void 0;
const countryCreateDoc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.countryCreateDoc = countryCreateDoc;
