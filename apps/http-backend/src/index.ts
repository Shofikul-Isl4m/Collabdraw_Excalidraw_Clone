import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.router";
import roomRouter from "./routes/room.router";
import contentRouter from "./routes/content.router";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/room", roomRouter);
app.use("/api/v1/content", contentRouter);

app.listen(3001, () => {
  console.log("✅ Server is running on http://localhost:3001");
});
