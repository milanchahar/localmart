const Order = require("../models/Order");
const socketManager = require("../utils/socket");

const getAvailable = async (req, res) => {
  try {
    const orders = await Order.find({ status: "accepted", agentId: null })
      .populate("shopId", "name address")
      .populate("customerId", "name phone")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "accepted" || order.agentId) {
      return res.status(400).json({ message: "Order not available" });
    }
    order.agentId = req.user.id;
    await order.save();

    const io = socketManager.get();
    if (io) {
      io.to(`order_${order._id}`).emit("order_agent_assigned", {
        orderId: order._id,
        agentId: req.user.id,
      });
    }

    res.json({ message: "Order accepted", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ["picked", "delivered"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const order = await Order.findOne({ _id: req.params.id, agentId: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status === "picked" && order.status !== "accepted") {
      return res.status(400).json({ message: "Order must be accepted before picking" });
    }
    if (status === "delivered" && order.status !== "picked") {
      return res.status(400).json({ message: "Order must be picked before delivering" });
    }

    order.status = status;
    await order.save();

    const io = socketManager.get();
    if (io) {
      const event = status === "picked" ? "order_picked" : "order_delivered";
      io.to(`order_${order._id}`).emit(event, { orderId: order._id, status });
    }

    res.json({ message: "Status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getActive = async (req, res) => {
  try {
    const order = await Order.findOne({
      agentId: req.user.id,
      status: { $in: ["accepted", "picked"] },
    })
      .populate("shopId", "name address coords")
      .populate("customerId", "name phone location");
    res.json({ order: order || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const orders = await Order.find({ agentId: req.user.id, status: "delivered" })
      .populate("shopId", "name")
      .populate("customerId", "name")
      .sort({ updatedAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAvailable, acceptOrder, updateStatus, getActive, getHistory };
