import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'finance_tracker_secret_key_123';
const DB_FILE = path.join(__dirname, 'users.json');

// Ensure DB file exists
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }));

const getUsers = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')).users;
const saveUsers = (users) => fs.writeFileSync(DB_FILE, JSON.stringify({ users }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User automatically exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword });
    saveUsers(users);

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'User created', token, email });
  } catch (err) {
    res.status(500).json({ error: 'Server mapping error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = getUsers();
    
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: 'User completely not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid security password' });

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email });
  } catch (err) {
    res.status(500).json({ error: 'Server authentication parsing error' });
  }
});

app.listen(5005, () => console.log('Auth backend listening actively on port 5005'));
