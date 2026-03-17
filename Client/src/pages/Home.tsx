import { useCallback, useEffect, useMemo, useState } from "react";
import Form from "../components/Form";
import {
  getOrCreateIdempotencyKey,
  listTransactions,
  submitTransactionWithRetry
} from "../services/transactions";
import type { SubmitState, Transaction, TransactionFormData } from "../interfaces";



const MAX_ATTEMPTS = 4;

const Home = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [submitState, setSubmitState] = useState<SubmitState>({ phase: "normal" });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const items = await listTransactions();
      setTransactions(items);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isSubmitting = submitState.phase === "pending";

  const statusBanner = useMemo(() => {
    switch (submitState.phase) {
      case "pending":
        return `Pending… attempt ${submitState.attempt}/${MAX_ATTEMPTS}`

      case "success":
        return "Success. Transaction recorded."

      case "failed":
        return `Failed. ${submitState.message}`

      default:
        return null;
    }
  }, [submitState]);

  const onSubmit = useCallback(
    async (data: TransactionFormData) => {
      if (isSubmitting) return;

      const idempotencyKey = getOrCreateIdempotencyKey(data.email, data.amount);
      setSubmitState({ phase: "pending", idempotencyKey, attempt: 1 });

      const result = await submitTransactionWithRetry({
        email: data.email,
        amount: data.amount,
        idempotencyKey,
        maxAttempts: MAX_ATTEMPTS,
        onAttempt: (attempt) =>
          setSubmitState({ phase: "pending", idempotencyKey, attempt }),
      });

      await refresh();

      if (result.ok) {
        if (result.transaction.status === "failed") {
          setSubmitState({
            phase: "failed",
            idempotencyKey,
            message:
              "Retry limit reached",
          });
          return;
        }
        setSubmitState({ phase: "success", idempotencyKey });
        return;
      }

      setSubmitState({
        phase: "failed",
        idempotencyKey,
        message:
          result.status === 503
            ? "Temporary failure after retry limit."
            : `Request failed (${result.status}).`,
      });
    },
    [isSubmitting, refresh]
  );

  return (
    <div className="min-h-screen min-w-screen bg-gray-100">
      <div className="max-w-[70] mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                Transactions
              </h1>
            </div>

            {statusBanner && (
              <div
                className="mb-4 border rounded-md px-3 py-2 text-sm text-black"
              >
                {statusBanner}
              </div>
            )}

            {transactions.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflowx-hidden overflow-y-auto max-h-[calc(100vh-10rem)]">
                {transactions.map((t) => (
                  <div
                    key={t._id}
                    className="p-4 flex flex-col gap-2"
                  >
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-700">
                      <div>
                        <span className="font-medium text-gray-900">
                          Email:
                        </span>{" "}
                        {t.email}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Amount:
                        </span>{" "}
                        {t.amount}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Status:
                        </span>{" "}
                        <span
                        >
                          {t.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-700">No transactions yet.</p>
            )}
          </div>

          <div className="w-90">
            <Form onSubmit={onSubmit} disabled={isSubmitting} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;