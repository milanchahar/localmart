const express = require("express");
const { protect, allowRoles } = require("../middleware/authMiddleware");
const {
  listShops,
  getShopDetails,
  placeOrder,
  getMyProfile,
  getMyOrders,
  getMyOrderById,
} = require("../controllers/customerController");

const router = express.Router();

router.get("/shops", protect, allowRoles("customer"), listShops);
router.get("/shops/:id", protect, allowRoles("customer"), getShopDetails);
router.post("/orders", protect, allowRoles("customer"), placeOrder);
router.get("/orders", protect, allowRoles("customer"), getMyOrders);
router.get("/orders/:id", protect, allowRoles("customer"), getMyOrderById);
router.get("/me", protect, allowRoles("customer"), getMyProfile);

module.exports = router;
