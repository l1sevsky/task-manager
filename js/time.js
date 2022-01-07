function getCurrentTime() {
	let time = "";
	let hours = (new Date()).getHours();
	let minutes = (new Date()).getMinutes();

	time += (hours < 10) ? ("0" + hours + ":") : (hours + ":");
	time += (minutes < 10) ? ("0" + minutes) : minutes;

	return time;
}

function getCurrentWeekDay() {
	let dayList = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
	let currentDate = new Date();

	return dayList[currentDate.getDay()]
}

function getCurrentDate() {
	let monthsList = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа",
					  "сентября", "октября", "ноября", "декабря"];
	let date = "";
	let currentDate = new Date();

	date += currentDate.getDate();
	date += (" " + monthsList[currentDate.getMonth()] + " ");
	date += currentDate.getFullYear();

	return date;
}

function putCurrentDateTimeParams() {
	document.getElementById("current-time").innerText = getCurrentTime();
	document.getElementById("current-weekday").innerText = getCurrentWeekDay();
	document.getElementById("current-date").innerText = getCurrentDate();
}


var time = {
	updateFlatpickr: function() {
		let field = document.getElementById('edit-task__date');
		let hasDate = field.value.indexOf('.');
		let hasTime = field.value.indexOf(':');

		flatpickr('#edit-task__date', {
			"locale": "ru",
			"enableTime": true,
			"dateFormat": "d.m.Y H:i",
			"time_24hr": true,
			"disableMobile": true,
			"minDate": new Date(),
			onChange: design.showButtonRemoveTime
		});

		if (hasTime == -1 && hasDate != -1)
			field.value = field.value.slice(0, 10);
	},
	
	getDateForDB: function(shift) {
		let currentDate = new Date();
		currentDate.setDate(currentDate.getDate() + shift);
		let day = currentDate.getDate();
		let month = currentDate.getMonth() + 1;
		let year = currentDate.getFullYear();
		let result = '';

		result += year;
		result += (month < 10) ? ('0' + month) : month;
		result += (day < 10) ? ('0' + day) : day; 

		return result;
	}
}

putCurrentDateTimeParams();
setInterval(putCurrentDateTimeParams, 1000 * 60);