class ProductService {
  static MAX_RETRIES = 3;

  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async attemptTransaction(txn) {

    if (txn.retryCount >= ProductService.MAX_RETRIES) {
      txn.status = "failed";
      await txn.save();
      return {
        httpStatus: 200,
        transaction: txn,
        meta: { terminal: true, reason: "retry_limit_reached" },
      };
    }

    const random = Math.random();
    console.log("random::", random);


    if (random < 0.5) {
      txn.status = "success";
      await txn.save();
      return {
        httpStatus: 200,
        transaction: txn,
        meta: { outcome: "success" },
      };
    }

    if (random < 0.8) {
      txn.retryCount += 1;
      txn.status = "pending";
      await txn.save();
      return {
        httpStatus: 503,
        transaction: txn,
        meta: { outcome: "temporary_failure", retryCount: txn.retryCount },
      };
    }

    const delayedMs = 5000 + Math.floor(Math.random() * 5001);
    await this.sleep(delayedMs);
    txn.status = "success";
    await txn.save();
    return {
      httpStatus: 200,
      transaction: txn,
      meta: { outcome: "delayed_success", delayedMs },
    };
  }

  async createOrRetryTransaction(email, amount, idempotencyKey) {
    const existing =
      await this.productRepository.findByIdempotencyKey(idempotencyKey);

    if (existing && existing?.status === "success") {
      return {
        httpStatus: 200,
        transaction: existing,
        meta: { deduped: true, outcome: "already_terminal" },
      };
    }

    if (existing && existing?.status === "failed") {
      existing.status = "pending";
      existing.retryCount = 0;
      await existing.save();
    }

    const txn =existing ??(await this.productRepository.createTransaction(
        email,
        amount,
        idempotencyKey
      ));

    return await this.attemptTransaction(txn);
  }

  async getAllTransactions() {
    return await this.productRepository.getAllTransactions();
  }
}
export default ProductService;