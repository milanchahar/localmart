const crypto = require("crypto");
const { getRazorpay } = require("../utils/razorpay");
const Order = require("../models/Order");
const Shop = require("../models/Shop");
const Product = require("../models/Product");
const socketManager = require("../utils/socket");

const createPaymentOrder = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  try {
    const rzp = getRazorpay();
    const order = await rzp.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });
    return res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create payment order" });
  }
};

const verifyAndPlaceOrder = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    shopId,
    items,
    deliveryAddress,
  } = req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET;
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ message: "Payment verification failed" });
  }

  try {
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const ids = items.map((it) => it.productId);
    const products = await Product.find({ _id: { $in: ids }, shopId });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const finalItems = [];
    let totalAmount = 0;

    for (const it of items) {
      const product = productMap.get(String(it.productId));
      if (!product) return res.status(400).json({ message: "Invalid product" });
      const qty = Number(it.qty);
      if (product.stock < qty) {
        return res.status(400).json({ message: `${product.name} is out of stock` });
      }
      product.stock -= qty;
      await product.save();
      totalAmount += qty * product.price;
      finalItems.push({ productId: product._id, name: product.name, qty, price: product.price });
    }

    const order = await Order.create({
      customerId: req.user.userId,
      shopId,
      items: finalItems,
      totalAmount,
      paymentMode: "online",
      paymentStatus: "paid",
      deliveryAddress,
    });

    const io = socketManager.get();
    if (io) {
      io.to(`shop_${shopId}`).emit("new_order", { orderId: order._id, shopId });
    }

    return res.status(201).json({ message: "Order placed", order });
  } catch (err) {
    return res.status(500).json({ message: "Failed to place order after payment" });
  }
};

module.exports = { createPaymentOrder, verifyAndPlaceOrder };
