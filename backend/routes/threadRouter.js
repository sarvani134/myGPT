import express from "express"
import { addMessage, createThread, deleteThreadById, getMessages, getThreadById, getThreads, renameThread } from "../controllers/threadController.js"
import { checkJwt } from "../middlewares/authMiddleware.js";
const router=express.Router()

router.get("/getThreads",checkJwt,getThreads)
router.post("/createThread",checkJwt,createThread );
router.get("/getThread/:threadId",checkJwt,getThreadById)
router.post("/addMessage",checkJwt,addMessage)
router.get("/getMessages/:threadId",checkJwt,getMessages)
router.post("/renameThread",checkJwt,renameThread)

router.delete("/deleteThread/:threadId",checkJwt,deleteThreadById)

export default router
