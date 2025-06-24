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
exports.organizationListofAdminDoc = void 0;
const organizationListofAdminDoc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    /*
       #swagger.tags = ['organization']
       #swagger.responses[200] = {
        description: 'Endpoint to get all organizationes of a organization admin',
        schema: {
          success: true,
          data: {
            total: 1,
            limit: 10,
            skip: 0,
            items: [
              {
                huid: "string",
                _id: "65cd9d8d5cae5ffc348ed638",
                name: "string",
                address: "string",
                photos: [
                  "string"
                ],
                management: "string",
                contactMobileNumbers: [
                  "string"
                ],
                contactLandlines: [
                  "string"
                ],
                admin: "string",
                createdAt: "2024-02-15T05:53:06.960Z",
                updatedAt: "2024-02-15T05:53:06.960Z",
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
exports.organizationListofAdminDoc = organizationListofAdminDoc;
