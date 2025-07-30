const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Cart = mongoose.model('Cart', new mongoose.Schema({
  productId: String,
  quantity: Number
}));

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

router.get('/', async (_, res) => {
  const items = await Cart.find();
  res.status(200).json(items);
});

router.delete('/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await Cart.deleteMany({ productId }); 
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
