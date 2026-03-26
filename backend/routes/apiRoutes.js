const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const apiController = require('../controllers/apiController');

router.post('/auth/register', apiController.register);
router.post('/auth/login', apiController.login);

router.get('/categories', auth, apiController.getCategories);
router.post('/categories', auth, apiController.createCategory);

router.get('/groups', auth, apiController.getGroups);
router.post('/groups', auth, apiController.createGroup);

router.get('/expenses', auth, apiController.getExpenses);
router.post('/expenses', auth, apiController.createExpense);

router.get('/dashboard', auth, apiController.getDashboard);

module.exports = router;
