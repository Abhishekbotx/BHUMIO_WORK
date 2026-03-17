import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRouter from "./routes/index.js";
import { PORT } from "./config/dotenv.config.js";
const app = express();
import dbConfig from "./config/db.config.js";
const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>server is running babu...</h1>");
});
app.use("/api", apiRouter);
const prepareAndStartServer = async () => {
  try {
    app.listen(PORT, () => {
      dbConfig();
      console.log(`Server running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start", error);
  }
};

prepareAndStartServer(); 