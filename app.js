require('dotenv').config();
const express = require('express');
const session = require('express-session');
const connectDB = require('./config/db.js');

const app = express();

// Conectar a MongoDB Atlas
connectDB();

// Configuraciones de Express y Motor de Vistas EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sesiones de usuario
app.use(session({
  secret: process.env.SESSION_SECRET || 'ASqoSQa1D3w4mXaw',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Rutas Públicas y de Autenticación
app.get('/', (req, res) => res.render('index'));
app.use('/auth', require('./routes/authRoutes'));

// Rutas del Panel de Administración (Alimentan el Core)
app.use('/services', require('./routes/serviceRoutes'));
app.use('/barbers', require('./routes/barberRoutes'));
app.use('/seasons', require('./routes/seasonRoutes'));
app.use('/pricing-rules', require('./routes/pricingRuleRoutes'));

// Ruta del Core (Cotizador de Precios Dinámicos)
app.use('/pricing', require('./routes/pricingRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`));
