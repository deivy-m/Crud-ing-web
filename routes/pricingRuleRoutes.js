const express = require('express');
const router = express.Router();
const pricingRuleController = require('../controllers/pricingRuleController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', pricingRuleController.listRules);
router.get('/new', pricingRuleController.getCreateForm);
router.post('/', pricingRuleController.createRule);
router.get('/edit/:id', pricingRuleController.getEditForm);
router.post('/update/:id', pricingRuleController.updateRule);
router.post('/delete/:id', pricingRuleController.deleteRule);

module.exports = router;
