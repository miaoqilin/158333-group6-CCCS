const express = require('express');
const router = express.Router();
const { getMenu, addMenu, updateMenu, deleteMenu } = require('../controllers/menuController');

router.get('/', getMenu);
router.post('/', addMenu);
router.put('/:id', updateMenu);
router.delete('/:id', deleteMenu);

module.exports = router;