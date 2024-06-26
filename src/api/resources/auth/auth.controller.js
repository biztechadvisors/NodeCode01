const { db } = require('../../../models');
const JWT = require("jsonwebtoken");
const mailer = require("../../../mailer");
const config = require("../../../config");
const bcrypt = require("bcrypt-nodejs");
const speakeasy = require("speakeasy");
const { Op } = require("sequelize");
const Util = require("../../../helpers/Util");

var JWTSign = function (user, date) {
  return JWT.sign(
    {
      iss: process.env.name,
      sub: user.id,
      iam: user.type,
      iat: date.getTime(),
      exp: new Date().setDate(date.getDate() + 2),
    },
    process.env.APP_SECRET
  );
};

function generateOtp() {
  let token = speakeasy.totp({
    secret: process.env.OTP_KEY,
    encoding: "base32",
    step: 30 - Math.floor((new Date().getTime() / 1000.0) % 30),
  });
  return token;
}

function verifyOtp(token) {
  let expiry = speakeasy.totp.verify({
    secret: process.env.OTP_KEY,
    encoding: "base32",
    token: token,
    step: 30 - Math.floor((new Date().getTime() / 1000.0) % 30),
    window: 0,
  });
  return expiry;
}

module.exports = {

  async addUser(req, res, next) {

    const {
      firstName,
      lastName,
      phoneNo,
      phone,
      email,
      address,
      password,
      role,
      verify,
    } = req.body;

    var passwordHash = bcrypt.hashSync(password);
    var token, otp;

    if (role.toLowerCase() !== 'admin') {
      try {
        token = await generateOtp().catch((err) => {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Error generating OTP' });
        });
        otp = await verifyOtp(token).catch((err) => {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Error verifying OTP' });
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error generating or verifying OTP' });
      }
    }

    try {
      const find = await db.user.findOne({ where: { email: email, role: role }, paranoid: false });

      if (find) {
        throw new RequestError("Email is already in use", 409);
      }

      const user = await db.user.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phoneNo || phone,
        address: address,
        password: passwordHash,
        verify: verify,
        role: role,
      });

      if (user) {
        if (role.toLowerCase() !== 'admin') {
          mailer.sendEmployeePassword(email, token);
          return res.status(200).json({
            success: true,
            key: otp,
            message: "New Registration added and password has been sent to " + email + ".",
          });
        } else {
          return res.status(200).json({
            success: true,
            message: "New Admin added.",
          });
        }
      } else {
        return res.status(500).json({ success: false });
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  async successfullyRegister(req, res) {
    try {
      const user = await db.customer.findOne({ where: { email: req.body.email } });

      if (user) {
        const smtpTransport = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: process.env.MAIL_PORT,
          secure: true,
          auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
          },
        });
        await smtpTransport.sendMail({
          from: process.env.MAIL_FROM,
          to: req.body.email,
          subject: "Registration Successful",
          html: "Dear user,<br><br> Congratulations! Your registration with Nino has been successfully completed.<br><br>Thank you for choosing Nino. Enjoy shopping with us!<br><br>This is a system-generated email. Please do not reply to this email ID.<br><br>Warm Regards,<br>Customer Care<br>Nino",
        });
        return true; // Email sent successfully
      } else {
        throw {
          name: "NinoByVaniException",
          msg: "User not found",
        };
      }
    } catch (error) {
      throw {
        name: "NinoByVaniException",
        message: "Email Sending Failed",
        error: error,
      };
    }
  },

  async findUser(req, res, next) {
    db.user
      .findOne({
        attributes: ["firstName", "lastName"],
        where: { email: req.query.email },
        paranoid: false,
      })
      .then((user) => {
        if (user) {
          return res.status(200).json({ success: true, data: user });
        } else res.status(500).json({ success: false });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  },

  async getAllUserList(req, res, next) {
    const { searchString } = req.query;
    const query = {};
    query.where = {};
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    query.limit = limit;
    query.offset = limit * (page - 1);
    query.order = [["createdAt", "DESC"]];
    if (searchString) {
      query.where = {
        [Op.or]: [
          {
            firstName: {
              [Op.like]: "%" + searchString + "%",
            },
          },
          {
            email: searchString,
          },
          {
            role: {
              [Op.like]: "%" + searchString + "%",
            },
          },
        ],
      };
    }
    db.user
      .findAndCountAll(query)
      .then((list) => {
        let pages = Math.ceil(list.count / limit);
        const finalResult = {
          count: list.count,
          pages: pages,
          page: req.query.page,
          items: list.rows,
        };
        var response = Util.getFormatedResponse(false, finalResult, {
          message: "Success",
        });
        res.status(response.code).json(response);
      })
      .catch((err) => {
        next(err);
      });
  },

  async getSellerUser(req, res, next) {
    db.user
      .findOne({
        attributes: [
          "id",
          "email",
          "firstName",
          "lastName",
          "phone",
          "address",
          "role",
        ],
        where: { email: req.user.email, role: req.user.role },
      })
      .then((user) => {
        if (user) {
          return res.status(200).json({ success: true, data: user });
        } else res.status(500).json({ success: false });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  },

  async sendReset(req, res, next) {
    const { email } = req.body;
    try {
      const user = await db.user.findOne({
        where: {
          email: email,
        },
      });
      // console.log("User", user)
      if (user) {
        await mailer.sendResetUserPassword(email).catch((error) => {
          console.error("Error in sendResetUserPassword:", error);
          throw error; // re-throw the error to be caught in the outer catch block
        });
        return res.status(200).json({ success: true });
      } else {
        throw new RequestError("Email is not found", 404);
      }
    } catch (err) {
      console.log(err);
      next(err); // pass the error to the next middleware for centralized error handling
    }
  },

  async userUpdate(req, res, next) {
    const { id, firstName, lastName, email, address, password, role, verify } =
      req.body;
    var passwordHash = bcrypt.hashSync(password);
    db.user
      .findOne({ where: { email: email }, paranoid: false })
      .then((user) => {
        if (!user) {
          throw new RequestError("User is not found", 409);
        }
        return db.user.update(
          {
            firstName: firstName ? firstName : user.firstName,
            lastName: lastName ? lastName : user.lastName,
            password: passwordHash ? passwordHash : user.passwordHash,
            address: address ? address : user.address,
            role: role ? role : user.role,
            verify: verify ? verify : user.verify,
          },
          { where: { email: email } }
        );
      })
      .then((user) => {
        if (user) {
          return res
            .status(200)
            .json({ success: true, msg: "User update successsfully" });
        } else res.status(500).json({ success: false });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  },

  async login(req, res, next) {
    const user = await db.user.findOne({ where: { email: req.body.email } });

    var date = new Date();
    var token = JWTSign(req.user, date);
    res.cookie("XSRF-token", token, {
      expire: new Date().setDate(date.getDate() + 2),
      httpOnly: true,
      secure: process.env.APP_SECURE,
    });

    return res.status(200).json({ success: true, token, role: req.user.role, custId: user.id });
  },

  async sellerLogin(req, res, next) {
    var date = new Date();
    var token = JWTSign(req.user, date);
    res.cookie("XSRF-token", token, {
      expire: new Date().setDate(date.getDate() + 2),
      httpOnly: true,
      secure: config.app.secure,
    });

    return res.status(200).json({ success: true, token, role: req.user.role });
  },

  async deleteUserList(req, res, next) {
    db.user
      .findOne({ where: { id: req.body.id } })
      .then((data) => {
        if (data) {
          return db.user
            .destroy({ where: { id: req.body.id } })
            .then((r) => [r, data]);
        }
        throw new RequestError("User is not found", 409);
      })
      .then((re) => {
        return res
          .status(200)
          .json({ status: "deleted userlist Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },

  async sellerProfileUpdate(req, res, next) {
    const { id, phone, firstName, lastName, address } = req.body;
    db.user
      .findOne({ where: { id: id }, paranoid: false })
      .then((user) => {
        if (!user) {
          throw new RequestError("User is not found", 409);
        }
        return db.user.update(
          {
            firstName: firstName ? firstName : user.firstName,
            lastName: lastName ? lastName : user.lastName,
            address: address ? address : user.address,
            phone: phone ? phone : user.address,
          },
          { where: { id: id } }
        );
      })
      .then((user) => {
        if (user) {
          return res
            .status(200)
            .json({ success: true, message: "User update successsfully" });
        } else res.status(500).json({ success: false });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  },
};
