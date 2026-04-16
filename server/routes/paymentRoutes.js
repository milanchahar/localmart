const express = require("express");
const { protect, allowRoles } = require("../middleware/authMiddleware");
const { createPaymentOrder, verifyAndPlaceOrder } = require("../controllers/paymentController");

const router = express.Router();

router.use(protect, allowRoles("customer"));

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyAndPlaceOrder);

module.exports = router;
