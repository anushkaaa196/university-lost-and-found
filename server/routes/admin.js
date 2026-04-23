const express = require('express');
const adminAuth = require('../middleware/admin');
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

// GET /api/admin/stats — Dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalItems, openItems, claimedItems, resolvedItems, totalUsers] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ status: 'open' }),
      Item.countDocuments({ status: 'claimed' }),
      Item.countDocuments({ status: 'resolved' }),
      User.countDocuments(),
    ]);

    const lostItems = await Item.countDocuments({ type: 'lost' });
    const foundItems = await Item.countDocuments({ type: 'found' });

    res.json({
      totalItems,
      openItems,
      claimedItems,
      resolvedItems,
      totalUsers,
      lostItems,
      foundItems,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users — List all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role studentId createdAt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/items — List all items with full details
router.get('/items', adminAuth, async (req, res) => {
  try {
    const { type, status, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('reportedBy', 'name email studentId')
        .populate('claimedBy', 'name email studentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Item.countDocuments(filter),
    ]);

    res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Admin items error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/items/:id/status — Change item status
router.put('/items/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'claimed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be open, claimed, or resolved.' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.status = status;
    await item.save();

    // Notify the item reporter about status change
    await Notification.create({
      recipient: item.reportedBy,
      sender: req.user.id,
      item: item._id,
      message: `An admin has changed the status of your item "${item.title}" to "${status}".`,
    });

    const populated = await item.populate([
      { path: 'reportedBy', select: 'name email' },
      { path: 'claimedBy', select: 'name email' },
    ]);
    res.json(populated);
  } catch (err) {
    console.error('Admin status change error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/items/:id — Delete any item
router.delete('/items/:id', adminAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    await item.deleteOne();
    res.json({ message: 'Item deleted by admin' });
  } catch (err) {
    console.error('Admin delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
