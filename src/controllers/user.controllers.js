import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiErrors } from "../utils/ApiErrors.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { application } from "express"

const generateAccessAndRefreshToken = async (userid) =>{
  try {
    const user = await User.findById(userid)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken =  refreshToken
    await user.save({validateBeforeSave : false})
    return {accessToken,refreshToken}


  } catch (error) {
    throw new ApiErrors(500,"Something went wrong while generating Token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
    
    //get user details from frontend
    //validation - not empty
    //check if user already exists : username, email
    //ckeck for images, check for avatar.
    //upload them to cloudinary, avatar
    //create user onject - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res


    const {fullname,email,password,username} = req.body
    
    // console.log("email : ", email);

    if (
        [fullname,email,username,password].some((field)=> 
        field?.trim()==="")
    ) {
        throw new ApiErrors(400,"Fullname is required");
    }

   const existedUser = await User.findOne({
        $or:[{ username },{ email }]
    })
    

    if (existedUser) {
        throw new ApiErrors(409,"User already exists")
    }

    console.log(req.files);
    
    const avatarLocalPath  = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ) {
     coverImageLocalPath = req.files.coverImage[0].path 
    }

    if (!avatarLocalPath) {
        throw new ApiErrors(400,"Avatar files is required")
    }

   const avatar =  await uploadOnCloudinary(avatarLocalPath)
   const coverImage =  await uploadOnCloudinary(coverImageLocalPath)
    
   if (!avatarLocalPath) {
    throw new ApiErrors(400,"Avatar files is required") 
   }

  const user = await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
   })

  const createdUser =  await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiErrors(500,"Something went wrong while registring user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser,"User register successfull")
  )

} )

const loginUser = asyncHandler(async (req,res) => {
  
  //req.body => data
  //username and email
  //find the user 
  //password check
  //access token refresh token
  //send cockie

  const {email,username,password} = req.body

  if (!username || !email) {
    throw new application(400,"Username or Email is required")
  }

  const user = await User.findOne({
    $or: [{username},{email}]
  })

  if (!user) {
    throw new ApiErrors(404,"User does not exists")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiErrors(401,"Invalid user credentials")
  }
  const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const option = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken,option)
  .cookie("refreshToken",refreshToken,option)
  .json(
    new ApiResponse(
      200,
      {
        user:loggedInUser,accessToken,refreshToken
      },
      "User logged in successfully"
    )
  )

})

  const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
      req.user._id,
      { 
        $set:{
          refreshToken:undefined
        }
      },
      {
        new:true
      }
    );

    const option ={
      httpOnly : true,
      secure:true
    }

    res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse (200,{},"User logged out"))

  });
 



export { registerUser, loginUser, logoutUser }