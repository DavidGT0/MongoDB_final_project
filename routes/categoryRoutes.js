const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.post('/', categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/products/count', categoryController.getProductsCountPerCategory);
router.get('/:id/products/count', categoryController.getProductsCountByCategory);
module.exports = router;
