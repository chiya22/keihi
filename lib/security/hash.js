const crypto = require("crypto");

const PASSWORD_SALT = "kotoba-security";
const PASSWORD_STRECH = 3;

const digest = function (text) {
  let hash;
  text += PASSWORD_SALT;

  for (let i = PASSWORD_STRECH; i--;) {
    hash = crypto.createHash("sha256");
    hash.update(text);
    text = hash.digest("hex");
  }
  return text;
};

module.exports = {
  digest
};


