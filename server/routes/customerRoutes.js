const express = require("express");
const { protect, allowRoles } = require("../middleware/authMiddleware");
const { listShops, getShopDetails, placeOrder, getMyProfile } = require("../controllers/customerController");

const router = express.Router();

router.get("/shops", protect, allowRoles("customer"), listShops);
router.get("/shops/:id", protect, allowRoles("customer"), getShopDetails);
router.post("/orders", protect, allowRoles("customer"), placeOrder);
router.get("/me", protect, allowRoles("customer"), getMyProfile);

module.exports = router;
