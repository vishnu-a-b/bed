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
exports.bedDetailsDoc = void 0;
const bedDetailsDoc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    /*
       #swagger.tags = ['bed']
       #swagger.responses[200] = {
        description: 'Endpoint to get bed details',
        schema: {
          success: true,
          data: {
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
exports.bedDetailsDoc = bedDetailsDoc;
