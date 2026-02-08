const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

connectDB();

const sampleProducts = [
  // 1️⃣ Medicine
  {
    name: 'Azithromycin 500mg',
    category: 'Medicine',
    subCategory: 'Antibiotics',
    price: 120,
    originalPrice: 150,
    description: 'Antibiotic tablet.',
    brand: 'Cipla',
    image: 'https://www.biofieldpharma.com/wp-content/uploads/2023/06/BIOFIELD-OZISET-500-TAB-1-scaled.jpg',
    isPrescriptionRequired: true,
    countInStock: 50
  },
  {
    name: 'Pantoprazole 40mg',
    category: 'Medicine',
    subCategory: 'Gastro',
    price: 95,
    originalPrice: 120,
    description: 'Acidity relief tablet.',
    brand: 'Sun Pharma',
    image: 'https://i.pinimg.com/736x/d6/aa/c7/d6aac737fa7418b8bc98b19dcf65f35c.jpg',
    isPrescriptionRequired: true,
    countInStock: 80
  },

  // 2️⃣ Baby Care
  {
    name: 'Pampers Active Baby (L)',
    category: 'Baby Care',
    subCategory: 'Baby Diapers',
    price: 899,
    originalPrice: 1100,
    description: 'Soft diapers for babies.',
    brand: 'Pampers',
    image: 'https://i.pinimg.com/1200x/d8/4f/b9/d84fb95d885267bab9584d04e440baf3.jpg',
    countInStock: 20
  },

  // 3️⃣ Vitamins
  {
    name: 'Limcee Vitamin C',
    category: 'Vitamins',
    subCategory: 'Vitamin C',
    price: 25,
    originalPrice: 30,
    description: 'Chewable Vitamin C tablets.',
    brand: 'Abbott',
    image: 'https://i.pinimg.com/1200x/70/f2/f1/70f2f154fa30b67c2bf645be1dc77cf0.jpg',
    countInStock: 200
  },

  // 4️⃣ Medical Devices
  {
    name: 'Rossmax Pulse Oximeter',
    category: 'Medical Devices',
    subCategory: 'Oximeters',
    price: 1299,
    originalPrice: 1599,
    description: 'Digital oxygen monitor.',
    brand: 'Rossmax',
    image: 'https://i.pinimg.com/1200x/f3/9d/94/f39d94a7639c46ad00b8bae1f7d77c09.jpg',
    countInStock: 22
  }
];

const importData = async () => {
  try {
    await Product.deleteMany();
    await Product.insertMany(sampleProducts);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Run command
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}