import mongoose, { isValidObjectId } from "mongoose"
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Subscription } from "../models/subscription.model.js"
import ApiResponse from "../utils/ApiResponse.js"



const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // Sample URL: /c/677582069a9ddf860ea64291/

    // check if channelId is provided
    if(!channelId){
        throw new ApiError(400, "Channel ID is required")
    }

    //check if channelId is valid
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel ID")
    }

    //check if user is already subscribed to the channel or not.
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    })

    //unsubscribe if user is already subscribed (toggle subscription). It means user has pressed the subscribe button again in order to unsub.
    
    if(existingSubscription){
        await existingSubscription.deleteOne();
        return res.status(200).json(new ApiResponse(200, "Unsubscribed successfully", existingSubscription))
    }

    //if we have reached here, it means existing subscription doesn't exist and channel id is also valid. So, we let the user subscribe.

    const subscribe = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
    })

    if(!subscribe) {
        throw new ApiError(500, "Subscription failed")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, "Subscribed successfully", subscribe))



})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    /*
         example:
        channel:umer | subscriber: Ali
        channel:umer | subscriber: John
        Total subs: 2 (Ali, John)
   */
  
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(404, "Invalid channel ID")
    }

    const channelSubscribers = await Subscription.aggregate([
        { $match: { channel: new mongoose.Types.ObjectId(channelId) } }, // Match the channelId

        //Use $lookup when you need to enrich your documents with data from another collection.
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id", //// The field in the User schema
                as: "subscriberDetails" //// Alias for the resulting subscriber data
            }
        },

        {
            $unwind: "$subscriberDetails"
        },

        {
            $project: {
                _id: 0, // Remove the _id field
                username: "$subscriberDetails.username",
                email: "$subscriberDetails.email"
            }
        }

    ])

    if (!channelSubscribers || channelSubscribers.length === 0) {
        return res.status(200).json(new ApiResponse(200, "No subscribers found"))
    }

    return res.status(200).json(new ApiResponse(200, "Subscribers found", {
        subscribers: channelSubscribers,
        totalSubscribers: channelSubscribers.length
    }))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params


})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}