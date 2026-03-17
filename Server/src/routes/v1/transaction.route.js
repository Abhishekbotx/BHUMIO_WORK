import express from "express";

import {
  mainController,
  createTransaction,
  getAllTransactions,
} from "../../controllers/index.js";

const transactionRouter = express.Router();

transactionRouter.get("/ping", mainController);

// Assignment: transactions API (preferred)
transactionRouter.post("/transactions", createTransaction);
transactionRouter.get("/transactions", getAllTransactions);

// Back-compat routes (older client)
transactionRouter.post("/createtransaction", createTransaction);
transactionRouter.get("/getalltransactions", getAllTransactions);



export default transactionRouter;
