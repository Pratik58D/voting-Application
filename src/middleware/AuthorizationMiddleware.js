const User = require("../models/userModel");

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    return user.role === "admin";
  } catch (err) {
    return false;
  }
};

module.exports = { checkAdminRole };
