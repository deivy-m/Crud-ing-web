require('dotenv').config();
const express = require('express');
const session = require('express-session');
const connectDB = require('./config/db.js');

const app = express();

// Conectar a MongoDB
connectDB();

// Configuraciones
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));


app.use(session({
  secret: process.env.SESSION_SECRET || 'ASqoSQa1D3w4mXaw',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Rutas
app.get('/', (req, res) => res.render('index'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/services', require('./routes/serviceRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`));