const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.registerUser = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ================= LOGIN =================

exports.loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ================= GOOGLE LOGIN =================

// ================= GOOGLE LOGIN =================

exports.googleLogin = async (req, res) => {

  try {

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token is required"
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;
    const googleId = payload.sub;

    let user = await User.findOne({ email });

    // user does not exist
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture
      });
    }

    // user exists but no googleId → link account
    if (user && !user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Google login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
// ================= FACEBOOK LOGIN =================

exports.facebookLogin = async (req, res) => {

  try {

    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Facebook access token is required"
      });
    }

    const url = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`;

    const response = await axios.get(url);

    const { id, name, email, picture } = response.data;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        facebookId: id,
        avatar: picture.data.url
      });
    }

    res.status(200).json({
      success: true,
      message: "Facebook login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

// ================= CHANGE PASSWORD =================

exports.changePassword = async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};