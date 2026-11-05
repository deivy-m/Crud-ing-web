const express = require('express');
const router = express.Router();
const seasonController = require('../controllers/seasonController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', seasonController.listSeasons);
router.get('/new', seasonController.getCreateForm);
router.post('/', seasonController.createSeason);
router.get('/edit/:id', seasonController.getEditForm);
router.post('/update/:id', seasonController.updateSeason);
router.post('/delete/:id', seasonController.deleteSeason);

module.exports = router;
