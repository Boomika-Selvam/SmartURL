const express = require('express');
const {
  suggestAliases,
  createShortUrl,
  getMyUrls,
  deleteUrl
} = require('../controllers/urlController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/suggest', suggestAliases);
router.post('/', createShortUrl);
router.get('/', getMyUrls);
router.delete('/:id', deleteUrl);

module.exports = router;

