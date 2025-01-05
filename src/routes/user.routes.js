import Router from "express";
import registerUser, { loginUser, logOutUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";


const router = Router();


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }

    ]),
    registerUser
)

//we need to send user and pass as json response in Postman. If you want to use form-data in postman, 
//include upload.none() as a middleware (this is from multer.)

router.route("/login").post(loginUser)

//secured routes
/*
    Middleware in Express can modify the req object, making data available to subsequent middleware or controllers.

    req.user is a common pattern for attaching the authenticated user's information for use in secured routes.

    so, req.user is made available to the logoutUser.

    so, verifyJWT from auth.middleware.js had req.user and it was a middleware. This means req.user is now also available to the logoutUser.

*/

router.route("/logout").post(verifyJWT, logOutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router