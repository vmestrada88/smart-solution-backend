const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const productRoutes = require('./routes/productRoutes');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'https://smartsolution-frontend-3tm4.vercel.app',
    'https://smartsolution-frontend-git-main-vmestrada88s-projects.vercel.app',
    /https:\/\/.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error conectando MongoDB:', err));

// IMPORTANTE: Agregar esta línea ANTES de las otras rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', productRoutes);
app.use('/api/clients', require('./routes/clientsRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({ message: 'Smart Solution Backend API funcionando!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor running en puerto: ${PORT}`));
