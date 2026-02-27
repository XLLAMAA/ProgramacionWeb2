// src/app.js
import express from "express";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// para acceder a carátulas también por /storage/<filename>
app.use("/storage", express.static("src/storage"));

app.use("/api", routes);

// siempre el último
app.use(errorMiddleware);

export default app;