import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {  //who subscribe us
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    channel: {   //to whom we subscribe
        type: mongoose.Types.ObjectId,
        ref: "User"
    }

})
export const Subscription = mongoose.model("Subscription", subscriptionSchema)