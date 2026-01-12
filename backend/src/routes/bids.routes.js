const express = require('express');
const { submitBid, getBids, hireBid } = require('../controllers/bids.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/', authMiddleware, submitBid);
router.get('/:gigId', authMiddleware, getBids);
router.patch('/:bidId/hire', authMiddleware, hireBid);

module.exports = router;