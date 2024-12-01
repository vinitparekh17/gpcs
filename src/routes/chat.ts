import { getConversation } from "../controllers/messageController.ts";
import passport from "passport";
import { Router } from "express";

const chatRouter = Router();

chatRouter
  .route("/:uid")
  .get(passport.authenticate("jwt", { session: false }), getConversation);

export default chatRouter;
