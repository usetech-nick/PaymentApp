const express = require("express");
const router = express.Router();
const { JWT_SECRET } = require("../config");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { User, Account } = require("../db");
const { authMiddleware } = require("../middleware");

//signup
const signupBody = zod.object({
  username: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
});

router.post("/signup", async (req, res) => {
  const { success } = signupBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Email already taken/incorrect inputs",
    });
  }

  const existingUser = await User.findOne({
    username: req.body.username,
  });
  if (existingUser) {
    return res.status(411).json({
      message: "Email already taken/incorrect inputs",
    });
  }

  const user = await User.create({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password,
  });
  const userId = user._id;

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });

  const token = jwt.sign({ userId }, JWT_SECRET);

  res.json({
    message: "User created successfully !",
    token: token,
  });
  console.log("JWT_SECRET used for signing:", JWT_SECRET);
  console.log("Generated token:", token);
});

//signin
const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});
router.post("/signin", async (req, res) => {
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Email already taken/incorrect inputs",
    });
  }
  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });
  if (user) {
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({
      message: "Login successful!",
      token: token,
    });
    console.log("JWT_SECRET used for signing:", JWT_SECRET);
    console.log("Generated token:", token);
    return;
  }
  return res.status(411).json({
    message: "Login failed",
  });
});

//updateInfo
const updateBody = zod.object({
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
});
router.put("/", authMiddleware, async (req, res) => {
  const { success } = updateBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Error while updating information",
    });
  }
  await User.updateOne({ _id: req.userId }, req.body);
  res.json({
    message: "Updated successfully",
  });
});

//search
router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";

  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });
  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});

module.exports = router;
