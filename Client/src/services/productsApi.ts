
import { baseApi } from "../rtk-query/base-api";



export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransaction: builder.query<any, any>({
      query: () => ({
        url: "/getalltransactions",
        method: "GET"
      }),
      transformResponse: (response: any) => response.data,
    }),
    createTransaction: builder.mutation<
      { products: any; summary: string },
      { query: string }
    >({
      query: (body) => ({
        url: "/createtransaction",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLazyGetTransactionQuery,
  useCreateTransactionMutation
} = productsApi;

