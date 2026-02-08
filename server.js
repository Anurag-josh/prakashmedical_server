const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

/* ===============================
   CONNECT TO MONGODB ATLAS
================================ */
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📤 UPLOAD ROUTE
app.post('/api/upload', upload.single('image'), (req, res) => {
  res.send(`/${req.file.path}`);
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.log(err));

/* ===============================
   IMPORT EXISTING MODELS
================================ */
const Product = require("./models/Product");
const Order = require("./models/Order");

/* ===============================
   USER ROUTES ONLY
================================ */

//
// 1️⃣ GET ALL PRODUCTS
//
app.get("/api/products", async (req, res) => {
  try {
    let query = {};

    // 🔍 Search by keyword
    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, "i");
      query.$or = [
        { name: regex },
        { brand: regex },
        { category: regex },
      ];
    }

    // 📂 Filters
    if (req.query.category) query.category = req.query.category;
    if (req.query.subCategory) query.subCategory = req.query.subCategory;

    const products = await Product.find(query);

    // 👉 PRINT PRODUCTS IN TERMINAL
    console.log("Fetched Products:");
    console.log(products);

    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//
// 2️⃣ PLACE ORDER
//
app.post("/api/orders", async (req, res) => {
  try {
    const {
      orderItems,
      customerName,
      customerMobile,
      customerEmail,
      shippingAddress,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // Map top-level customer details to shippingAddress schema
    const finalShippingAddress = {
      ...shippingAddress,
      name: customerName,
      phone: customerMobile,
      email: customerEmail,
    };

    const order = new Order({
      orderItems,
      shippingAddress: finalShippingAddress,
      totalPrice,
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Order failed" });
  }
});

/* ===============================
   TEST ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("API running...");
});

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});