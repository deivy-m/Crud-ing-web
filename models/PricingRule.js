const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema({
  nombre: { type: String, required: [true, 'El nombre de la regla es obligatorio'], trim: true },
  tipo: { 
    type: String, 
    required: [true, 'El tipo es obligatorio'],
    enum: {
      values: ['horario', 'categoria_barbero', 'temporada'],
      message: 'El tipo debe ser horario, categoria_barbero o temporada'
    }
  },
  condicion: { type: String, required: [true, 'La condición es obligatoria'], trim: true },
  factor: { 
    type: Number, 
    required: [true, 'El factor es obligatorio'],
    min: [-0.5, 'El factor no puede ser menor a -0.50'],
    max: [1.0, 'El factor no puede ser mayor a 1.00']
  },
  descripcion: { type: String, trim: true },
  temporada: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', default: null },
  activo: { type: Boolean, default: true }
});

module.exports = mongoose.model('PricingRule', pricingRuleSchema);
