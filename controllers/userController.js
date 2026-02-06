import User from "../models/User.js";
import bcrypt from "bcrypt"; //Hashing walata gnna import eka
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Otp from "../models/Otp.js";
dotenv.config();

//Message eheta mehata ywna ekata (forget password ekedi) one krna transporter eka
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "anushkaprojects1128@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export function createUser(req, res) {
  const data = req.body;

  //password hashing = eka krnne "hashSync" use krla
  const hashedPassword = bcrypt.hashSync(data.password, 10); //api dena password eka 10 wathwak hash krnwa (db eke save krnna klin)

  const user = new User({
    //User kiyna model eke okkoma data hariyta fill krpu aluth User object ekk hadanwa..ee object eka "user" variable eke save krnwa
    email: data.email,
    firstname: data.firstname,
    lastname: data.lastname,
    password: hashedPassword,
  });

  //Okkoma details hariyta dapu "user" object eka db eke save krnwa
  user.save().then(() => {
    res.json({
      message: "User created successfully",
    });
  });
}

export function loginUser(req, res) {
  //login wenna nm one correct password and email one...ee deka check krna part eka me
  const { email, password } = req.body;

  //apita dena email ekata samana email thiyenawada kiyala check krnwa,
  // Pass unoth ee adala "User" model eka (Mongoose Model connected to the users collection) return krnwa
  User.find({ email: email }).then(
    //users is an object of mongoose model called User, if email exist the object is returned..this object is an array
    (users) => {
      if (users[0] == null) {
        res.status(404).json({
          message: "User not found",
        });
      } else {
        const user = users[0]; //two user variables are: In different functions In different scopes Do NOT conflict with each other

        //block check krnwa (meka liyawenne awasaneta adminUser page haduwama course ekedi nm awasana dwase googleLogin eketh same happen)
        if (user.isBlock) {
          return res.status(403).json({
            message: "User is blocked",
          });
        }
        //password compare krnne "compareSync" use krla
        const isPasswordCorrect = bcrypt.compareSync(password, user.password); //"user.passsword" kiynne database eke save krpu PW eka

        if (isPasswordCorrect) {
          //JSON web token eka kiynne user ge ID card eka wage, eka use krla userge authentication,authorization process eka wenwa
          //user ge data tika thiyena token ek hdanna onewena content eka hadaggnwa (payload)
          //passe user data dapu token eka hdala eka encrypt krnwa ("jwt.sign()"), token eka encrypt krnna encryption key eka "secretKey96$2025" kiyla denwa

          const payload = {
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            Image: user.Image,
          };

          const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "150h",
          });

          res.json({
            message: "Login Successfull",
            token: token,
            role: user.role,
          });
        } else {
          res.status(401).json({
            message: "Incorrect password",
          });
        }
      }
    },
  );
}

export function isAdmin(req) {
  if (req.user == null) {
    return false;
  }

  if (req.user.role != "admin") {
    return false;
  }

  return true;
}

export function getUser(req, res) {
  if (req.user == null) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }

  res.json(req.user);
}

//google login
export async function googleLogin(req, res) {
  console.log(req.body.token);
  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${req.body.token}`,
        },
      },
    );
    console.log(response.data);

    const user = await User.findOne({ email: response.data.email });
    if (user == null) {
      const newUser = new User({
        email: response.data.email,
        firstname: response.data.given_name || response.data.name || "user",
        lastname:
          response.data.family_name ||
          response.data.name?.split(" ").slice(1).join(" ") ||
          "user",
        password: "123",
        Image: response.data.picture,
      });

      await newUser.save();

      const payload = {
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        role: newUser.role,
        isEmailVerified: true,
        Image: newUser.Image,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "150h",
      });

      res.json({
        message: "Login Successfull",
        token: token,
        role: newUser.role,
      });
    } else {
      if (user.isBlock) {
        return res.status(403).json({
          message: "User is blocked",
        });
      }
      const payload = {
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        Image: user.Image,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "150h",
      });

      res.json({
        message: "Login Successfull",
        token: token,
        role: user.role,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

//forget password  -->> verify OTP
export async function verifyOtpAndUpdatePassword(req, res) {
  try {
    const { email, otp } = req.body;
    const newPassword = req.body.newPassword;

    //OTP ekk thiynwda blnwda check krnwa
    const otpRecord = await Otp.findOne({ email: email, otp: otp });

    if (otpRecord == null) {
      res.status(404).json({
        message: "Invalid OTP",
      });
      return;
    }

    await Otp.deleteMany({ email: email });

    //Otp ekk thiye nm aluth password hash krla userw update krnwa
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await User.updateOne(
      { email: email },
      {
        $set: { password: hashedPassword, isEmailVerified: true },
      },
    );

    res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

//forget password  -->> email eka send krnwa
export async function sendOTP(req, res) {
  try {
    const email = req.params.email;

    //request eke parameter eke email ekata samana email thiyenawada kiyala check krnwa
    const user = await User.findOne({ email: email });

    if (user == null) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    //Danata DB eke adala email ekta yawpu otp thiynwa nm ewa delete krnwa
    await Otp.deleteMany({ email: email });

    //otp generate krnwa
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    //otp save krnwa
    const otp = new Otp({
      email: email,
      otp: otpCode,
    });
    await otp.save();

    const message = {
      from: "anushkaprojects1128@gmail.com",
      to: email,
      subject: "OTP for password reset",
      text: "Your OTP is: " + otpCode,
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        res.status(500).json({
          message: "Failed to send OTP",
          error: err.message,
        });
      } else {
        res.json({
          message: "OTP sent successfully",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

export async function getAllUsers(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "Unauthorized",
    });
  }
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

export async function updateUserStatus(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "Unauthorized",
    });
  }
  const email = req.params.email;

  if (req.user.email === email) {
    return res.status(403).json({
      message: "You cannot block yourself",
    });
  }

  const isBlock = req.body.isBlock;
  try {
    await User.updateOne({ email: email }, { $set: { isBlock: isBlock } });
    res.json({
      message: "User status updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}
