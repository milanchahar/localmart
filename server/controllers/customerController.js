const Shop = require("../models/Shop");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const socketManager = require("../utils/socket");

const listShops = async (req, res) => {
  try {
    const { pincode = "", category = "", q = "" } = req.query;
    const filter = {};

    if (category) {
      filter.category = new RegExp(category, "i");
    }
    if (q) {
      filter.name = new RegExp(q, "i");
    }

    let shops = await Shop.find(filter).sort({ isOpen: -1, createdAt: -1 });

    if (pincode) {
      shops = shops.filter((shop) => shop.address.toLowerCase().includes(String(pincode).toLowerCase()));
    }

    return res.json({ shops });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load shops" });
  }
};

const getShopDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { q = "" } = req.query;

    const shop = await Shop.findById(id);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const filter = { shopId: shop._id, isAvailable: true };
    if (q) {
      filter.name = new RegExp(q, "i");
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return res.json({ shop, products });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load shop details" });
  }
};

const placeOrder = async (req, res) => {
  try {
    const { shopId, items, paymentMode, deliveryAddress } = req.body;

    if (!shopId || !Array.isArray(items) || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({ message: "Missing order fields" });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const ids = items.map((it) => it.productId);
    const products = await Product.find({ _id: { $in: ids }, shopId });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const finalItems = [];
    let totalAmount = 0;

    for (const it of items) {
      const product = productMap.get(String(it.productId));
      if (!product) {
        return res.status(400).json({ message: "Invalid product in cart" });
      }
      const qty = Number(it.qty);
      if (!qty || qty < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      if (product.stock < qty) {
        return res.status(400).json({ message: `${product.name} is out of stock` });
      }

      product.stock -= qty;
      await product.save();

      const line = qty * product.price;
      totalAmount += line;

      finalItems.push({
        productId: product._id,
        name: product.name,
        qty,
        price: product.price,
      });
    }

    const order = await Order.create({
      customerId: req.user.userId,
      shopId,
      items: finalItems,
      totalAmount,
      paymentMode: paymentMode === "online" ? "online" : "cod",
      paymentStatus: paymentMode === "online" ? "pending" : "pending",
      deliveryAddress,
    });

    const io = socketManager.get();
    if (io) {
      io.to(`shop_${shopId}`).emit("new_order", { orderId: order._id, shopId });
    }

    return res.status(201).json({ message: "Order placed", order });
  } catch (err) {
    return res.status(500).json({ message: "Failed to place order" });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load profile" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.userId })
      .populate("shopId", "name")
      .sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load orders" });
  }
};

const getMyOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, customerId: req.user.userId }).populate(
      "shopId",
      "name address"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load order" });
  }
};

module.exports = { listShops, getShopDetails, placeOrder, getMyProfile, getMyOrders, getMyOrderById };
