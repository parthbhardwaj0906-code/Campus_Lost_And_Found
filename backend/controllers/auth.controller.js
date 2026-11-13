import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Public registration always creates a student. Never accept role from req.body.
    const user = await User.create({ name, email: normalizedEmail, password });
    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Registration successful",
      user: publicUser(user),
      token
    });
    } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    return res.status(500).json({
      message: error.message || "Could not register user"
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: publicUser(user),
      token: generateToken(user._id)
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not log in" });
  }
};

export const getMe = (req, res) => {
  res.status(200).json({ user: publicUser(req.user) });
};
