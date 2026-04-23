require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images as static files
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Public stats endpoint (no auth required for hero section)
app.get('/api/stats/public', async (req, res) => {
  try {
    const Item = require('./models/Item');
    const [totalItems, resolvedItems, activeItems] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ status: 'resolved' }),
      Item.countDocuments({ status: { $in: ['open', 'claimed'] } }),
    ]);
    res.json({ totalItems, resolvedItems, activeItems });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

async function seedAdmin() {
  const User = require('./models/User');
  const adminEmail = '0241csiot028@niet.co.in';
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    await User.create({
      name: 'Anushka (Admin)',
      email: adminEmail,
      password: 'admin123',
      role: 'admin',
      studentId: '0241CSIOT028',
    });
    console.log('🔑 Admin user seeded: 0241csiot028@niet.co.in / admin123');
  }
}

async function seedDemoUser() {
  const User = require('./models/User');
  const demoEmail = 'student@niet.co.in';
  const existing = await User.findOne({ email: demoEmail });
  if (!existing) {
    const user = await User.create({
      name: 'Anushka Sharma',
      email: demoEmail,
      password: 'student123',
      role: 'user',
      studentId: '2024-CS-042',
    });
    console.log('👤 Demo student seeded: student@niet.co.in / student123');
    return user;
  }
  return existing;
}

async function seedItems(userId) {
  const Item = require('./models/Item');
  const count = await Item.countDocuments();
  if (count > 0) return;

  const demoItems = [
    {
      title: 'Silver MacBook Pro 14"',
      description: 'Found a MacBook Pro near the Main Library entrance. Silver color, 14-inch model with a "CS Society" sticker on the lid. Has a visible scratch on the bottom-right corner.',
      category: 'Electronics',
      type: 'found',
      location: 'Main Library',
      heldAt: 'Library Front Desk',
      date: new Date('2026-04-18'),
      status: 'open',
      reportedBy: userId,
    },
    {
      title: 'Blue JBL Wireless Earbuds',
      description: 'Lost my JBL Tune 230NC wireless earbuds somewhere between Block A and the Cafeteria. Navy blue charging case with my initials "AS" scratched on the bottom.',
      category: 'Electronics',
      type: 'lost',
      location: 'Block A Corridor',
      date: new Date('2026-04-19'),
      status: 'open',
      reportedBy: userId,
    },
    {
      title: 'University ID Card — Priya Gupta',
      description: 'Found a university ID card belonging to Priya Gupta, B.Tech CSE 3rd Year. Card number 2023-CSE-078. Found on the bench near the basketball court.',
      category: 'ID/Cards',
      type: 'found',
      location: 'Sports Complex',
      heldAt: 'Security Office, Gate 2',
      date: new Date('2026-04-17'),
      status: 'claimed',
      reportedBy: userId,
    },
    {
      title: 'Black Leather Wallet',
      description: 'Lost a black leather wallet (Tommy Hilfiger) containing my Aadhaar card and ₹2,000 cash. Last seen at the mess hall during lunch.',
      category: 'Accessories',
      type: 'lost',
      location: 'Central Mess Hall',
      date: new Date('2026-04-20'),
      status: 'open',
      reportedBy: userId,
    },
    {
      title: 'Set of Honda Bike Keys',
      description: 'Found a set of Honda Activa keys with a red keychain near the parking lot behind the admin building. Has 3 keys on the ring.',
      category: 'Keys',
      type: 'found',
      location: 'Parking Lot B',
      heldAt: 'Admin Office, Room 102',
      date: new Date('2026-04-16'),
      status: 'resolved',
      reportedBy: userId,
    },
    {
      title: 'Engineering Mathematics Textbook',
      description: 'Lost my "Higher Engineering Mathematics" by B.S. Grewal. Has yellow highlighting on several pages and my name written inside the cover. Hardcover edition.',
      category: 'Books',
      type: 'lost',
      location: 'Seminar Hall, Block C',
      date: new Date('2026-04-15'),
      status: 'open',
      reportedBy: userId,
    },
    {
      title: 'Wildcraft Backpack (Grey)',
      description: 'Found a grey Wildcraft backpack with a water bottle in the side pocket. Contains some notebooks and a calculator. Left in the computer lab after the evening session.',
      category: 'Bags',
      type: 'found',
      location: 'Computer Lab 3, Block D',
      heldAt: 'Lab Coordinator Office',
      date: new Date('2026-04-19'),
      status: 'open',
      reportedBy: userId,
    },
    {
      title: 'Parker Pen & Geometry Box Set',
      description: 'Lost a Parker fountain pen (blue-black) along with a Staedtler geometry box in a brown pouch. Left in the exam hall during the midsem exam.',
      category: 'Stationery',
      type: 'lost',
      location: 'Exam Hall 2',
      date: new Date('2026-04-14'),
      status: 'resolved',
      reportedBy: userId,
    },
    {
      title: 'White Formal Lab Coat',
      description: 'Found a white lab coat (size M) with "Chemistry Dept" embroidered on the pocket. Left hanging in the Chemistry Lab after the practical session.',
      category: 'Clothing',
      type: 'found',
      location: 'Chemistry Lab, Block B',
      heldAt: 'Chemistry Dept Staff Room',
      date: new Date('2026-04-18'),
      status: 'open',
      reportedBy: userId,
    },
    {
      title: 'Milton Steel Water Bottle',
      description: 'Lost a 1-liter Milton steel water bottle with a dent on the lid. Has a faded "Save Water" sticker on it. Might have left it in the gym or the basketball court area.',
      category: 'Water Bottles',
      type: 'lost',
      location: 'Gymnasium',
      date: new Date('2026-04-17'),
      status: 'open',
      reportedBy: userId,
    },
  ];

  await Item.insertMany(demoItems);
  console.log(`📦 Seeded ${demoItems.length} demo items`);
}

async function startServer() {
  let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lost-and-found';

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ MongoDB connected (external)');
  } catch (err) {
    console.log('⚠️  External MongoDB not available, starting in-memory server...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected (in-memory)');
  }

  await seedAdmin();
  const demoUser = await seedDemoUser();
  await seedItems(demoUser._id);

  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
