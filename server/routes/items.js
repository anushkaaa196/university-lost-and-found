const express = require('express');
const { body, validationResult } = require('express-validator');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { broadcastNewItem } = require('../services/emailService');

const router = express.Router();

// GET /api/items  — list with optional filters
router.get('/', auth, async (req, res) => {
  try {
    const { type, category, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
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
        .populate('reportedBy', 'name email')
        .populate('claimedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Item.countDocuments(filter),
    ]);

    res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('List items error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/items/my  — current user's items
router.get('/my', auth, async (req, res) => {
  try {
    const items = await Item.find({ reportedBy: req.user.id })
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/items/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('claimedBy', 'name email');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/items  — now accepts multipart/form-data with optional image
router.post(
  '/',
  auth,
  upload.single('image'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('type').isIn(['lost', 'found']).withMessage('Type must be lost or found'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('date').notEmpty().withMessage('Date is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const { title, description, category, type, location, heldAt, date } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

      const item = await Item.create({
        title,
        description,
        category,
        type,
        location,
        heldAt: type === 'found' ? heldAt : '',
        date,
        imageUrl,
        reportedBy: req.user.id,
      });

      const populated = await item.populate('reportedBy', 'name email');

      // Fire-and-forget: broadcast email notification to all users
      broadcastNewItem(populated).catch((err) =>
        console.error('Email broadcast error:', err.message)
      );

      res.status(201).json(populated);
    } catch (err) {
      console.error('Create item error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/items/:id  — owner can update, with optional new image
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Allow owner or admin to update
    const isOwner = item.reportedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: 'Not authorized' });

    const allowed = ['title', 'description', 'category', 'location', 'heldAt', 'date', 'status'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    });

    // Update image if new one uploaded
    if (req.file) {
      item.imageUrl = `/uploads/${req.file.filename}`;
    }

    await item.save();
    const populated = await item.populate('reportedBy', 'name email');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/items/:id  — owner or admin can delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const isOwner = item.reportedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: 'Not authorized' });

    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/items/:id/claim
router.post('/:id/claim', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email');
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Can't claim your own item
    if (item.reportedBy._id.toString() === req.user.id)
      return res.status(400).json({ message: 'You cannot claim your own item' });

    if (item.status !== 'open')
      return res.status(400).json({ message: 'This item has already been claimed' });

    item.status = 'claimed';
    item.claimedBy = req.user.id;
    await item.save();

    // Create notification for the item reporter
    await Notification.create({
      recipient: item.reportedBy._id,
      sender: req.user.id,
      item: item._id,
      message: `Your ${item.type} item "${item.title}" has been claimed by a user. Please coordinate for pickup/return.`,
    });

    const populated = await item.populate('claimedBy', 'name email');
    res.json(populated);
  } catch (err) {
    console.error('Claim error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
