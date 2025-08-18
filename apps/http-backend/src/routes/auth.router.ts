import { Router } from "express";
import middleware from "../middleware/middleware";
import {
  infoController,
  signInController,
  signOutController,
  signUpController,
} from "../controllers/auth.controller";

const authRouter: Router = Router();

authRouter.route("/signup").post(signUpController);
authRouter.route("/signin").post(signInController);
authRouter.route("/sigout").post(signOutController);
authRouter.route("/info").get(middleware, infoController);

export default authRouter;
