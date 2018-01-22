const express = require('express');
const terms = require('../common_terms.js');
let router = express.Router();


const RENDER_TARGET = 'index';
const PAGE_TITLE = 'HarperDB IoT Example';

/* GET home page. */
router.get(terms.ROOT_PATH, function(req, res, next) {
  res.render(RENDER_TARGET, { title: PAGE_TITLE });
});

module.exports = router;
