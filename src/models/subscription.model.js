import mongoose from "mongoose";


const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        //This is the user who is subscribing
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    channel: {
        //One to whom the user is subscribing.
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }

}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)