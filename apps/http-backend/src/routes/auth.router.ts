import { Router } from "express";
import middleware from "../middleware/middleware";

const authRouter: Router = Router();

authRouter.route("/signup").post(signUpController);
authRouter.route("/signin").post(signInController);
authRouter.route("/sigout").post(signOutController);
authRouter.route("/info").post(middleware, infoController);

export default authRouter;
