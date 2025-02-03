import { Tweet } from "../models/tweet.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


/////////////////Create Tweet/////////////////////
/* 1. Get the tweet content from the request body.
   2. Check if the tweet content is not empty.
   3. Create a new tweet in the database.
   4. Send response with the created tweet
*/

const createTweet = asyncHandler(async(req, res) => {
    const {tweetContent} = req.body;

    if(!tweetContent){
        throw new ApiError(400, "Tweet content is required")
    }

    const postTweet = await Tweet.create({
        content: tweetContent,
        owner: req.user?._id
    })

    if(!postTweet){
        throw new ApiError(500, "Error posting tweet. Please try again")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet posted", tweetContent))



})

const getUserTweets = asyncHandler(async() => {})


export { createTweet, getUserTweets}