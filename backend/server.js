import dotenv from "dotenv";
import express from "express";

import mongoose from "mongoose";

import Thread from "./models/ThreadSchema.js";
import threadRouter from "./routes/threadRouter.js"
import cors from "cors"

dotenv.config();
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
app.use(cors())

app.use(express.json());

const PORT = 5000;

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.CONNECTION_STRING);

        console.log("MongoDB connected successfully");
    } catch (err) {
        console.log("MongoDB connection failed:", err);
        throw err;
    }
};

app.get("/", (req, res) => {
    res.json({
        msg: "welcome home"
    });
});

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        });

    } catch (err) {
        console.log("Server could not start");
    }
};

startServer();
app.use("/thread",threadRouter)

