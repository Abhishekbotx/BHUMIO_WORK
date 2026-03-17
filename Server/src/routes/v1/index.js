import express from "express"
import productRouter from "./transaction.route.js"

const apiRouter=express.Router()
apiRouter.use("/", productRouter)   

export default apiRouter