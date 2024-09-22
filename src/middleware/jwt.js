const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?
  req.header('Authorization').replace('Bearer ', '')
  : null;
  // console.log(token);
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
    if(!decoded){
    return res.status(401).json({ msg: 'Token is not valid' });
    }
    // console.log(decoded);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: err.message });
  }
};

//function to genereate jwt token
const generateToken = (userData) =>{
  //generate a new jwt token using userd data
  return jwt.sign(userData,process.env.JWT_SECRET ,{expiresIn :"3hr"})
}

module.exports = {
  authMiddleware,
  generateToken
};