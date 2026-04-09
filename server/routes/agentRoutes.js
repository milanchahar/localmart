const express = require("express");
const { protect, allowRoles } = require("../middleware/authMiddleware");
const {
  getAvailable,
  acceptOrder,
  updateStatus,
  getActive,
  getHistory,
} = require("../controllers/agentController");

const router = express.Router();

router.use(protect, allowRoles("delivery_agent"));

router.get("/orders/available", getAvailable);
router.post("/orders/:id/accept", acceptOrder);
router.patch("/orders/:id/status", updateStatus);
router.get("/orders/active", getActive);
router.get("/orders/history", getHistory);

module.exports = router;
