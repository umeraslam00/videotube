import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResonse from "../utils/ApiResponse.js";
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userID) => {
    const user = await User.findById(userID)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }

} 


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

const loginUser = asyncHandler( async (req, res) => {

    /*
       1. get user data. (req.body)
       2. validate data. (no empty field).
       3. check if user exists. (username, email). If no, send error "no user"
       4. make sure password is correct. If no, send error "wrong password."
       5. if both user and pass correct, send access and refresh token.
       6. send cookies.
       7. send response. login successfull.
    */


    //get user data
    const { email, username, password } = req.body

    console.log('username:', username);
    console.log('email:', email);

    //if users sends no email and no password, send error.
    if(!username && !email) {
        throw new ApiError(400, "username or email is required.")
    }

    if(!password) {
        throw new ApiError(400, "password is required.")
    }

    //search for user in DB.
    const findUser = await User.findOne({
        $or: [{username}, {email}]
    })

    //if no user found, send error.
    if(!findUser) {
        throw new ApiError(400, "user does not exist. Please register an account.")
    }


    //check if password is correct.
    const isPassValid = await findUser.isPasswordCorrect(password)

    //if password incorrect, send error.
    if(!isPassValid) {
        throw new ApiError(401, "Wrong password. Please try again.")
    }

    //we call the function and give it ._id which we got from DB. this helps us generate tokens.
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(findUser._id)

    /*
       The findUser const in this function didn't had the refresh token field. As we called the generateAccessAndRefreshToken function just now. But, its okay as we don't want to include it as it is sensitive. we also dont want password field. So, we create loggedUser const.
    */

    const loggedUser =await User.findById(findUser._id).select("-password -refreshToken")

    //create and send cookies.

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResonse(200, "login successfull", loggedUser))

})


const logOutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: "" } }, { new: true })

    /*
        Middleware in Express can modify the req object, making data available to subsequent middleware or controllers.
    
        req.user is a common pattern for attaching the authenticated user's information for use in secured routes.
    
        so, req.user is made available to the logoutUser.
    
        so, verifyJWT from auth.middleware.js had req.user and it was a middleware. This means req.user is now also available to the logoutUser.
    
    */

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResonse(200, "logout successfull"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {

    // Step 1: Retrieve the refresh token from cookies or request body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(403, "Unauthorized request.")

    }

    /* Step 2: Validate and decode the token.

      jwt.verify(token, secretOrPublicKey, [options, callback])

      You may think about skipping directly to step 4. After all, we can compare the encoded token with the stored one (it is also encoded). It ensures:

      *The token is authentic (signed by the server with the correct secret).
      *The token is not tampered with .
      *The token is not expired.

      we can also extract _id after decoding the token. This helps us find the user's token in DB and then compare with the cookie token.
    */

    try {
        const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        // Step 3: Find the user using the decoded _id
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(403, "Invalid refresh token.")
        }
    
        // Step 4: Compare the incoming encoded token with the stored one
        if(incomingRefreshToken != user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used.")
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        const loggedUser =await User.findById(findUser._id).select("-password -refreshToken")
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .josn(new ApiResonse(200, "Token refreshed successfully.", {accessToken, newRefreshToken}))
    
    } catch (error) {
        throw new ApiError(403, error?.message || "invalid refresh token")
    }

})

const changePassword = asyncHandler( async(req, res) => {

    //we get the old and new password values from user (front-end)
    const {oldPassword, newPassword} = req.body

    if(!oldPassword || !newPassword) {
        throw new ApiError(400, "Both fields (old and new password) are required.")
    }

    //we will run the verifyJWT middleware before this controller. So, we have access to req.user.
    const user = await User.findById(req.user?._id)

    //We use the isPasswordCorrect method from user.model.
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect.")
    }

    //We set the new password for user.
    user.password = newPassword

    /*
      We have userSchema.pre("save", async function (next) in user.model. This automatically hashes the password (if it is modified) before saving it via Bcrypt.
    */

    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResonse(200, "Password changed successfully.", {}))


    


})

const getCurrentUser = asyncHandler( async(req, res) => {

    /*We get the req.user from verifyJWT middleware. This is the logged in user. So, the req.user will already have all the details of the user. */

    return res
    .status(200)
    .json(new ApiResonse(200, "Current user fetched successfully.", req.user))
})

const updateAccountDetails = asyncHandler( async(req, res) => {

    const {fullname, email} = req.body

    if(!fullname || !email) {
        throw new ApiError(400, "All fields are required.")
    }
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { fullname, email } },
        //{$set: {fullname: fullname, email: email}} The above is shorthand for this code.
        { new: true }
    ).select("-password")

    return res.status(200).json(new ApiResonse(200, "Account details updated successfully.", updatedUser))
   
})

const updateUserAvatar = asyncHandler ( async(req, res) => {
    
    /*if there were more than 1 file, we would use req.files. We get req.files because Multer middleware will be used.*/
    
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required.")
    }

    //Upload on Cloudinary
    const newAvatar = await uploadOnCloudinary(avatarLocalPath)

    if(!newAvatar.url) {
        throw new ApiError(400, "Error uploading the avatar.")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {$set: {avatar: newAvatar.url}},
        {new: true}
    ).select("-password")

    return res.status(200).json(new ApiResonse(200, "Avatar updated successfully.", user))
})

const updateUsercoverImage = asyncHandler ( async(req, res) => {
    
    /*if there were more than 1 file, we would use req.files. We get req.files because Multer middleware will be used.*/
    
    const coverLocalPath = req.file?.path

    if(!coverLocalPath) {
        throw new ApiError(400, "cover file is required.")
    }

    //Upload on Cloudinary
    const newCover = await uploadOnCloudinary(coverLocalPath)

    if(!newCover.url) {
        throw new ApiError(400, "Error uploading the cover.")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {$set: {coverImage: newCover.url}},
        {new: true}
    ).select("-password")

    return res.status(200).json(new ApiResonse(200, "Cover Image updated successfully.", user))
})


export default registerUser
export { loginUser, logOutUser, refreshAccessToken, getCurrentUser, changePassword, updateAccountDetails, updateUserAvatar, updateUsercoverImage };