const express = require('express');
const { getGigs, createGig } = require('../controllers/gigs.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/', getGigs);
router.post('/', authMiddleware, createGig);

module.exports = router;