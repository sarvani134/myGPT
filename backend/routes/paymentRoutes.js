import express from "express"
import { captureOrder, createOrder, generateAccessToken, paymentTest } from "../controllers/paymentControllers.js"
import { checkJwt } from "../middlewares/authMiddleware.js";

const router=express.Router()

router.get("/test",paymentTest)

router.post("/createOrder",checkJwt,createOrder)

router.post("/captureOrder",checkJwt,captureOrder)

export default router
