import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
	const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
	const [counting, setCounting] = useState(false);

	useEffect(() => {
    	const timer = setInterval(() => {
			updateTimer();
		}, 1000);

		return () => clearInterval(timer);
	}, [counting]);

	const updateTimer = () => {
		setTime(prevTime => {
			let { hours, minutes, seconds } = prevTime;

			if (!counting)
				return { hours, minutes, seconds };

			seconds += 1;
			if (seconds === 60) {
				seconds = 0;
				minutes += 1;
			}
			if (minutes === 60) {
				minutes = 0;
				hours += 1;
			}

			return { hours, minutes, seconds };
		});
	}

	const formatTime = (value) => {
		return String(value).padStart(2, '0')
	};

	const handleButtonClick = () => {
    	setCounting(prevCounting => !prevCounting);
  	};

	return (
		<div className="App">
			<div className="counter">
				<span>{formatTime(time.hours)}:{formatTime(time.minutes)}:{formatTime(time.seconds)}</span>
			</div>
			<button onClick={handleButtonClick}>{counting ? "stop": "start"}</button>
			<table>
				<thead>
					<tr>
						<th>Day</th>
						<th>hours</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>15-10-2024</td>
						<td>07:30:00</td>
					</tr>
					<tr>
						<td>15-10-2024</td>
						<td>07:30:00</td>
					</tr>
					<tr>
						<td>15-10-2024</td>
						<td>07:30:00</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}

export default App;
