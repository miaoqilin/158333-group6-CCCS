const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/my', getUserOrders);
router.get('/', getAllOrders);
router.put('/:id', updateOrderStatus);

module.exports = router;