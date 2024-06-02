const UserData = require("../model/UserSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// create a new User
const createNewUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(403).json({ success: false, message: "all fields are required" });
    }
    const userExists = await UserData.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }


    const hash = bcrypt.hashSync(password, 10);
    const user = await UserData.create({ username, email, password:hash });

    return res.status(201).json({ success: true, message: "Signup successful.", user });
  } catch (error) {
    console.error("Error signing up:", error);
    return res.status(500).json({ success: false, message: "Error signing up.", error: error.message });
  }
};

const userLogin = async(req, res) => {
    const {email, password} = req.body;
    try {
        if (!email || !password) {
            return res.status(403).json({success: false, message: "all fields are required" });
          }
        //   find user by email
        const user = await UserData.findOne({ email: email});
        if(!user){
          return res.status(404).json({ success: false, message: "User not found." });
        }
        const matchPassword =await bcrypt.compare(password,user.password);
        

        if(!matchPassword){
          return res.status(401).json({ success: false, message: "Invalid credentials." });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        user.tokens = user.tokens.concat({ token });
        await user.save();
      
      return res.status(200).json({ success: true, message: "Login successful.", token });

    } catch (error) {
      console.error("Error logging in:", error);
      return res.status(500).json({ success: false, message: "Error logging in.", error: error.message });
    }
};


// logout user

module.exports = {createNewUser,userLogin}
