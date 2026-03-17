import {useState } from "react";
import type { FormProps, TransactionFormData } from "../interfaces";



const Form = ({ onSubmit, disabled = false }: FormProps) => {
  const [data, setData] = useState<TransactionFormData>({
    email: "",
    amount: 0,
  });

  return (
    <form
      className="bg-white rounded-lg flex flex-col gap-4 p-5 border border-black"
      onSubmit={(e) => {
        e.preventDefault();
        if (disabled ) return;
        onSubmit({ email: data.email.trim(), amount: data.amount });
      }}
    >
      <div className="flex flex-col gap-2">
        <label className="text-black font-medium" htmlFor="Email">
          Email
        </label>
        <input
          value={data.email}
          onChange={(e) => setData((p) => ({ ...p, email: e.target.value }))}
          className="border  rounded-md p-2 text-black "
          type="email"
          id="Email"
          placeholder="Please write your email here"
          autoComplete="email"
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-black font-medium" htmlFor="Amount">
          Amount
        </label>
        <input
          value={data.amount === 0 ? "" : String(data.amount)}
          onChange={(e) =>
            setData((p) => ({
              ...p,
              amount: e.target.value === "" ? 0 : Number(e.target.value),
            }))
          }
          className="border rounded-md p-2 text-black"
          type="number"
          id="Amount"
          required={true}
          placeholder="Please write the amount here"
          disabled={disabled}

        />
      </div>

      <button
        className="rounded-md text-white p-2 bg-black w-full disabled:opacity-60 disabled:cursor-not-allowed"
        type="submit"
        disabled={disabled }
      >
        {disabled ? "Submitting …" : "Submit"}
      </button>
    </form>
  )
}

export default Form