const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "thisIsthebestreactcourese@by#codewithharry";

// ROUTE: 1 ===> Creating a user: POST /api/auth/createUser    Login not required
router.post(
  "/createUser",
  [
    body("email", "Enter a valid email").isEmail(),
    body("name", "Enter atleast 3 characters").isLength({ min: 3 }),
    body("password", "Enter atleast 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    // If there are errors, return bad request and show the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // Check wheather a user is already exists with the same email or not..
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(404)
          .json({ error: "User already exists with this email" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(req.body.password, salt);
      // CREATE NEW USER
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({ authtoken });
    } catch (error) {
      res.status(500).send("Oops! Something went wrong");
    }
  }
);

// ROUTE: 2 ===> Login a user: POST /api/auth/login    Login not required

router.post(
  "/login",
  [body("email", "Enter a valid email").isEmail()],
  [body("password", "Password cannot be empty").exists()],
  async (req, res) => {
    // If there are errors, return bad request and show the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }
      const comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) {
        return res.status(400).json({
          error: "Please try to login with correct credentials",
        });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({ authtoken });
    } catch (error) {
      res.status(500).send("Oops! Something went wrong");
    }
  }
);

// ROUTE: 3 ===> Get data of loggedin user: POST /api/auth/getuser    Login required

router.post("/getuser", fetchuser ,async (req, res)=> {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    res.status(500).send("Oops! Something went wrong");
  }
})


module.exports = router;
