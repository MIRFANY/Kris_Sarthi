import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, 
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: String,
    location: String, // city name for weather API
    language: {
        type: String,
        default: "en",
    },
    selectedCrops: [String],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


//hash the password before saving

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();
    this.password = await bcryptjs.hash(this.password, 10);
    next();
});

export default mongoose.model("User", userSchema);