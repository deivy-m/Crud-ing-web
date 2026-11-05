const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', barberController.listBarbers);
router.get('/new', barberController.getCreateForm);
router.post('/', barberController.createBarber);
router.get('/edit/:id', barberController.getEditForm);
router.post('/update/:id', barberController.updateBarber);
router.post('/delete/:id', barberController.deleteBarber);

module.exports = router;
