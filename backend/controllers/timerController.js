const db = require('../DB/db');

exports.start = (req, res) => {
	try {
		const userId = req.body.user_id;
		const currentDate = new Date();
		const startOfDayUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
		const startOfDayTimestamp = startOfDayUTC.getTime();

		const lastRecordSql = `SELECT * FROM user_times WHERE userId = ? AND startTime > ?`;

		db.all(lastRecordSql, [userId, startOfDayTimestamp], function(err, rows) {
			if (err) {
				console.error('Error running query:', err.message);
				return res.status(500).send('Error fetching data');
			}

			const recordsWithoutEndTime = rows.filter(record => record.endTime === null);
			const recordsWithEndTime = rows.filter(record => record.endTime !== null);
			let duration = 0;

			if (recordsWithEndTime.length) {
				for (const record of recordsWithEndTime) {
				duration += record.endTime - record.startTime;
				}
			}

			if (recordsWithoutEndTime.length) {
				return res.json({ timestamp: recordsWithoutEndTime[0].startTime, lastRecordsDuration: duration });
			}

			const currentTimestampUTC = Date.now();
			const sql = `INSERT INTO user_times (userId, startTime) VALUES (?, ?)`;

			db.run(sql, [userId, currentTimestampUTC], function(err) {
				if (err) {
				console.error('Error running query:', err.message);
				return res.status(500).send('Error inserting data');
				}

				res.json({ timestamp: currentTimestampUTC, lastRecordsDuration: duration });
			});
		});
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.stop = (req, res) => {
	try {
		const userId = req.body.user_id;
		const lastRecordSql = `SELECT * FROM user_times WHERE userId = ? AND endTime IS NULL`;

		db.all(lastRecordSql, [userId], function(err, rows) {
			if (err) {
				console.error('Error running query:', err.message);
				return res.status(500).send('Error fetching data');
			}

			if (!rows.length) {
				return res.status(404).send('No active timer found for the user');
			}

			const currentTimestampUTC = Date.now();
			const sql = `UPDATE user_times SET endTime = ? WHERE id = ?`;

			db.run(sql, [currentTimestampUTC, rows[0].id], function(err) {
				if (err) {
				console.error('Error running query:', err.message);
				return res.status(500).send('Error updating data');
				}

				res.json({ timestamp: currentTimestampUTC });
			});
		});
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
