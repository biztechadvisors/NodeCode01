const express = require("express");
const authController = require("./auth.controller");
const {
  sellerStrategy,
  localStrategy,
  jwtStrategy,
} = require("../../../middleware/strategy");

const authRouter = express.Router();

authRouter.route("/register").post(authController.addUser);

authRouter.route("/user/getAllUserList").get(jwtStrategy, authController.getAllUserList);

authRouter.route("/user/update").post(jwtStrategy, authController.userUpdate);

authRouter.route("/user/delete").post(jwtStrategy, authController.deleteUserList);

authRouter.route("/getUserByEmailId").get(jwtStrategy, authController.findUser);

authRouter.route("/rootLogin").post(localStrategy, authController.login);

authRouter.route("/seller/login").post(sellerStrategy, authController.sellerLogin);

authRouter.route("/seller/profile-details").get(jwtStrategy, authController.getSellerUser);

authRouter.route("/seller/profile-update").post(jwtStrategy, authController.sellerProfileUpdate);

module.exports = authRouter;
