import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDb is connected");
  })
  .catch((err) => {
    console.log("MongoDb is not connected");
  });

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

app.use(express.static(path.join(__dirname, "..", "client", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"));
});

app.use((err, req,res,next)=>{
  const statusCode = err.statusCode || 500;
  const message= err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success:false,
    statusCode,
    message,
  });
});