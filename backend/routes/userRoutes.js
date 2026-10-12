import express from "express"
import { getCurrentUser } from "../controllers/userController.js"
import { checkJwt } from "../middlewares/authMiddleware.js";

const router=express.Router()

router.get("/me",checkJwt,getCurrentUser)
export default router
