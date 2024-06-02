const { createNewUser, userLogin } = require("../controller/authController");

const router = require("express").Router();

// create a new user
router.post("/create/user",createNewUser);
router.post("/login/user",userLogin);
// router.post("/logout/user");
// router.get("/get/user");

module.exports = router;