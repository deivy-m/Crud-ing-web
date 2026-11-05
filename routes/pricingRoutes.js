const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');

// Ruta pública o protegida según conveniencia (la dejamos accesible para demostración)
router.get('/', pricingController.showPricingCalculator);
router.post('/calculate', pricingController.calculateDynamicPrice);

module.exports = router;
