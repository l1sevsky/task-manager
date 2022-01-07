var currentCategoryId = 'category__today';

// Wait database loaded and create html with 
let load = setInterval(() => {
	if (db.loaded) {
		// create project list
		db.getAllProjects(projects => {
			actions.createProjectsList(projects);
			actions.createTaskListsForProjects(projects);
			actions.createTaskListsForCategory();

			actions.openCategory(currentCategoryId);
		});

		// close window with loading indicator
		document.getElementById('window-load').remove();
		clearInterval(load);
	}
}, 200);

// objects with task handlers
var actions = {

	createProjectsList: function(projects) {
		let list = document.getElementById('projects-list');

		for (let p in projects) {
			let projectLink = html.getProjectLink(projects[p].title, projects[p].icon, 
				`actions.openCategory('category__${projects[p].id}')`);

			list.insertAdjacentHTML('beforeend', projectLink);
		}
	},

	createTaskListsForProjects: function(projects) {
		let content = document.getElementById('content');

		for (let p in projects) {
			actions.getTaskListContent(projects[p].id, projects[p].title, projects[p].icon, 
				projects[p].description, `actions.addTask(${projects[p].id})`, `actions.editProject(${projects[p].id})`);
			
			// insert tasks on project-list
			actions.insertTasksOnList('projectId', '=', [projects[p].id], `${projects[p].id}`);	
		}
	},

	createTaskListsForCategory: function() {
		// LIST 1 - Overdue
		actions.getTaskListContent('overdue', 'Просрочено', 'ico-overdue', false, 
			'actions.addTask(0)', false);

		document.getElementById('open-category__overdue').onclick = () => {
			actions.openCategory('category__overdue');
		}

		let today = time.getDateForDB(0);
		actions.insertTasksOnList('date', '<<', ['0', today], 'overdue');

		// LIST 2 - Inbox
		actions.getTaskListContent('inbox', 'Входящие', 'ico-inbox', false, 
			'actions.addTask(0)', false);

		document.getElementById('open-category__inbox').onclick = () => {
			actions.openCategory('category__inbox');
		}
		
		actions.insertTasksOnList('projectId', '=', [0], 'inbox');

		// LIST 3 - Today
		actions.getTaskListContent('today', 'Сегодня', 'ico-today', false, 
			'actions.addTask(0)', false);

		document.getElementById('open-category__today').onclick = () => {
			actions.openCategory('category__today');
		}

		actions.insertTasksOnList('date', '=', [today], 'today');

		// LIST 4 - Week
		actions.getTaskListContent('week', 'Неделя', 'ico-week', false, 
			'actions.addTask(0)', false);

		document.getElementById('open-category__week').onclick = () => {
			actions.openCategory('category__week');
		}
		
		let afterWeek = time.getDateForDB(7);
		actions.insertTasksOnList('date', '<=<', [today, afterWeek], 'week');
	},

	insertTasksOnList: function(field, condition, range, categoryId) {
		// handler by received tasks
		let insertTasks = tasks => {
			let list = document.getElementById('category__' + categoryId);
			list = list.getElementsByClassName('task-list')[0];

			if (tasks.length == 0) {
				list.classList.add('empty');
				return;
			}

			let handler = (project, task) => {
				// convert params
				let date = convert.dateToUser(task.date);
				let period = convert.periodToUser(task.period);

				let content = html.getTask(task.id, task.title, project.title, date, task.time, 
					period, task.description, `actions.completeTask(${task.id})`, `actions.editTask(${task.id})`);

				list.insertAdjacentHTML('beforeend', content);
			}

			for (let t in tasks) {
				if (tasks[t].projectId == 0) handler({title: 'Входящие'}, tasks[t]);
				else db.getProjectById(tasks[t].projectId, project => { handler(project, tasks[t]) })
			}
		}

		// select tasks from base
		db.getSelectTasks(field, condition, range, insertTasks);
	},

	addTask: function(projectId) {
		db.getAllProjects(proj => {
			let title = 'Что вы хотите запланировать?';
			let inputs = { title: '', projectId: projectId, datetime: '', period: '', description: '' };

			let projects = { id: [], title: [] };
			for (p of proj) {
				projects.id.push(p.id);
				projects.title.push(p.title);
			}

			let handlers = {
				done: ['Добавить', 'actions.saveNewTask()'],
				cancel: ['Отмена', 'actions.removeWindow()'],
				remove: false
			};

			let content = html.getWindowEditTask(title, inputs, projects, handlers);
			actions.insertWindowOnPage(content);
			time.updateFlatpickr();
		});
	},

	editTask: function(taskId) {
		db.getTaskById(taskId, task => {
			db.getAllProjects(proj => {
				let title = 'Редактирование задачи';

				let inputs = {
					title: task.title,
					projectId: task.projectId,
					datetime: convert.datetimeToUser(task.date, task.time),
					period: convert.periodToUser(task.period),
					description: task.description
				};

				let projects = { id: [], title: [] };
				for (p of proj) {
					projects.id.push(p.id);
					projects.title.push(p.title);
				}

				let handlers = {
					done: ['Сохранить', `actions.saveChangedTask(${task.id})`],
					cancel: ['Отмена', 'actions.removeWindow()'],
					remove: ['Удалить', `actions.deleteTask(${task.id})`]
				};

				let content = html.getWindowEditTask(title, inputs, projects, handlers);
				actions.insertWindowOnPage(content);
				time.updateFlatpickr();
			});
		});
	},

	saveNewTask: function() {
		let title = document.getElementById('edit-task__title').value;
		let projectId = +document.getElementById('edit-task__project').value;
		let datetime = document.getElementById('edit-task__date').value;
		let period = document.getElementById('edit-task__period').value;
		let description = document.getElementById('edit-task__description').value;

		let date, time;
		datetime = convert.datetimeToDB(datetime);
		date = datetime[0];
		time = datetime[1];

		period = (date != '') ? (convert.periodToDB(period)) : (0);
		if (title == '') title = 'Без названия';

		let weekday = convert.weekdayToDB(date);

		db.addTask(title, projectId, date, time, weekday, period, description);

		actions.rebuildCategorys(projectId);
		actions.removeWindow();
	},

	saveChangedTask: function(taskId) {
		let oldTasks = document.getElementsByClassName(`task-card__task-id-${taskId}`);
		for (let task of oldTasks) task.remove();

		db.deleteTask(taskId);
		actions.saveNewTask();
	},

	completeTask: function(taskId) {
		db.getTaskById(taskId, task => {

			db.deleteTask(taskId);

			if (task.period != 0) {

				let date = convert.newDateToDBForPeriod(task.date, task.period);
				let weekday = convert.weekdayToDB(date);

				db.addTask(task.title, task.projectId, date, task.time, 
					weekday, task.period, task.description);

				actions.rebuildCategorys(task.projectId);
			} 
			
			actions.rebuildCategorys(task.projectId);
		});
	},

	deleteTask: function(taskId) {
		db.getTaskById(taskId, task => {
			db.deleteTask(task.id);

			actions.rebuildCategorys(task.projectId);
			actions.removeWindow();
		});
	},

	addProject: function() {
		let title = 'Создайте новый проект!';
		let inputs = { title: '', icon: '', description: '' };

		let handlers = {
			done: ['Добавить', 'actions.saveNewProject()'],
			cancel: ['Отмена', 'actions.removeWindow()'],
			remove: false
		}

		let content = html.getWindowEditProject(title, inputs, handlers);
			actions.insertWindowOnPage(content);
	},

	editProject: function(projectId) {
		db.getProjectById(projectId, project => {
			let title = 'Редактирование проекта';

			let inputs = {
				title: project.title,
				icon: project.icon,
				description: project.description
			}

			let handlers = {
				done: ['Сохранить', `actions.saveChangedProject(${project.id})`],
				cancel: ['Отмена', 'actions.removeWindow()'],
				remove: ['Удалить', `actions.deleteProject(${project.id})`]
			}

			let content = html.getWindowEditProject(title, inputs, handlers);
			actions.insertWindowOnPage(content);
		});
	},

	saveNewProject: function() {
		db.getAllProjects(projects => {
			for (let p in projects)
				actions.removeContentWrappers([projects[p].id]);
		});

		let title = document.getElementById('edit-project__title').value;
		let description = document.getElementById('edit-project__description').value;
		let radio = document.querySelector('input[name="project-ico"]:checked');
		let icon = 'ico-ticket';

		if (radio != undefined) icon = radio.value;
		if (title == '') title = 'Без названия';

		db.addProject(title, description, icon);

		// rebuild project links
		document.getElementById('projects-list').innerHTML = '';
		db.getAllProjects(projects => {
			actions.createProjectsList(projects);
			actions.createTaskListsForProjects(projects);
			actions.openCategory(currentCategoryId);
		});

		actions.removeWindow();
	},

	saveChangedProject: function(projectId) {
		let title = document.getElementById('edit-project__title').value;
		let description = document.getElementById('edit-project__description').value;
		let radio = document.querySelector('input[name="project-ico"]:checked');
		let icon = 'ico-ticket';

		if (radio != undefined) icon = radio.value;
		if (title == '') title = 'Без названия';

		db.updateProject(projectId, title, description, icon);

		db.getAllProjects(projects => {
			document.getElementById('projects-list').innerHTML = '';
			actions.createProjectsList(projects);
			actions.removeContentWrappers([projectId]);

			db.getProjectById(projectId, project => {
				actions.createTaskListsForProjects({'0': project});
				actions.openCategory(currentCategoryId);
			});
		});

		actions.removeWindow();
	},

	deleteProject: function(projectId) {
		db.deleteProject(projectId);

		db.getSelectTasks('projectId', '=', [projectId], tasks => {
			for (let i = 0; i < tasks.length; i++) {
				let t = tasks[i];
				t.projectId = 0;
				db.updateTask(t.id, t.title, t.projectId, t.date, t.time, 
							  t.weekday, t.period, t.description);
			}
		});

		db.getAllProjects(projects => {
			document.getElementById('projects-list').innerHTML = '';
			actions.createProjectsList(projects);
			actions.removeContentWrappers([projectId]);
			actions.rebuildCategorys(0);
		});

		actions.openCategory('category__today');
		actions.removeWindow();
	},

	openCategory: function(categoryId) {
		design.switchElement(currentCategoryId, categoryId);
		currentCategoryId = categoryId;
	},

	insertWindowOnPage: function(content) {
		let win = document.getElementById('window');
		win.insertAdjacentHTML('beforeend', content);

		document.getElementById('window-wrapper').classList.remove('display-none');
	},

	removeWindow: function() {
		let wrap = document.getElementById('window-wrapper');
		wrap.classList.add('display-none');

		document.getElementById('window').innerHTML = '';
	},

	removeContentWrappers: function(wrappers) {
		for (let wrap of wrappers)
			document.getElementById(`category__${wrap}`).remove();
	},

	rebuildCategorys: function(currentProjectId) {
		// rebuild category lists
		actions.removeContentWrappers(['overdue', 'inbox', 'today', 'week']);
		actions.createTaskListsForCategory();

		// rebuild project when was added task
		if (currentProjectId != 0) {
			actions.removeContentWrappers([currentProjectId]);
			db.getProjectById(currentProjectId, project => {
				actions.createTaskListsForProjects([project]);
				actions.openCategory(currentCategoryId);
			})
		} else {
			actions.openCategory(currentCategoryId);		
		}
	},

	getTaskListContent: function(categoryName, title, icon, description, addHandler, editHandler) {
		let content = document.getElementById('content');
		let wrapper = document.createElement('div');
		wrapper.classList.add('display-none');
		wrapper.id = `category__${categoryName}`;

		let contentHeader = html.getContentHeader(title, icon, description, 
			addHandler, editHandler);

		let pr = (isNaN(+categoryName) ? '0' : '' + categoryName);
		let contentMain = html.getContentMain(false, `actions.addTask(${pr})`);

		wrapper.insertAdjacentHTML('beforeend', contentHeader);
		wrapper.insertAdjacentHTML('beforeend', contentMain);

		content.appendChild(wrapper);
	}
}


// buttons onclicks
let btn = document.getElementById('sidebar-btn__add-project');
btn.onclick = actions.addProject;