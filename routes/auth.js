const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Ruta de prueba para verificar que funciona
router.get('/test', (req, res) => {
  console.log('✅ Auth test route accessed');
  res.json({ message: 'Auth routes working!' });
});

// Ruta GET para /api/auth (opcional)
router.get('/', (req, res) => {
  res.json({ 
    message: 'Auth API endpoints',
    endpoints: {
      test: 'GET /api/auth/test',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login'
    }
  });
});

// Registro
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  
  console.log('📝 Register attempt for:', email);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await user.save();
    console.log('✅ User registered successfully:', email);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt for:', email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secreto', 
      { expiresIn: '1h' }
    );

    console.log('✅ Login successful for:', email);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
