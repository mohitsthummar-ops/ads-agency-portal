const express = require('express');
const router = express.Router();
const { getTemplates, createTemplate } = require('../controllers/templateController');

router.get('/', getTemplates);
router.post('/', createTemplate); // Optional admin-only protected in later updates

module.exports = router;
