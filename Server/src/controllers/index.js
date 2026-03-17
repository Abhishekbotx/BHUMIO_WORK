import ProductService from "../services/index.js";
import ProductRepository from "../repositories/index.js";
import { StatusCodes } from "../utils/http_statuscode.js";
const productService = new ProductService(new ProductRepository());
import AppError from "../errors/app.error.js";

function mainController(req, res) {
    return res.status(StatusCodes.OK).json({message: 'Main controller is up'});

}

async function createTransaction(req, res, next) {
  try {
    const { email, amount } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      throw new AppError(
        "BadRequestError",
        "Missing fields",
        "email is required",
        StatusCodes.BAD_REQUEST
      );
    }
    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      throw new AppError(
        "BadRequestError",
        "Invalid amount",
        "amount must be a positive number",
        StatusCodes.BAD_REQUEST
      );
    }
     const headerKey =req.get("Idempotency-Key") ||  null;
    const bodyKey = req.body.idempotencyKey
    const idempotencyKey =headerKey || bodyKey 

    const result = await productService.createOrRetryTransaction(
      email,
      amount,
      idempotencyKey
    );

    return res.status(result.httpStatus).json({
      success: result.httpStatus < 400,
      data: result.transaction,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

  async function getAllTransactions(req, res, next) {
    try {
        const transactions = await productService.getAllTransactions();
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Transactions fetched successfully",
            error: {},
            data: transactions
        });
    } catch (error) {
        next(error);
    }
  }

export {
    mainController,
    createTransaction,
    getAllTransactions
}