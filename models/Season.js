const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  nombre: { type: String, required: [true, 'El nombre de la temporada es obligatorio'], trim: true },
  fechaInicio: { type: Date, required: [true, 'La fecha de inicio es obligatoria'] },
  fechaFin: { type: Date, required: [true, 'La fecha de fin es obligatoria'] },
  factorPrecio: { 
    type: Number, 
    required: [true, 'El factor de precio es obligatorio'],
    min: [-0.5, 'El factor no puede ser menor a -0.50'],
    max: [1.0, 'El factor no puede ser mayor a 1.00']
  },
  activo: { type: Boolean, default: true }
});

module.exports = mongoose.model('Season', seasonSchema);
