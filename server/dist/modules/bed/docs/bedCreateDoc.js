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
exports.bedCreateDoc = void 0;
const bedCreateDoc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.bedCreateDoc = bedCreateDoc;
