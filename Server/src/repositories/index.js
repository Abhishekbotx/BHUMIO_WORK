import Transaction from "../models/transaction.model.js";
import mongoose from "mongoose";
class ProductRepository {

    async createTransaction(email, amount, idempotencyKey) {

        const existing = await Transaction.findOne({ idempotencyKey });

        if (existing) {
            return existing;
        }

        const transaction = await Transaction.create({
            email,
            amount,
            status: "pending",
            idempotencyKey,
            retryCount: 0
        });

        return transaction;
    }

    async getAllTransactions() {
        return await Transaction.find({}).sort({ createdAt: -1 });
    }

    async findByIdempotencyKey(idempotencyKey) {
        return await Transaction.findOne({ idempotencyKey });
    }

    async findById(id) {
        return await Transaction.findById(id);
    }

}

export default ProductRepository;