const express =  require("express");

const router = express.Router();

const {authMiddleware,genereateToken} = require("../middleware/jwt");
const { SignupController, loginController, viewProfile, updatePassword } = require("../controllers/userController");

router.post("/signup",SignupController);

router.post("/login",loginController);

//user profile as per their token
router.get("/profile",authMiddleware,viewProfile);

router.put("/profile/password",authMiddleware,updatePassword)




module.exports = router;