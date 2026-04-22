import express from "express";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

app.get("/api/v1/ping", (req, res) => {
    res.status(200).json({ message: "pong", status: "running" });
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;