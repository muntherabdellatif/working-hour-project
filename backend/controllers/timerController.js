const db = require('../DB/db');
const {groupBy} = require('lodash');

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

			const {timestamp , lastRecordsDuration} = formatCurrntDayData(rows);

			if (timestamp) {
				return res.json({ timestamp, lastRecordsDuration });
			}

			const currentTimestampUTC = Date.now();
			const sql = `INSERT INTO user_times (userId, startTime) VALUES (?, ?)`;

			db.run(sql, [userId, currentTimestampUTC], function(err) {
				if (err) {
					console.error('Error running query:', err.message);
					return res.status(500).send('Error inserting data');
				}

				res.json({ timestamp: currentTimestampUTC, lastRecordsDuration: lastRecordsDuration });
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

exports.getData = async (req, res) => {
	try {
		const userId = +req.params.user_id;
		const currentDate = new Date();
		const startOfDayUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 0));
		const startOfMonthTimestamp = startOfDayUTC.getTime();

		
		db.all('SELECT * FROM user_times where userId = ? and startTime > ?', [userId, startOfMonthTimestamp], function(err, rows) {
			const returnData = {
				currentDayData: {
					timestamp: 0, lastRecordsDuration: 0
				},
				monthData: []
			}

			if (!rows.length) 
				res.json(returnData);

			const startDayOfDayUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
			const startOfDayTimestamp = startDayOfDayUTC.getTime();

			const currentDayData = rows.filter(data => data.startTime > startOfDayTimestamp);
			const monthData = rows.filter(data => data.startTime < startOfDayTimestamp);

			const {timestamp , lastRecordsDuration} = formatCurrntDayData(currentDayData);
			returnData.currentDayData.lastRecordsDuration = lastRecordsDuration;
			returnData.currentDayData.timestamp = timestamp;

			monthData.forEach((date) => date.day = getFormatedDate(date.startTime));
			const daysData = groupBy(monthData, 'day');
			const days = Object.keys(daysData);
			days.forEach((day) => returnData.monthData.push({day, duration: getDutationSum(daysData[day])}));

			res.json(returnData);
		})
    }catch (error) {
    	console.log(error);
    	res.status(500).send(error);
  }
};

formatCurrntDayData = (rows) => {
	const recordsWithoutEndTime = rows.filter(record => record.endTime === null);
	const recordsWithEndTime = rows.filter(record => record.endTime !== null);
	let duration = 0;

	if (recordsWithEndTime.length)
		duration = getDutationSum(recordsWithEndTime);

	if (recordsWithoutEndTime.length) 
		return { timestamp: recordsWithoutEndTime[0].startTime, lastRecordsDuration: duration };

	return { timestamp: 0, lastRecordsDuration: duration };
}

getFormatedDate = (timestamp) => {
	const date = new Date(timestamp);
	return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

getDutationSum = (dateList) => {
	let duration = 0;

	for (const record of dateList)
		duration += record.endTime - record.startTime;

	return duration;
}