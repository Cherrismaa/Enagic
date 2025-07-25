const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Cart = mongoose.model('Cart', new mongoose.Schema({
  productId: String,
  quantity: Number
}));

// Add or update item
router.post('/', async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    let item = await Cart.findOne({ productId });
    if (item) {
      item.quantity = quantity;
      if (item.quantity < 1) await item.remove();
      else await item.save();
    } else if (quantity > 0) {
      item = new Cart({ productId, quantity });
      await item.save();
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all items
router.get('/', async (_, res) => {
  const items = await Cart.find();
  res.status(200).json(items);
});

// ✅ Delete item entirely — fixed version
router.delete('/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await Cart.deleteMany({ productId }); // Ensures all duplicates are removed
    if (result.deletedCount > 0) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: "Product not found in cart" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
