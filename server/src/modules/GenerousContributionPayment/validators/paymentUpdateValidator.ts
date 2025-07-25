import { body } from "express-validator";


export const paymentUpdateValidator = [
  

  
  body("amount")
    .optional()
    .isNumeric()
    .withMessage("amount must be a number"),
];
