import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {


    /*we try to get the access token from cookies. But if it not in cookies and it was a mobile app which sends the token in the header, we try to get it from the header. The header includes this syntax: Bearer <token>. So, we remove the Bearer and space( ) and then we try to get the token from the header.*/
    
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        if(!token) {
            throw new ApiError(401, "Unauthorized request.")
        }
    
        //we decode the token by using jwt.verify. we improved jwt from jsonwebtoken library.
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user) {
            throw new ApiError(401, "Invalid access token.")
        }    
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message)
    }

    
})