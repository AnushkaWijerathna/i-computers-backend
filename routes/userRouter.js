import express from "express";
import {
  createUser,
  loginUser,
  getUser,
  googleLogin,
  sendOTP,
  verifyOtpAndUpdatePassword,
  getAllUsers,
  updateUserStatus,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/", createUser);

userRouter.post("/login", loginUser);

userRouter.get("/", getUser);

userRouter.post("/google-login", googleLogin);

//parameters walin email ekk gnna nisa :email danna
userRouter.get("/send-otp/:email", sendOTP);

userRouter.post("/verify-otp", verifyOtpAndUpdatePassword);

userRouter.get("/all", getAllUsers);

userRouter.put("/toggleBlock/:email", updateUserStatus);

export default userRouter;
