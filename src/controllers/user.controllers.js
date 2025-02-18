import { asyncHandler } from "../utils/asyncHandler";
import {ApiErrors} from "../utils/ApiErrors.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

 
const registerUser = asyncHandler ( async (req,res) => {
    // get user details from frontend
    //validation - not empty
    //check if user already exists : username,email
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //create user object - create user entry in db
    //remove password and refresh token field from response
    //return res

    const {fullname,email,password,username} = req.body
    console.log("email:",email);

if (
    [fullname,email,password,username].some((field)=> field?.trim() === "" )
) {
    throw new ApiErrors(400,"All field required")
}

const existedUser = User.findOne({
    $or : [{username},{email}]
})

if (existedUser) {
    throw new ApiErrors(409, "User with email and username already exists")
}

const avatarLocalPath = req.files?.avatar[0]?.path;
const coverImageLocalPath = req.files?.coverImage[0]?.path;

if (!avatarLocalPath) {
    throw new ApiErrors(409, "Avatar file is required")
}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if (!avatar) {
    throw new ApiErrors(409,"Avatar file is required")
}

const User = await User.create({
    fullname,
    avatar : avatar.url,
    coverImage :coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
})

const createdUser =  await User.findById(User._id).select("-password -refreshToken")

if (!createdUser) {
    throw new ApiErrors(500,"Something went wrong")
}

return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
)

})

export {registerUser}
