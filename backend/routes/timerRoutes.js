const express = require('express');
const timerController = require('./../controllers/timerController');

const router = express.Router();

router
  	.route('/start')
  	.post(timerController.start);

router
	.route('/stop')
	.post(timerController.stop);

module.exports = router;