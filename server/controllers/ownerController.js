const Shop = require("../models/Shop");
const Product = require("../models/Product");
const User = require("../models/User");

const getOrCreateShop = async (user) => {
  let shop = await Shop.findOne({ ownerId: user.userId });
  if (shop) {
    return shop;
  }

  const owner = await User.findById(user.userId);

  shop = await Shop.create({
    ownerId: user.userId,
    name: owner?.shopName || "My Shop",
    category: owner?.category || "General",
    address: owner?.shopAddress || "Address not set",
  });

  return shop;
};

const getDashboard = async (req, res) => {
  try {
    const shop = await getOrCreateShop(req.user);
    const totalProducts = await Product.countDocuments({ shopId: shop._id });
    const lowStockCount = await Product.countDocuments({ shopId: shop._id, stock: { $lte: 5 } });
    const availableCount = await Product.countDocuments({ shopId: shop._id, isAvailable: true });

    return res.json({
      shop: {
        id: shop._id,
        name: shop.name,
        isOpen: shop.isOpen,
      },
      stats: {
        totalProducts,
        lowStockCount,
        availableCount,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load dashboard" });
  }
};

const getShopProfile = async (req, res) => {
  try {
    const shop = await getOrCreateShop(req.user);
    return res.json({ shop });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load shop profile" });
  }
};

const updateShopProfile = async (req, res) => {
  try {
    const { name, category, address, isOpen, timings, coords } = req.body;
    const shop = await getOrCreateShop(req.user);

    if (name !== undefined) {
      shop.name = name;
    }
    if (category !== undefined) {
      shop.category = category;
    }
    if (address !== undefined) {
      shop.address = address;
    }
    if (isOpen !== undefined) {
      shop.isOpen = isOpen;
    }
    if (timings?.open !== undefined) {
      shop.timings.open = timings.open;
    }
    if (timings?.close !== undefined) {
      shop.timings.close = timings.close;
    }
    if (coords?.lat !== undefined) {
      shop.coords.lat = coords.lat;
    }
    if (coords?.lng !== undefined) {
      shop.coords.lng = coords.lng;
    }

    await shop.save();

    return res.json({ message: "Shop profile updated", shop });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update shop profile" });
  }
};

const listProducts = async (req, res) => {
  try {
    const shop = await getOrCreateShop(req.user);
    const products = await Product.find({ shopId: shop._id }).sort({ createdAt: -1 });
    return res.json({ products });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load products" });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, category, price, unit, stock, image, isAvailable } = req.body;

    if (!name || !category || price === undefined || !unit || stock === undefined) {
      return res.status(400).json({ message: "Missing required product fields" });
    }

    const shop = await getOrCreateShop(req.user);

    const product = await Product.create({
      shopId: shop._id,
      name,
      category,
      price: Number(price),
      unit,
      stock: Number(stock),
      image: image || "",
      isAvailable: isAvailable === undefined ? true : Boolean(isAvailable),
    });

    return res.status(201).json({ message: "Product added", product });
  } catch (err) {
    return res.status(500).json({ message: "Failed to add product" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const shop = await getOrCreateShop(req.user);
    const { id } = req.params;
    const product = await Product.findOne({ _id: id, shopId: shop._id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { name, category, price, unit, stock, image, isAvailable } = req.body;

    if (name !== undefined) {
      product.name = name;
    }
    if (category !== undefined) {
      product.category = category;
    }
    if (price !== undefined) {
      product.price = Number(price);
    }
    if (unit !== undefined) {
      product.unit = unit;
    }
    if (stock !== undefined) {
      product.stock = Number(stock);
    }
    if (image !== undefined) {
      product.image = image;
    }
    if (isAvailable !== undefined) {
      product.isAvailable = Boolean(isAvailable);
    }

    await product.save();

    return res.json({ message: "Product updated", product });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update product" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const shop = await getOrCreateShop(req.user);
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ _id: id, shopId: shop._id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete product" });
  }
};

module.exports = {
  getDashboard,
  getShopProfile,
  updateShopProfile,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
