import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Makes user searchable while db searching and ordering user like array index
    },
    email: {
      type: String,
      required: [true, "user email is a required field"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: [true, "full name is required"],
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // Cloudinary services
      required: true,
    },
    coverImage: {
      type: String, // Cloudinary services 
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId, // Reference from Video db
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password before saving to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash the password if it's modified
  try {
    // Hash the password
    this.password = await bcrypt.hash(this.password, 10); // Hashing password with salt rounds (10)
    next(); // Proceed to save the document
  } catch (err) {
    next(err); // Pass any error to the next middleware
  }
});

// Method to check if a password is correct by comparing the hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
  try {
    // Compare provided password with the stored hashed password
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw new Error('Error comparing passwords');
  }
};

// Method to generate an Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET, // Access token secret from .env
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // Expiry time from .env
    }
  );
};

// Method to generate a Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET, // Refresh token secret from .env
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // Expiry time from .env
    }
  );
};

export const User = mongoose.model("User", userSchema);
