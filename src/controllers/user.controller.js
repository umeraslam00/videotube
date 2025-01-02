import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResonse from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    
    /*
     1. get user details from front-end.
     2. validation of data - make sure data not empty.
     3. check if user already exists. username, email.
     4. Check for images.
     5. Check for avatar.
     6. If images present, send them to cloudinary.
     7. create user object which contains data for DB - create entry in DB.
     8. Remove password and refresh token from response.
     9. check for user creation. if created, send response.
    */


    //Data Validation
    const {fullname, email, username, password} = req.body
    //console.log("email:", email)

    if (fullname === "") {
        throw new ApiError(400, "Fullname cannot be empty")
    }

    if (email === "") {
        throw new ApiError(400, "email cannot be empty")
    }

    if (password === "") {
        throw new ApiError(400, "password cannot be empty")
    }

    //check if user exists in Database.
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(409, "user already exists.")
    }

    //console.log("req.files: ", req.files)
    //console.log("req.body: ", req.body)



    //check for images and get local paths

    let avatarLocalPath = ""
    let coverImageLocalPath = ""

    if (req.files?.avatar && req.files?.avatar[0]) {
        avatarLocalPath = req.files?.avatar[0]?.path;
    }

    if (req.files?.coverImage && req.files?.coverImage[0]) {
         coverImageLocalPath = req.files?.coverImage[0]?.path;
    } else {
        coverImageLocalPath = ""
    }
    
    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    //send to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = coverImageLocalPath? await uploadOnCloudinary(coverImageLocalPath) : null

    if(!avatar) {
        throw new ApiError(400, "Avatar file is required.")
    }

    //create user object in DB. THe create method is a mongoose method.
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password
    })

    /*This line of code retrieves a user document from the database by its ID, but excludes the password and refreshToken fields from the result.*/
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check user creation
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user.")
    }
    
    return res.status(201).json(
        new ApiResonse(200, "user created successfully", createdUser))
            


})

export default registerUser