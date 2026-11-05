const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre es obligatorio'], 
    trim: true 
  },
  cedula: { 
    type: String, 
    required: [true, 'La cédula es obligatoria (dato sensible)'], 
    unique: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'El email es obligatorio'], 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  telefono: { 
    type: String, 
    required: [true, 'El teléfono es obligatorio'], 
    trim: true 
  },
  categoria: { 
    type: String, 
    required: [true, 'La categoría es obligatoria'],
    enum: {
      values: ['Junior', 'Senior', 'Master'],
      message: 'La categoría debe ser Junior, Senior o Master'
    }
  },
  activo: { 
    type: Boolean, 
    default: true 
  },
  fechaIngreso: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Barber', barberSchema);
