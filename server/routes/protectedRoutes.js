const express = require("express");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/customer", protect, allowRoles("customer"), (req, res) => {
  res.json({ ok: true, role: "customer" });
});

router.get("/owner", protect, allowRoles("shop_owner"), (req, res) => {
  res.json({ ok: true, role: "shop_owner" });
});

router.get("/agent", protect, allowRoles("delivery_agent"), (req, res) => {
  res.json({ ok: true, role: "delivery_agent" });
});

module.exports = router;
