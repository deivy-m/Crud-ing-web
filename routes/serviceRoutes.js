const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware para proteger todas las rutas del CRUD
router.use(authMiddleware);

router.get('/', serviceController.listServices);
router.get('/new', serviceController.getCreateForm);
router.post('/', serviceController.createService);
router.get('/edit/:id', serviceController.getEditForm);
router.post('/update/:id', serviceController.updateService);
router.post('/delete/:id', serviceController.deleteService);

module.exports = router;