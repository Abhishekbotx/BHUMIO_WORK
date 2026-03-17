import dotenv from "dotenv"
dotenv.config()

const Env = {
  PORT: process.env.PORT,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  MONGODB_URL: process.env.MONGODB_URL
};

export const { PORT, GEMINI_API_KEY, MONGODB_URL } = Env;