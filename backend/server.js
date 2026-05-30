import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'finance_tracker_secret_key_123';
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB Atlas or Local MongoDB
if (!MONGODB_URI) {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  WARNING: MONGODB_URI is not set in your .env file!');
  console.warn('\x1b[33m%s\x1b[0m', 'Please add your MongoDB Atlas Connection URI to your .env file: MONGODB_URI=your_connection_string');
  console.warn('Attempting to connect to local MongoDB database at mongodb://localhost:27017/spendora as fallback...');
}

const dbUri = MONGODB_URI || 'mongodb://localhost:27017/spendora';

mongoose.connect(dbUri)
  .then(() => console.log('Successfully connected to MongoDB database! 🚀'))
  .catch(err => {
    console.error('CRITICAL ERROR: Failed to connect to MongoDB!', err.message);
    console.error('If you are trying to connect to MongoDB Atlas, please check your network connection, IP whitelisting (0.0.0.0/0), and connection credentials in the .env file.');
  });

// ==========================================
// MONGOOSE SCHEMAS & MODELS
// ==========================================

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const financialDataSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
  personalTransactions: { type: Array, default: [] },
  businessTransactions: { type: Array, default: [] },
  businessCustomers: { type: Array, default: [] },
  updatedAt: { type: Date, default: Date.now }
});
const FinancialData = mongoose.model('FinancialData', financialDataSchema);

// ==========================================
// MIDDLEWARE
// ==========================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied: Token missing' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Access denied: Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ==========================================
// API ENDPOINTS
// ==========================================

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email: normalizedEmail, password: hashedPassword });
    await newUser.save();

    // Create empty financial data record for the new user
    const newData = new FinancialData({ userEmail: normalizedEmail });
    await newData.save();

    const token = jwt.sign({ email: normalizedEmail }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'User registered successfully', token, email: normalizedEmail });
  } catch (err) {
    console.error('Registration database error:', err);
    res.status(500).json({ error: 'Registration failed due to a database error.' });
  }
});

// Login existing user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: 'User completely not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid security password' });
    }

    const token = jwt.sign({ email: normalizedEmail }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email: normalizedEmail });
  } catch (err) {
    console.error('Login database error:', err);
    res.status(500).json({ error: 'Authentication failed due to a database error.' });
  }
});

// Fetch user's syncable financial data
app.get('/api/user/financial-data', authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;
    let data = await FinancialData.findOne({ userEmail: email });
    
    // Fallback: If no financial data document exists, create one
    if (!data) {
      data = new FinancialData({ userEmail: email });
      await data.save();
    }
    
    res.json({
      personalTransactions: data.personalTransactions,
      businessTransactions: data.businessTransactions,
      businessCustomers: data.businessCustomers
    });
  } catch (err) {
    console.error('Fetch data error:', err);
    res.status(500).json({ error: 'Failed to fetch financial history.' });
  }
});

// Synchronize user's financial data
app.put('/api/user/financial-data', authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;
    const { personalTransactions, businessTransactions, businessCustomers } = req.body;
    
    const updatedData = await FinancialData.findOneAndUpdate(
      { userEmail: email },
      { 
        personalTransactions: personalTransactions || [],
        businessTransactions: businessTransactions || [],
        businessCustomers: businessCustomers || [],
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );
    
    res.json({
      message: 'Financial data successfully synced with MongoDB Atlas',
      updatedAt: updatedData.updatedAt
    });
  } catch (err) {
    console.error('Sync data error:', err);
    res.status(500).json({ error: 'Failed to sync financial history.' });
  }
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, '0.0.0.0', () => console.log(`Auth & Sync backend listening actively on port ${PORT} against 0.0.0.0`));
