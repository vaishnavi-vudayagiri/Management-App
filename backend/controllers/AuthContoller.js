import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import { UserModel } from "../models/userModel.js";
import BoardModel from "../models/boardModel.js";
import ListModel from "../models/ListModel.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email, name, code) => {
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: "Verify your email for Task Manager",
    html: `
      <p>Hi ${name},</p>
      <p>Use the code below to verify your email address:</p>
      <h2>${code}</h2>
      <p>This code expires in 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const createDefaultBoardsAndLists = async (userId) => {
  const defaultBoards = [
    {
      title: "Professional",
      owner: userId,
      members: [userId],
      isDefault: true,
    },
    {
      title: "Personal",
      owner: userId,
      members: [userId],
      isDefault: true,
    },
  ];

  const createdBoards = await BoardModel.insertMany(defaultBoards);

  const defaultLists = [];
  createdBoards.forEach((board) => {
    defaultLists.push(
      {
        title: "Today",
        boardId: board._id,
        order: 1,
      },
      {
        title: "This Week",
        boardId: board._id,
        order: 2,
      },
      {
        title: "Later",
        boardId: board._id,
        order: 3,
      }
    );
  });

  await ListModel.insertMany(defaultLists);
};


// REGISTER
export const registerUser = async (req, res, next) => {
  try {
    console.log("Register API called");

    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password required",
      });
    }

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    });

    await sendVerificationEmail(email, name, verificationCode);

    console.log("Verification email sent to:", email);

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message: "Email and verification code are required",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or code",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }

    if (
      !user.verificationCode ||
      user.verificationCode !== code ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    await createDefaultBoardsAndLists(user._id);

    res.json({
      message: "Email verified successfully",
    });
  } catch (err) {
    next(err);
  }
};



// LOGIN
export const loginUser = async (req, res, next) => {
  try {
    console.log("Login API called");

    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    // find user
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in",
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log("Login successful");

    res.json({
      message: "Login successful",
      token,
      user,
    });

  } catch (err) {
    next(err);
  }
};



// LOGOUT
export const logoutUser = async (req, res, next) => {
  try {
    console.log("Logout API called");

    res.clearCookie("token");

    res.json({
      message: "Logged out successfully",
    });

  } catch (err) {
    next(err);
  }
};