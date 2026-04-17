require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

// ─── Models ────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({ name: String, email: String, phone: String, password: String, role: String, location: { pincode: String } }, { timestamps: true });
const User = mongoose.model("User", userSchema);

const shopSchema = new mongoose.Schema({ ownerId: mongoose.Schema.Types.ObjectId, name: String, category: String, address: String, pincode: String, isOpen: Boolean, rating: { type: Number, default: 0 }, totalRatings: { type: Number, default: 0 }, timings: { open: String, close: String }, coords: { lat: Number, lng: Number } }, { timestamps: true });
const Shop = mongoose.model("Shop", shopSchema);

const productSchema = new mongoose.Schema({ shopId: mongoose.Schema.Types.ObjectId, name: String, category: String, price: Number, unit: String, stock: Number, image: String, isAvailable: { type: Boolean, default: true } }, { timestamps: true });
const Product = mongoose.model("Product", productSchema);

// ─── Seed Data ──────────────────────────────────────────────────────────────

const SHOPS = [
  // Mumbai
  { name: "Sharma General Store", category: "Grocery", city: "Mumbai", area: "Andheri West", pincode: "400058", coords: { lat: 19.1297, lng: 72.8272 }, open: true },
  { name: "Patel Dairy & More", category: "Dairy", city: "Mumbai", area: "Bandra West", pincode: "400050", coords: { lat: 19.0596, lng: 72.8295 }, open: true },
  { name: "Mumbai Vegetables Hub", category: "Vegetables", city: "Mumbai", area: "Dadar", pincode: "400014", coords: { lat: 19.0178, lng: 72.8478 }, open: true },
  { name: "Heera Bakery", category: "Bakery", city: "Mumbai", area: "Borivali", pincode: "400066", coords: { lat: 19.2307, lng: 72.8567 }, open: false },
  { name: "Quick Pharmacy Andheri", category: "Pharmacy", city: "Mumbai", area: "Andheri East", pincode: "400069", coords: { lat: 19.1136, lng: 72.8697 }, open: true },

  // Delhi
  { name: "Delhi Kirana Mart", category: "Grocery", city: "Delhi", area: "Karol Bagh", pincode: "110005", coords: { lat: 28.6519, lng: 77.1909 }, open: true },
  { name: "Rajdhani General Store", category: "General", city: "Delhi", area: "Lajpat Nagar", pincode: "110024", coords: { lat: 28.5653, lng: 77.2434 }, open: true },
  { name: "Fresh Veggie Corner", category: "Vegetables", city: "Delhi", area: "Saket", pincode: "110017", coords: { lat: 28.5245, lng: 77.2066 }, open: true },
  { name: "Delhi Bakers", category: "Bakery", city: "Delhi", area: "Connaught Place", pincode: "110001", coords: { lat: 28.6315, lng: 77.2167 }, open: true },
  { name: "MedPlus Pitampura", category: "Pharmacy", city: "Delhi", area: "Pitampura", pincode: "110034", coords: { lat: 28.7041, lng: 77.1315 }, open: true },

  // Bangalore
  { name: "Namma Kirana", category: "Grocery", city: "Bangalore", area: "Koramangala", pincode: "560034", coords: { lat: 12.9352, lng: 77.6245 }, open: true },
  { name: "Indiranagar Dairy", category: "Dairy", city: "Bangalore", area: "Indiranagar", pincode: "560038", coords: { lat: 12.9784, lng: 77.6408 }, open: true },
  { name: "BTM Vegetables", category: "Vegetables", city: "Bangalore", area: "BTM Layout", pincode: "560076", coords: { lat: 12.9166, lng: 77.6101 }, open: true },
  { name: "Whitefield Supermart", category: "General", city: "Bangalore", area: "Whitefield", pincode: "560066", coords: { lat: 12.9698, lng: 77.7500 }, open: false },
  { name: "HSR Pharmacy", category: "Pharmacy", city: "Bangalore", area: "HSR Layout", pincode: "560102", coords: { lat: 12.9116, lng: 77.6389 }, open: true },

  // Pune
  { name: "Pune Grocery World", category: "Grocery", city: "Pune", area: "Kothrud", pincode: "411038", coords: { lat: 18.5089, lng: 73.8118 }, open: true },
  { name: "Aundh Daily Needs", category: "General", city: "Pune", area: "Aundh", pincode: "411007", coords: { lat: 18.5590, lng: 73.8079 }, open: true },
  { name: "Baner Bakers", category: "Bakery", city: "Pune", area: "Baner", pincode: "411045", coords: { lat: 18.5590, lng: 73.7868 }, open: true },

  // Chennai
  { name: "Chennai Grocery Central", category: "Grocery", city: "Chennai", area: "Anna Nagar", pincode: "600040", coords: { lat: 13.0850, lng: 80.2101 }, open: true },
  { name: "T Nagar Vegetables", category: "Vegetables", city: "Chennai", area: "T Nagar", pincode: "600017", coords: { lat: 13.0418, lng: 80.2341 }, open: true },
];

const GROCERY_PRODUCTS = [
  // Staples
  { name: "Tata Salt", price: 22, unit: "kg", stock: 200 },
  { name: "Aashirvaad Atta (5kg)", price: 210, unit: "packet", stock: 80 },
  { name: "India Gate Rice (5kg)", price: 320, unit: "packet", stock: 60 },
  { name: "Fortune Sunflower Oil (1L)", price: 135, unit: "litre", stock: 90 },
  { name: "Saffola Oil (1L)", price: 155, unit: "litre", stock: 75 },
  { name: "Toor Dal (1kg)", price: 115, unit: "kg", stock: 100 },
  { name: "Moong Dal (500g)", price: 65, unit: "packet", stock: 120 },
  { name: "Chana Dal (1kg)", price: 95, unit: "kg", stock: 100 },
  { name: "Urad Dal (500g)", price: 72, unit: "packet", stock: 90 },
  { name: "Maida (1kg)", price: 45, unit: "kg", stock: 150 },
  { name: "Besan (500g)", price: 38, unit: "packet", stock: 110 },
  { name: "Suji / Rava (500g)", price: 30, unit: "packet", stock: 120 },
  { name: "Sugar (1kg)", price: 46, unit: "kg", stock: 200 },
  { name: "Jaggery (500g)", price: 52, unit: "packet", stock: 80 },
  { name: "Poha (500g)", price: 32, unit: "packet", stock: 100 },
  { name: "Sabudana (500g)", price: 58, unit: "packet", stock: 70 },
  // Spices
  { name: "MDH Garam Masala (100g)", price: 55, unit: "packet", stock: 150 },
  { name: "Everest Turmeric (200g)", price: 35, unit: "packet", stock: 160 },
  { name: "Everest Red Chilli (100g)", price: 42, unit: "packet", stock: 130 },
  { name: "Everest Coriander Powder (200g)", price: 38, unit: "packet", stock: 120 },
  { name: "MDH Sambhar Masala (100g)", price: 48, unit: "packet", stock: 100 },
  { name: "Kitchen King Masala (100g)", price: 52, unit: "packet", stock: 110 },
  { name: "Cumin Seeds (100g)", price: 28, unit: "packet", stock: 140 },
  { name: "Mustard Seeds (100g)", price: 18, unit: "packet", stock: 150 },
  { name: "Cardamom (50g)", price: 65, unit: "packet", stock: 60 },
  { name: "Cinnamon Sticks (50g)", price: 32, unit: "packet", stock: 70 },
  { name: "Bay Leaves (20g)", price: 18, unit: "packet", stock: 90 },
  // Snacks
  { name: "Lay's Classic Salted (26g)", price: 20, unit: "piece", stock: 200 },
  { name: "Kurkure Masala Munch (90g)", price: 20, unit: "piece", stock: 180 },
  { name: "Haldirams Bhujia (200g)", price: 55, unit: "packet", stock: 120 },
  { name: "Haldirams Mixture (200g)", price: 55, unit: "packet", stock: 100 },
  { name: "Bingo Mad Angles (37g)", price: 20, unit: "piece", stock: 160 },
  { name: "Parle-G Biscuits (800g)", price: 58, unit: "packet", stock: 90 },
  { name: "Oreo Chocolate Cream (120g)", price: 45, unit: "packet", stock: 130 },
  { name: "Britannia Good Day (75g)", price: 20, unit: "packet", stock: 150 },
  // Beverages
  { name: "Tata Tea Premium (250g)", price: 115, unit: "packet", stock: 80 },
  { name: "Red Label Tea (250g)", price: 125, unit: "packet", stock: 75 },
  { name: "Nescafe Classic (50g)", price: 145, unit: "packet", stock: 60 },
  { name: "Bru Coffee (50g)", price: 98, unit: "packet", stock: 70 },
  { name: "Tropicana Orange (1L)", price: 125, unit: "litre", stock: 60 },
  { name: "Minute Maid Pulpy Orange (400ml)", price: 30, unit: "piece", stock: 100 },
  { name: "Maaza Mango (600ml)", price: 35, unit: "piece", stock: 120 },
  // Household
  { name: "Surf Excel Easy Wash (1kg)", price: 195, unit: "kg", stock: 60 },
  { name: "Ariel Powder (1kg)", price: 225, unit: "kg", stock: 55 },
  { name: "Vim Dishwash Bar (200g)", price: 32, unit: "piece", stock: 100 },
  { name: "Lizol Floor Cleaner (500ml)", price: 155, unit: "piece", stock: 40 },
  { name: "Dettol Soap (75g)", price: 45, unit: "piece", stock: 120 },
  { name: "Lifebuoy Soap (75g)", price: 40, unit: "piece", stock: 130 },
  { name: "Colgate MaxFresh (150g)", price: 98, unit: "piece", stock: 90 },
];

const DAIRY_PRODUCTS = [
  { name: "Amul Full Cream Milk (500ml)", price: 30, unit: "piece", stock: 100 },
  { name: "Amul Toned Milk (500ml)", price: 27, unit: "piece", stock: 120 },
  { name: "Mother Dairy Milk (500ml)", price: 28, unit: "piece", stock: 80 },
  { name: "Amul Butter (100g)", price: 58, unit: "piece", stock: 90 },
  { name: "Amul Butter (500g)", price: 285, unit: "piece", stock: 40 },
  { name: "Britannia Cheese Slice (200g)", price: 125, unit: "packet", stock: 50 },
  { name: "Amul Processed Cheese (200g)", price: 130, unit: "packet", stock: 45 },
  { name: "Mother Dairy Paneer (200g)", price: 80, unit: "piece", stock: 60 },
  { name: "Amul Gold Paneer (200g)", price: 85, unit: "piece", stock: 55 },
  { name: "Amul Dahi (400g)", price: 40, unit: "piece", stock: 80 },
  { name: "Mother Dairy Mishti Doi (100g)", price: 25, unit: "piece", stock: 70 },
  { name: "Amul Taaza Cream (25g)", price: 22, unit: "piece", stock: 100 },
  { name: "Amul Lassi (200ml)", price: 25, unit: "piece", stock: 90 },
  { name: "Amul Kool Milk Shake Chocolate (200ml)", price: 30, unit: "piece", stock: 80 },
  { name: "Yogabar Greek Yogurt (400g)", price: 180, unit: "piece", stock: 30 },
  { name: "Nestle a+ Dahi (400g)", price: 52, unit: "piece", stock: 65 },
  { name: "Amul Ghee (500ml)", price: 285, unit: "piece", stock: 40 },
  { name: "Amul Condensed Milk (400g)", price: 95, unit: "piece", stock: 50 },
];

const VEGETABLE_PRODUCTS = [
  { name: "Tomato", price: 30, unit: "kg", stock: 50 },
  { name: "Onion", price: 35, unit: "kg", stock: 80 },
  { name: "Potato", price: 25, unit: "kg", stock: 100 },
  { name: "Garlic", price: 120, unit: "kg", stock: 20 },
  { name: "Ginger (250g)", price: 20, unit: "piece", stock: 40 },
  { name: "Green Chilli (250g)", price: 15, unit: "piece", stock: 60 },
  { name: "Capsicum", price: 50, unit: "kg", stock: 30 },
  { name: " Brinjal", price: 35, unit: "kg", stock: 25 },
  { name: "Bottle Gourd", price: 28, unit: "piece", stock: 30 },
  { name: "Bitter Gourd", price: 40, unit: "kg", stock: 20 },
  { name: "Okra / Bhindi", price: 45, unit: "kg", stock: 25 },
  { name: "Cauliflower", price: 35, unit: "piece", stock: 30 },
  { name: "Cabbage", price: 25, unit: "piece", stock: 35 },
  { name: "Spinach (500g)", price: 20, unit: "piece", stock: 40 },
  { name: "Fenugreek Leaves (250g)", price: 15, unit: "piece", stock: 30 },
  { name: "Coriander Leaves (100g)", price: 10, unit: "piece", stock: 60 },
  { name: "Carrots", price: 40, unit: "kg", stock: 35 },
  { name: "Beetroot", price: 35, unit: "kg", stock: 20 },
  { name: "Radish", price: 25, unit: "kg", stock: 25 },
  { name: "Peas (500g)", price: 45, unit: "piece", stock: 40 },
  { name: "Sweet Corn (2 pcs)", price: 30, unit: "piece", stock: 30 },
  { name: "Lemon (6 pcs)", price: 20, unit: "piece", stock: 50 },
  { name: "Coconut", price: 30, unit: "piece", stock: 40 },
  { name: "Apple (4 pcs)", price: 80, unit: "piece", stock: 30 },
  { name: "Banana (12 pcs)", price: 45, unit: "piece", stock: 50 },
  { name: "Papaya (1 pc)", price: 65, unit: "piece", stock: 20 },
  { name: "Guava (4 pcs)", price: 40, unit: "piece", stock: 25 },
];

const BAKERY_PRODUCTS = [
  { name: "Whole Wheat Bread (400g)", price: 42, unit: "piece", stock: 50 },
  { name: "White Sandwich Bread (400g)", price: 38, unit: "piece", stock: 60 },
  { name: "Multigrain Bread (450g)", price: 55, unit: "piece", stock: 40 },
  { name: "Pav Buns (6 pcs)", price: 28, unit: "piece", stock: 70 },
  { name: "Butter Croissant", price: 45, unit: "piece", stock: 30 },
  { name: "Plain Croissant", price: 35, unit: "piece", stock: 35 },
  { name: "Chocolate Muffin", price: 40, unit: "piece", stock: 40 },
  { name: "Blueberry Muffin", price: 45, unit: "piece", stock: 35 },
  { name: "Banana Cake (250g)", price: 85, unit: "piece", stock: 20 },
  { name: "Chocolate Brownie", price: 50, unit: "piece", stock: 25 },
  { name: "Vanilla Cupcake", price: 35, unit: "piece", stock: 30 },
  { name: "Rum Ball (4 pcs)", price: 60, unit: "piece", stock: 20 },
  { name: "Cookies Assorted (200g)", price: 75, unit: "packet", stock: 30 },
  { name: "Atta Biscuit (200g)", price: 30, unit: "packet", stock: 60 },
  { name: "Pizza Base (2 pcs)", price: 65, unit: "packet", stock: 25 },
  { name: "French Baguette", price: 55, unit: "piece", stock: 20 },
  { name: "Rusk (200g)", price: 35, unit: "packet", stock: 50 },
  { name: "Khari Biscuit (200g)", price: 30, unit: "packet", stock: 45 },
];

const PHARMACY_PRODUCTS = [
  { name: "Dettol Hand Sanitizer (50ml)", price: 65, unit: "piece", stock: 100 },
  { name: "Savlon Antiseptic (100ml)", price: 80, unit: "piece", stock: 60 },
  { name: "Band-Aid Classic (10 pcs)", price: 35, unit: "packet", stock: 80 },
  { name: "Vicks VapoRub (25g)", price: 58, unit: "piece", stock: 70 },
  { name: "Volini Pain Relief Spray (55g)", price: 165, unit: "piece", stock: 40 },
  { name: "Moov Cream (50g)", price: 75, unit: "piece", stock: 50 },
  { name: "Combiflam Tablet (10 pcs)", price: 42, unit: "piece", stock: 60 },
  { name: "Crocin Advance (10 pcs)", price: 25, unit: "piece", stock: 80 },
  { name: "Digene Gel (200ml)", price: 125, unit: "piece", stock: 40 },
  { name: "Eno Fruit Salt (100g)", price: 65, unit: "piece", stock: 60 },
  { name: "ORS Electrolyte Sachet (5 pcs)", price: 30, unit: "packet", stock: 90 },
  { name: "Cetaphil Moisturising Cream (80g)", price: 225, unit: "piece", stock: 30 },
  { name: "Lacto Calamine Lotion (60ml)", price: 120, unit: "piece", stock: 35 },
  { name: "Johnson's Baby Powder (200g)", price: 135, unit: "piece", stock: 45 },
  { name: "Himalaya Face Wash (150ml)", price: 125, unit: "piece", stock: 50 },
  { name: "Sebamed Face Wash (150ml)", price: 290, unit: "piece", stock: 20 },
  { name: "Nivea Body Lotion (200ml)", price: 155, unit: "piece", stock: 40 },
  { name: "Vitamin C Tablets (30 pcs)", price: 185, unit: "piece", stock: 30 },
  { name: "D-Cal Calcium Tablet (30 pcs)", price: 145, unit: "piece", stock: 25 },
  { name: "Glucose-D Powder (500g)", price: 70, unit: "packet", stock: 50 },
];

const GENERAL_PRODUCTS = [
  { name: "Surf Excel Bar (200g)", price: 48, unit: "piece", stock: 80 },
  { name: "Scotch-Brite Scrub (2 pcs)", price: 65, unit: "packet", stock: 60 },
  { name: "Harpic Toilet Cleaner (500ml)", price: 110, unit: "piece", stock: 40 },
  { name: "Colin Glass Cleaner (500ml)", price: 115, unit: "piece", stock: 35 },
  { name: "Odoil Room Freshener (250ml)", price: 145, unit: "piece", stock: 30 },
  { name: "Mortein Mosquito Coil (10 pcs)", price: 55, unit: "packet", stock: 70 },
  { name: "Good Knight Fast Card (10 pcs)", price: 65, unit: "packet", stock: 60 },
  { name: "Pril Liquid Dishwash (750ml)", price: 130, unit: "piece", stock: 45 },
  { name: "Prestige Knife Set (3 pcs)", price: 345, unit: "piece", stock: 15 },
  { name: "Steel Tiffin Box (3 tier)", price: 280, unit: "piece", stock: 20 },
  { name: "Tupperware Water Bottle (750ml)", price: 320, unit: "piece", stock: 15 },
  { name: "Cello Ball Pen (10 pcs)", price: 60, unit: "packet", stock: 50 },
  { name: "Fevicol SH (75g)", price: 45, unit: "piece", stock: 40 },
  { name: "Scotch Magic Tape (12mm)", price: 35, unit: "piece", stock: 60 },
  { name: "Eveready AA Battery (4 pcs)", price: 70, unit: "packet", stock: 55 },
  { name: "Duracell AA Battery (2 pcs)", price: 85, unit: "packet", stock: 45 },
  { name: "Philips LED Bulb 9W", price: 120, unit: "piece", stock: 30 },
  { name: "Bajaj LED Bulb 12W", price: 130, unit: "piece", stock: 25 },
  { name: "Plastic Hanger (5 pcs)", price: 45, unit: "packet", stock: 60 },
  { name: "Clothespin / Clip (20 pcs)", price: 38, unit: "packet", stock: 70 },
];

const PRODUCT_MAP = {
  Grocery: GROCERY_PRODUCTS,
  Dairy: DAIRY_PRODUCTS,
  Vegetables: VEGETABLE_PRODUCTS,
  Bakery: BAKERY_PRODUCTS,
  Pharmacy: PHARMACY_PRODUCTS,
  General: GENERAL_PRODUCTS,
};

// ─── Seed ──────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Find or create a seed owner user
  let owner = await User.findOne({ email: "seedowner@localmart.dev" });
  if (!owner) {
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash("Seed1234", 10);
    owner = await User.create({
      name: "Seed Owner", email: "seedowner@localmart.dev", phone: "9000000099",
      password: hash, role: "shop_owner",
    });
    console.log("✅ Created seed owner user");
  }

  let totalShops = 0;
  let totalProducts = 0;

  for (const s of SHOPS) {
    // Skip if shop already exists
    let shop = await Shop.findOne({ name: s.name });
    if (!shop) {
      shop = await Shop.create({
        ownerId: owner._id,
        name: s.name,
        category: s.category,
        address: `${s.area}, ${s.city} - ${s.pincode}`,
        pincode: s.pincode,
        isOpen: s.open,
        timings: { open: "08:00", close: "22:00" },
        coords: s.coords,
        rating: (Math.random() * 2 + 3).toFixed(1),
        totalRatings: Math.floor(Math.random() * 150) + 10,
      });
      totalShops++;
      console.log(`  🏪 Created shop: ${shop.name} (${s.city})`);
    } else {
      console.log(`  ⏩ Skipped existing shop: ${shop.name}`);
    }

    const products = PRODUCT_MAP[s.category] || GROCERY_PRODUCTS;
    for (const p of products) {
      const exists = await Product.findOne({ shopId: shop._id, name: p.name });
      if (!exists) {
        await Product.create({
          shopId: shop._id,
          name: p.name,
          category: s.category,
          price: p.price,
          unit: p.unit,
          stock: p.stock + Math.floor(Math.random() * 20),
          isAvailable: true,
          image: "",
        });
        totalProducts++;
      }
    }
    console.log(`    📦 Products added for ${shop.name}`);
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   Shops created: ${totalShops}`);
  console.log(`   Products created: ${totalProducts}`);
  await mongoose.disconnect();
}

seed().catch((e) => { console.error("❌", e.message); process.exit(1); });
