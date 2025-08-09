import { Router } from "express";
import middleware from "../middleware/middleware";
import {
  getAllChatMessages,
  getAllDraws,
  getHomeInfo,
} from "../controllers/content.controller";

const contentRouter: Router = Router();

contentRouter.use(middleware);

contentRouter.route("/home").get(getHomeInfo);
contentRouter.route("/chats/:roomId").get(getAllChatMessages);
contentRouter.route("/draws/:roomId").get(getAllDraws);

export default contentRouter;
