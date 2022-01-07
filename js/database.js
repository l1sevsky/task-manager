let database, openRequest;

var db = {

	loaded: false,
	
	init: async function() {
		openRequest = await window.indexedDB.open("TaskManager", 1);

		openRequest.onupgradeneeded = async function() {
			database = await openRequest.result;

			// create tables
			let tableTasks, tableProjects;

			if(database.objectStoreNames.contains("Tasks") == false) {
				tableTasks = database.createObjectStore("Tasks", {keyPath: "id", autoIncrement: true});

				// create indexes
				tableTasks.createIndex('task_title', 'title', { unique: false });
				tableTasks.createIndex('task_date', 'date', { unique: false });
				tableTasks.createIndex('task_time', 'time', { unique: false });
				tableTasks.createIndex('task_weekday', 'weekday', { unique: false });
				tableTasks.createIndex('task_period', 'period', { unique: false });
				tableTasks.createIndex('task_projectId', 'projectId', { unique: false });
			}

			if(database.objectStoreNames.contains("Projects") == false)
				tableProjects = database.createObjectStore("Projects", {keyPath: "id", autoIncrement: true});
		};

		openRequest.onerror = function(event) {
			console.log("ERROR - ", event);
		};

		openRequest.onsuccess = async function() {
			// Получаем объект базы
			database = await openRequest.result;

			window.onload = function() {
				db.loaded = true;
			}
		};
	},

	addTask: function(title, projectId, date, time, weekday, period, description) {
		let task = {
			title: title,
			projectId: projectId,
			date: date,
			time: time,
			weekday: weekday,
			period: period,
			description: description
		}

		let tx = database.transaction("Tasks", "readwrite");
		let table = tx.objectStore("Tasks");
		table.add(task);

		return true;
	},


	getTaskById: function(taskId, handler) {
		let tx = database.transaction("Tasks", "readonly");
		let table = tx.objectStore("Tasks");

		let request = table.get(taskId);

		request.onsuccess = event => {
			handler(event.target.result);
		}

		return true;
	},

	// private
	__getSelectTasks: function(indexName, key, handler) {
		let tx = database.transaction("Tasks", "readonly");
		let table = tx.objectStore("Tasks");
		let index = table.index(indexName);

		let request = index.getAll(key);

		request.onsuccess = event => {
			handler(event.target.result);
		}
	},


	getSelectTasks: function(field, condition, range, handler) {
		let indexName, key;

		switch(field) {
			case 'title':
				indexName = 'task_title';
				break;
			case 'date':
				indexName = 'task_date';
				break;
			case 'time':
				indexName = 'task_time';
				break;
			case 'weekday':
				indexName = 'task_weekday';
				break;
			case 'period':
				indexName = 'task_period';
				break;
			case 'projectId':
				indexName = 'task_projectId';
				break;
		}

		switch (condition) {
			case '=':
				key = range[0];
				break;
			case '<':
				key = IDBKeyRange.upperBound(range[0], true);
				break;
			case '<=':
				key = IDBKeyRange.upperBound(range[0], false);
				break;
			case '>':
				key = IDBKeyRange.lowerBound(range[0], true);
				break;
			case '>=':
				key = IDBKeyRange.lowerBound(range[0], false);
				break;
			case '<<':
				key = IDBKeyRange.bound(range[0], range[1], true, true);
				break;
			case '<=<':
				key = IDBKeyRange.bound(range[0], range[1], false, true);
				break;
			case '<<=':
				key = IDBKeyRange.bound(range[0], range[1], true, false);
				break;
			case '<=<=':
				key = IDBKeyRange.bound(range[0], range[1], false, false);
				break;
		}

		if (key === undefined || indexName == undefined) {
			return false;
		} else {
			db.__getSelectTasks(indexName, key, handler);
			return true;
		}
	},

	updateTask: function(id, title, projectId, date, time, weekday, period, description) {
		let task = {
			id: id,
			title: title,
			projectId: projectId,
			date: date,
			time: time,
			weekday: weekday,
			period: period,
			description: description
		}

		let tx = database.transaction("Tasks", "readwrite");
		let table = tx.objectStore("Tasks");
		table.put(task);

		return true;
	},


	deleteTask: function(taskId) {
		let tx = database.transaction("Tasks", "readwrite");
		let table = tx.objectStore("Tasks");
		table.delete(taskId);
	},


	addProject: function(title, description, icon) {
		let project = {
			title: title,
			description: description,
			icon: icon
		}

		let tx = database.transaction("Projects", "readwrite");
		let table = tx.objectStore("Projects");
		table.add(project);

		return true;
	},


	getProjectById: function(projectId, handler) {
		let tx = database.transaction("Projects", "readonly");
		let table = tx.objectStore("Projects");

		let request = table.get(projectId);

		request.onsuccess = event => {
			handler(event.target.result);
		}

		return true;
	},


	getAllProjects: function(handler) {
		let tx = database.transaction("Projects", "readonly");
		let table = tx.objectStore("Projects"); 

		let request = table.getAll();

		request.onsuccess = event => {
			handler(event.target.result);
		}

		return true;
	},

	updateProject: function(id, title, description, icon) {
		let project = {
			id: id,
			title: title,
			description: description,
			icon: icon
		}

		let tx = database.transaction("Projects", "readwrite");
		let table = tx.objectStore("Projects");
		table.put(project);

		return true;
	},

	deleteProject: function(projectId) {
		let tx = database.transaction("Projects", "readwrite");
		let table = tx.objectStore("Projects");
		table.delete(projectId);
	}
}

// Init database on start app
db.init();