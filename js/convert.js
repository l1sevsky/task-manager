var convert = {
	// get 'dd.mm.yyyy'
	// ret 'yyyymmdd'
	dateToDB: function (date) {
		if (date)
			return date.slice(6) + date.slice(3, 5) + date.slice(0, 2);
		else
			return '';
	},

	// get 'yyyymmdd'
	// ret 'dd.mm.yyyy'
	dateToUser: function (date) {
		if (date)
			return date.slice(6) + '.' + date.slice(4, 6) + '.' + date.slice(0, 4);
		else
			return '';
	},

	// get 'dd.mm.yyyy hh:mm' or 'dd.mm.yyyy'
	// ret ['yyyymmdd', 'hh:mm'] or ['yyyymmdd', false]
	datetimeToDB: function(datetime) {
		if (!datetime)
			return ['', ''];

		let date = this.dateToDB(datetime.slice(0, 10));
		let time;

		if (datetime.length < 16)
			time = '';
		else
			time = datetime.slice(11);

		return [date, time];
	},

	// get date - 'yyyymmdd', time - 'hh:mm'
	datetimeToUser: function(date, time) {
		if (!date)
			return '';
		else if (!time)
			return this.dateToUser(date);
		else
			return this.dateToUser(date) + ' ' + time;
	},

	periodToDB: function(period) {
		switch (period) {
			case '':
				return 0;
			case 'день':
			case 'каждый день':
			case 'раз в день':
				return 1;
			case 'неделя':
			case 'каждую неделю':
			case 'раз в неделю':
				return 7;
			case 'месяц':
			case 'каждый месяц':
			case 'раз в месяц':
				return 'month';
			case 'год':
			case 'каждый год':
			case 'раз в год':
				return 'year';
			default:
				period = parseInt(period.match(/\d+/));
				if (isNaN(period))
					return 0;
				else
					return period;
		}
	},

	periodToUser: function(period) {
		switch (period) {
			case 0:
				return '';
			case 'year':
				return 'раз в год';
			case 'month':
				return 'раз в месяц';
			case 7:
				return 'раз в неделю';
			case 1:
				return 'каждый день';
			default:
				if (period > 4 && period < 21)
					return `раз в ${period} дней`;
				else if (period % 10 == 1)
					return `раз в ${period} день`;
				else if (period % 10 > 1 && period % 10 < 5)
					return `раз в ${period} дня`;
				else
					return `раз в ${period} дней`;
		}
	},

	// date - 'yyyymmdd'
	weekdayToDB: function(date) {
		if (!date)
			return '';

		let year = +date.slice(0, 4);
		let month = (+date.slice(4, 6)) - 1;
		let day = +date.slice(6);

		return new Date(year, month, day).getDay();
	},

	// date - 'yyyymmdd' 
	newDateToDBForPeriod: function(date, period) {
		let year = +date.slice(0, 4);
		let month = (+date.slice(4, 6)) - 1;
		let day = +date.slice(6);
		let prevDate = new Date(year, month, day);
		let nextDate;

		switch (period) {
			case 'year':
				nextDate = prevDate.setFullYear(year + 1);
				break;
			case 'month':
				nextDate = prevDate.setMonth(month + 1);
				break;
			default:
				nextDate = prevDate.setDate(day + +period);
		}

		nextDate = new Date(nextDate);

		year = '' + nextDate.getFullYear();
		month = (nextDate.getMonth() + 1);
		month = (month < 10) ? ('0' + month) : ('' + month);
		day = nextDate.getDate();
		day = (day < 10) ? ('0' + day) : ('' + day);

		return year + month + day;
	}
}