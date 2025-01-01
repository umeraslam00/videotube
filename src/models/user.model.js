import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true //This makes the field indexable. This makes it easy to search for it in database.
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    fullname: {
        type: String,
        required: true,
        index: true,
        trim: true
    },

    avatar: {
        type: String, //cloudinary url
        required: true
    },

    coverImage: {
        type: String
    },

    watchHistory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },

    password: {
        type: String,
        required: [true, "Password is required"],
    },

    refreshToken: {
        type: String
    },


}, { timestamps: true })

/* It is better to use function() instead of arrow function() here.
https://mongoosejs.com/docs/middleware.html#pre */

userSchema.pre("save", async function (next) {
    /* we only want to hash the password if it has been modified. Otherwise, this code will keep running everytime someone changes and saves any data like fullname, avatar, etc. So, we use the if statement.*/

    if (!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
    //The 10 is the salt rounds. how many rounds of encryption. we can set 3,4 etc.
    next()
})

/*
This code adds a method `isPasswordCorrect` to the `userSchema` that compares a provided password with the stored hashed password using `bcrypt.compare`. It returns a boolean indicating whether the passwords match. 

In other words, it checks if the provided password is correct for the user.
*/
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

/*
This code defines a method `generateAccessToken` for the `userSchema` that generates a JSON Web Token (JWT) containing the user's ID, username, email, and fullname. The token is signed with a secret key stored in the `ACCESS_TOKEN_SECRET` environment variable and expires after a duration specified in the `ACCESS_TOKEN_EXPIRY` environment variable.
*/
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email,
        fullname: this.fullname,
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })

}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })
}


export const User = mongoose.model("User", userSchema)