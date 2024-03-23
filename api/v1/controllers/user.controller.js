const md5 = require("md5");
const User = require("../models/user.model");
const generate = require("../../../helpers/generate");

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
