const registerUser = asyncHandler(async (req, res) => {
    console.log("📩 Incoming request to register user");
    console.log("📝 Request body:", req.body);
    console.log("📂 Uploaded files:", req.files);

    const { fullname, email, password, username } = req.body;

    if (!email) {
        console.log("❌ Error: Email is missing from request body");
    }

    if ([fullname, email, password, username].some((field) => field?.trim() === "")) {
        throw new ApiErrors(400, "All fields are required");
    }

    console.log("🔍 Checking if user already exists...");
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        console.log("⚠️ User already exists:", existedUser);
        throw new ApiErrors(409, "User with this email or username already exists");
    }

    console.log("📤 Uploading avatar to Cloudinary...");
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) {
        console.log("❌ Error: Avatar file is missing");
        throw new ApiErrors(409, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("✅ Avatar uploaded:", avatar.url);

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;
    console.log("✅ Cover image uploaded:", coverImage?.url);

    console.log("📝 Creating user in database...");
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    console.log("✅ User created successfully:", user._id);

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        console.log("❌ Error: User creation failed");
        throw new ApiErrors(500, "Something went wrong");
    }

    console.log("🎉 User registration successful!");
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});
