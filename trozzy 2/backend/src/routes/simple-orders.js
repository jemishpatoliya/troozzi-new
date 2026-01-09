const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

function toOrderRow(doc) {
  const itemsArr = Array.isArray(doc.items) ? doc.items : [];
  const itemsCount = itemsArr.reduce((sum, i) => sum + Number(i?.quantity ?? 0), 0);
  return {
    id: String(doc._id),
    orderNumber: doc.orderNumber || '',
    customer: doc?.customer?.name || '',
    email: doc?.customer?.email || '',
    total: Number(doc.total ?? 0),
    items: itemsCount,
    date: doc.createdAtIso || (doc.createdAt ? new Date(doc.createdAt).toISOString() : ''),
    paymentMethod: 'unknown',
    status: doc.status || 'new',
  };
}

// GET /api/orders (used by admin UI)
router.get('/', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(503).json({ success: false, message: 'Database not ready' });
    }

    const status = String(req.query?.status ?? '').trim();
    const search = String(req.query?.search ?? '').trim();
    const page = Math.max(1, Number(req.query?.page ?? 1) || 1);
    const limit = Math.min(200, Math.max(1, Number(req.query?.limit ?? 50) || 50));

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
      ];
    }

    const docs = await db
      .collection('orders')
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    res.json({
      success: true,
      data: docs.map(toOrderRow),
    });
  } catch (error) {
    console.error('Error loading orders:', error);
    res.status(500).json({ success: false, message: 'Failed to load orders' });
  }
});

// PUT /api/orders/:id/status (used by admin UI)
router.put('/:id/status', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(503).json({ success: false, message: 'Database not ready' });
    }

    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order id' });
    }

    const status = String(req.body?.status ?? '').trim();
    if (!status) {
      return res.status(400).json({ success: false, message: 'Missing status' });
    }

    const _id = new mongoose.Types.ObjectId(id);
    const result = await db
      .collection('orders')
      .findOneAndUpdate(
        { _id },
        { $set: { status } },
        { returnDocument: 'after' },
      );

    if (!result?.value) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      data: { id: String(result.value._id), status: result.value.status },
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// GET /api/orders/:id (used by admin UI)
router.get('/:id', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(503).json({ success: false, message: 'Database not ready' });
    }

    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order id' });
    }

    const doc = await db.collection('orders').findOne({ _id: new mongoose.Types.ObjectId(id) });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      data: doc,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

module.exports = router;
