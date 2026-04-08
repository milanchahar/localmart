const express = require("express");
const { protect, allowRoles } = require("../middleware/authMiddleware");
const {
  getDashboard,
  getShopProfile,
  updateShopProfile,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/ownerController");

const router = express.Router();

router.use(protect, allowRoles("shop_owner"));

router.get("/dashboard", getDashboard);
router.get("/shop", getShopProfile);
router.patch("/shop", updateShopProfile);

router.get("/products", listProducts);
router.post("/products", createProduct);
router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

module.exports = router;
