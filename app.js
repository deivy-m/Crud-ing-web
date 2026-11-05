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

// Redireccionar raíz directamente al login
app.get('/', (req, res) => res.redirect('/auth/login'));
app.use('/auth', require('./routes/authRoutes'));

// Rutas de administración
app.use('/services', require('./routes/serviceRoutes'));
app.use('/barbers', require('./routes/barberRoutes'));
app.use('/seasons', require('./routes/seasonRoutes'));
app.use('/pricing-rules', require('./routes/pricingRuleRoutes'));

// Cotizador (Core)
app.use('/pricing', require('./routes/pricingRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`));
