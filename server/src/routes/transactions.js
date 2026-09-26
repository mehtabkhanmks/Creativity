const express = require('express');
const router = express.Router();
const { createTransaction, getMyTransactions, getTransaction, completeTransaction } = require('../controllers/transactionsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createTransaction);
router.get('/', getMyTransactions);
router.get('/:id', getTransaction);
router.put('/:id/complete', completeTransaction);

module.exports = router;
