import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
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


/////////////////Get Tweets/////////////////////
/* 1. Tweets should be visible to everyone. So anyone visiting a profile should get tweets.
   2. We get the user id from the url.
*/
const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    const user = await User.findOne({username: userId})

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const getTweets = await Tweet.find({owner: user._id})

    if(!getTweets){
        throw new ApiError(404, "No tweets found")
    }

    return res.status(200).json(new ApiResponse(200, "User tweets", getTweets))

    
});

const updateTweet = asyncHandler(async(req, res) => {
    const {tweetId} = req.params;
    const {content} = req.body;

    if(!tweetId || !content){
        throw new ApiError(400, "Tweet id and content are required")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const findTweet = await Tweet.findOne({
       _id: tweetId
    })

    if(!findTweet) {
        throw new ApiError(404, "Tweet not found")
    }

    findTweet.content = content;

    await findTweet.save();

    return res.status(200).json(new ApiResponse(200, "Tweet updated", findTweet))
})

const deleteTweet = asyncHandler(async(req, res) => {
    const {tweetId} = req.params;

    if(!tweetId){
        throw new ApiError(400, "Tweet id is required")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const findTweet = await Tweet.findByIdAndDelete({
        _id: tweetId
    })

    return res.status(200).json(new ApiResponse(200, "Tweet deleted", findTweet))


})





export { createTweet, getUserTweets, updateTweet, deleteTweet}