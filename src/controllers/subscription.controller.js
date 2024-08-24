import { Subscription } from "../models/subscription.models.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const toggleSubscribeChannel = AsyncHandler(async (req, res) => {
    const subscriber = req.user?._id;
    const { username } = req.params;

    if (!username?.trim()) {
        return res.status(400).json({ message: "Channel is missing" });
    }

    // console.log(username)
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).json({ message: "User does not exist" });
    }


    if (user._id.equals(subscriber)) {
        return res.status(400).json({ message: "You cannot subscribe to your own channel" });
    }


    const existingSubscription = await Subscription.findOne({
        subscriber,
        channel: user._id,
    });

    if (existingSubscription) {

        await Subscription.deleteOne({ _id: existingSubscription._id });
        return res.status(200).json({ message: "Unsubscribed successfully" });
    } else {

        await Subscription.create({
            subscriber,
            channel: user._id,
        });
        return res.status(200).json({ message: "Subscribed successfully" });
    }
});

export default toggleSubscribeChannel;
