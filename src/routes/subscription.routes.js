import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";



const router = Router();


router.route("/c/:channelId").post(verifyJWT, toggleSubscription)
router.route("/c/:channelId").get(getSubscribedChannels)


router.route("/u/:channelId").get(getUserChannelSubscribers);


export default router;