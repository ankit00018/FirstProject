import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiErrors } from "../utils/ApiErrors.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"

export const verifyJWT = asyncHandler(async (req,_,next) => {
    try {
    const token = req.cockies?.accessToken || req.header("Authorization")?.replace("Bearer","")

    if (!token) {
        throw new ApiErrors(401,"Unauthorized request")
    }

    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id).select("-password -refreshtoken")

    if (!user) {
        throw new ApiErrors(401,"Invalid access token")
    }

    req.user = user
    next()

    } catch (error) {
        throw new ApiErrors(401, error?.message || "Invalid access token")
    }
} )