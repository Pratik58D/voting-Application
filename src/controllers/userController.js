const { generateToken } = require("../middleware/jwt");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const SignupController = async (req, res) => {
  try {
    //assuming the request body conatains the user data
    const data = req.body;

    ///check if a user with same citizenship number already exists
    const existingUser =  await User.findOne({citizenship:data.citizenship});

    if(existingUser){
      return res.status(400).json({ message: "User with this citizenship number already exists" });
    }

    const role = data.role;
    // If the role is admin, check if an admin already exists
    if (role === "admin") {
      const existingAdmin = await User.findOne({ role : "admin" });
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin already exists" });
      }
    }

    //create a new candidate document using the MOngoose model
    const newUser = new User(data);

    //save the new user  to database
    const response = await newUser.save();
    console.log("data saved");
    return res.status(200).json({ response: response });
  } catch (err) {
    console.log("error in signup", err);
    return res.status(500).json({ msg: "sign up error " });
  }
};

const loginController = async (req, res) => {
  try {
    //extract citizenshiip number and password from request body
    const { citizenship, password } = req.body;
    //find the user by citizenship number
    const user = await User.findOne({ citizenship });
    //if user doesnot exits
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(400)
        .json({ msg: "Citizenship or passowrd doesnot match" });
    }

    //generate token
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);

    //return token as response

    return res.json({ msg: "login sucessfull", token: token });
  } catch (err) {
    console.log("error while login", err);
    return res.status(500).json({ msg: "Login in error " });
  }
};

//profile Route

const viewProfile = async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "internal server error" });
  }
};

const updatePassword = async (req, res) => {
  try {
    //extract the id from the token
    const userId = req.user.id;
    //extract current and new password from request body
    const { currentPassword, newPassword } = req.body;
    //find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Check if the current password matches the stored password
    const passwordMatch = await user.comparePassword(currentPassword);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    // Hash the new password before saving
    user.password = await bcrypt.hash(newPassword, 10);
    user.password = newPassword;
    await user.save();

    console.log("password changed updated");
    return res.status(200).json({ message: "Passoword updated" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "internal server error" });
  }
};

module.exports = {
  SignupController,
  loginController,
  viewProfile,
  updatePassword,
};
