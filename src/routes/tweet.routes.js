import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";


const router = Router()


router.route("/").post(verifyJWT, createTweet) //create a new tweet
router.route("/:userId").get(getUserTweets)  //find tweets of a user
router.route("/:tweetId").patch(verifyJWT, updateTweet) //update a tweet
router.route("/:tweetId").delete(verifyJWT, deleteTweet) //delete a tweet.

export default router