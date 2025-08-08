import { Router } from "express";
import middleware from "../middleware/middleware";

const contentRouter: Router = Router();

contentRouter.use(middleware);

contentRouter.route("/home").get(getHomeInfoController);
contentRouter.route("/chats/:roomId").get(getAllChatMessagesController);
contentRouter.route("/draws/:roomId").get(getAllDrawsController);

export default contentRouter;
