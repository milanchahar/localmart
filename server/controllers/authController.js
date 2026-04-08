const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { createToken } = require("../utils/token");

const mapUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    location: user.location,
    shopName: user.shopName,
    shopAddress: user.shopAddress,
    category: user.category,
    vehicleType: user.vehicleType,
  };
};

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, pincode, shopName, shopAddress, category, vehicleType } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["customer", "shop_owner", "delivery_agent"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (role === "customer" && !pincode) {
      return res.status(400).json({ message: "Pincode is required for customer" });
    }

    if (role === "shop_owner" && (!shopName || !shopAddress || !category)) {
      return res.status(400).json({ message: "Shop details are required for shop owner" });
    }

    if (role === "delivery_agent" && !vehicleType) {
      return res.status(400).json({ message: "Vehicle type is required for delivery agent" });
    }

    const emailTaken = await User.findOne({ email: email.toLowerCase() });
    if (emailTaken) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role,
      location: { pincode: pincode || "" },
      shopName: shopName || "",
      shopAddress: shopAddress || "",
      category: category || "",
      vehicleType: vehicleType || "",
    });

    const token = createToken({ userId: user._id, role: user.role });

    return res.status(201).json({
      message: "Registered successfully",
      token,
      user: mapUser(user),
    });
  } catch (err) {
    return res.status(500).json({ message: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password and role are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role !== role) {
      return res.status(403).json({ message: "Selected role does not match this account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken({ userId: user._id, role: user.role });

    return res.json({
      message: "Login successful",
      token,
      user: mapUser(user),
    });
  } catch (err) {
    return res.status(500).json({ message: "Login failed" });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};

module.exports = { register, login, me };
