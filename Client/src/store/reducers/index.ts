import { baseApi } from "../../rtk-query/base-api";

export const rootReducer = {
  [baseApi.reducerPath]: baseApi.reducer,
};

