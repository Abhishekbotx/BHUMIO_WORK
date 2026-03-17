export type TransactionFormData = {
  email: string;
  amount: number;
};

type FormProps = {
  disabled?: boolean;
  onSubmit: (data: TransactionFormData) => void;
};

type SubmitState =
  | { phase: "normal" }
  | { phase: "pending"; idempotencyKey: string; attempt: number }
  | { phase: "success"; idempotencyKey: string }
  | { phase: "failed"; idempotencyKey: string; message: string };


export type Transaction = {
  _id: string;
  email: string;
  amount: number;
  status: "pending" | "success" | "failed";
  retryCount: number;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
};  