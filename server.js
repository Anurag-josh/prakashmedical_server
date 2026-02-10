const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");

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
  // Return the relative path for the uploaded image
  // Extract just the filename from the full path
  const fileName = path.basename(req.file.path);
  res.send(`/uploads/${fileName}`);
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

    console.log("Order request received:", {
      customerName,
      customerMobile,
      customerEmail,
      totalPrice,
      orderItemsCount: orderItems?.length || 0
    });

    // Debug: Log prescription images for each item
    orderItems?.forEach((item, index) => {
      console.log(`Item ${index + 1}: ${item.name}, Prescription: ${item.prescriptionImage || 'None'}`);
    });

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // Check inventory and reduce stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }
      
      if (product.countInStock < item.qty) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.name}. Available: ${product.countInStock}, Requested: ${item.qty}` 
        });
      }
      
      // Reduce inventory
      product.countInStock -= item.qty;
      await product.save();
      console.log(`Reduced stock for ${item.name}: ${item.qty} units. Remaining: ${product.countInStock}`);
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

    // Debug: Log saved order with prescriptions
    console.log("Order saved successfully:", {
      orderId: savedOrder._id,
      itemsWithPrescriptions: savedOrder.orderItems.filter(item => item.prescriptionImage).length
    });

    res.status(201).json(savedOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Order failed" });
  }
});

//
// 3️⃣ GET ALL ORDERS (for admin)
//
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//
// 4️⃣ GET ORDER BY ID
//
app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ===============================
   TEST ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("API running...");
});

/* ===============================
   RENDER SERVER HEARTBEAT
================================ */
const RENDER_SERVER_URL = "https://prakashmedical-server-4.onrender.com";

// Function to ping Render server
const pingRenderServer = async () => {
  try {
    const response = await axios.get(`${RENDER_SERVER_URL}/`);
    console.log(`[${new Date().toISOString()}] Render server ping successful: ${response.status}`);
  } catch (error) {
    console.log(`[${new Date().toISOString()}] Render server ping failed:`, error.message);
  }
};

// Ping Render server every 10 minutes (600000 ms)
setInterval(pingRenderServer, 600000);

// Initial ping on server start
pingRenderServer();

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Render server heartbeat started - pinging every 10 minutes`);
});