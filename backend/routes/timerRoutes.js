const express = require('express');
const timerController = require('./../controllers/timerController');

const router = express.Router();

router
  	.route('/start')
  	.post(timerController.start);

router
	.route('/stop')
	.post(timerController.stop);

router
	.route('/get/:user_id')
	.get(timerController.getData);

module.exports = router;