const md5 = require("md5");
const User = require("../models/user.model");
const ForgotPassword = require("../models/forgot-password.model");

const generate = require("../../../helpers/generate");
const sendMailHelper = require("../../../helpers/sendMail");

// [POST] /api/v1/users/register
module.exports.register = async (req, res) => {
  const existEmail = await User.findOne({
    email: req.body.email,
    deleted: false,
  });

  if (existEmail) {
    res.json({
      code: 400,
      message: "Email da ton tai!",
    });
    return;
  }

  const infoUser = {
    fullName: req.body.fullName,
    email: req.body.email,
    password: md5(req.body.password),
    token: generate.generateRandomString(30),
  };

  const user = new User(infoUser);
  await user.save();

  const token = user.token;
  res.cookie("token", token);

  res.json({
    code: 200,
    message: "Tao tai khoan thanh cong",
    token: token,
  });
};

// [POST] /api/v1/users/login
module.exports.login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({
    email: email,
    deleted: false,
  });

  if (!user) {
    res.json({
      code: 400,
      message: "Email khong ton tai",
    });
    return;
  }

  if (md5(password) !== user.password) {
    res.json({
      code: 400,
      message: "Sai mat khau",
    });
    return;
  }

  const token = user.token;
  res.cookie("token", token);

  res.json({
    code: 200,
    message: "Dang nhap thanh cong",
    token: token,
  });
};

// [POST] /api/v1/users/password/forgot
module.exports.forgotPassword = async (req, res) => {
  const email = req.body.email;

  const user = await User.findOne({
    email: email,
    deleted: false,
  });

  if (!user) {
    res.json({
      code: 400,
      message: "Email khong ton tai",
    });
    return;
  }

  const otp = generate.generateRandomNumber(8);

  const timeExpire = 5;

  const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: Date.now() + timeExpire * 60 * 1000,
  };

  // save database
  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();

  // send OTP to email
  const subject = "Ma OTP xac minh lay lai mat khau";
  const html = `
  Ma OTP de lay lai mat khau cua ban la <b>${otp}</b> (Su dung trong ${timeExpire} phut).
  Vui long khong chia se ma OTP cho bat ky ai.
  `;

  sendMailHelper.sendMail(email, subject, html);

  res.json({
    code: 200,
    message: "Da gui ma OTP qua email!",
  });
};

// [POST] /api/v1/users/password/otp
module.exports.otpPassword = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp,
  });

  if (!result) {
    res.json({
      code: 400,
      message: "OTP khong hop le!",
    });
    return;
  }

  const user = await User.findOne({ email: email });

  res.cookie("token", user.token);

  res.json({
    code: 200,
    message: "Xac thuc thanh cong",
    token: user.token,
  });
};

// [POST] /api/v1/users/password/reset
module.exports.resetPassword = async (req, res) => {
  const token = req.body.token;
  const password = req.body.password;

  const user = await User.findOne({
    token: token,
    deleted: false,
  });

  if (!user) {
    res.json({
      code: 400,
      message: "Tai khoan khong ton tai",
    });
    return;
  }

  if (md5(password) === user.password) {
    res.json({
      code: 400,
      message: "Vui long nhap mat khau khac mat khau cu!",
    });
    return;
  }

  await User.updateOne(
    { token: token },
    {
      password: md5(password),
    }
  );

  res.json({
    code: 200,
    message: "Doi mat khau thanh cong!",
  });
};

// [GET] /api/v1/users/detail
module.exports.detail = async (req, res) => {
  res.json({
    code: 200,
    message: "thanh cong",
    info: req.user,
  });
};

// [GET] /api/v1/users/list
module.exports.list = async (req, res) => {
  const users = await User.find({ deleted: false }).select("fullName email");

  res.json({
    code: 200,
    message: "thanh cong",
    users: users,
  });
};
