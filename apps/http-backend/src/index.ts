import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routers/auth.router";
import roomRouter from "./routers/room.router";
import contentRouter from "./routers/content.router";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("api/v1/auth", authRouter);
app.use("api/v1/room", roomRouter);
app.use("api/v1/content", contentRouter);

app.listen(3001);
