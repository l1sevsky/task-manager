var html = {

	labelInputConnect: 0,

	iconNames: ['books', 'build', 'car', 'culture', 'food', 'gift', 
				'health', 'home', 'map', 'movie', 'music', 'notification',
				'people', 'pet', 'sport', 'ticket'],

	clear: function(string) {
		let new_string = '';

		for (let i = 0; i < string.length; i++)
			if (string[i] != '\n' && string[i] != '\t')
				new_string += string[i];

		return new_string;
	},

	// WARNING: inputHandler and taskHandler must have string type
	// for example - "handler(arg)"
	getTask: function(taskId, title, project, date, time, period, description, inputHandler, taskHandler) {
		let detailDescription = detailProject = detailDate = detailTime = detailPeriod = '';

		if (description) 
			detailDescription = `<p class="task-description">${description}</p>`;
		if (project)
			detailProject = `<li class="task-project">${project}</li>`;
		if (date)
			detailDate = `<li class="task-date">${date}</li>`;
		if (time)
			detailTime = `<li class="task-time">${time}</li>`;
		if (period)
			detailPeriod = `<li class="task-period">${period}</li>`;

		return this.clear(`<li class="task-card task-card__task-id-${taskId}">
					<div class="task-input">
						<input id="label-input__${html.labelInputConnect}" type="checkbox">
						<label for="label-input__${html.labelInputConnect++}" onclick="${inputHandler}"></label>
					</div>
					<div class="task-content" onclick="${taskHandler}">
						<h3 class="task-title">${title}</h3>
						${detailDescription}
						<ul class="task-details">
							${detailProject}
							${detailDate}
							${detailTime}
							${detailPeriod}
						</ul>
					</div>
				</li>`);
	},


	// WARNING: linkHandler must have string type
	// for example - "handler(arg)"
	getProjectLink: function(title, icon, linkHandler) {
		return this.clear(`<li class="${icon}" onclick="${linkHandler}">${title}</li>`);
	},


	// WARNING: addHandler and editHandler must have string type
	// for example - "handler(arg)"
	getContentHeader: function(title, icon, description, addHandler, editHandler) {
		let btnEdit = contentDescription = '';

		if (editHandler)
			btnEdit = `<button class="btn btn__edit-project" onclick="${editHandler}"></button>`;
		if (description)
			contentDescription = `<p class="content-description">${description}</p>`;

		return this.clear(`<div class="content-header">
					<h2 class="content-title eternal-light-${icon}">${title}</h2>
					<div class="content-buttons">
						${btnEdit}
						<button class="btn btn__add-task" onclick="${addHandler}"></button>
					</div>
				</div>
				${contentDescription}`);
	},


	// WARNING: addHandler must have string type
	// for example - "handler(arg)"
	getContentMain: function(isEmpty, addHandler) {

		return this.clear(`<div class="content-main">
					<ul class="task-list ${(isEmpty) ? 'empty' : ''}">
					</ul>
					<button class="btn btn__add-task" onclick="${addHandler}">Добавить задачу</button>
				</div>`);
	},

	// WARNING 1: inputs is object - {title, projectId, datetime, period, description}
	// WARNING 2: projects is object - {id: [id1, id2 ...], title: [t1, t2 ...]}
	// WARNING 3: handlers is object - {done: [title, handler], cancel: [...], remove: [...]}
	// handlers must have string type, for example - "handler(arg)"
	// IF atribute unviable you can set value = false
	getWindowEditTask: function(title, inputs, projects, handlers) {
		let options = `<option class="window-input" ${(inputs.projectId == 0) ? ('selected ') : (' ')}
			value="0">Входящие</option>`;

		for (let i = 0; i < projects.id.length; i++) {
			options += `<option class="window-input" ${(inputs.projectId == projects.id[i]) ? ('selected ') : (' ')}
				value="${projects.id[i]}">${projects.title[i]}</option>`;
		}

		let btnDone = btnCancel = btnRemove = '';

		if (handlers.done)
			btnDone = `<button class="win-btn win-btn__done"
						onclick="${handlers.done[1]}">${handlers.done[0]}</button>`;
		if (handlers.cancel)
			btnCancel = `<button class="win-btn win-btn__cancel"
						onclick="${handlers.cancel[1]}">${handlers.cancel[0]}</button>`;
		if (handlers.remove)
			btnRemove = `<button class="win-btn win-btn__remove"
						onclick="${handlers.remove[1]}">${handlers.remove[0]}</button>`;

		return this.clear(`<div class="window-content">
					<h2 class="window-title">${title}</h2>
					<input class="window-input input__title" type="text" 
						id="edit-task__title" value="${inputs.title}">
					<div class="window-details" id="edit-task__details">
						<div class="wrapper">
							<div class="detail">
								<h3>Проект</h3>
								<select class="window-input" id='edit-task__project'>
									${options}
								</select>
							</div>
							<div class="detail detail__date">
								<h3>Дата</h3>
								<input class="flatpickr window-input" type="text" 
									id="edit-task__date" value="${inputs.datetime}">
								<button class="btn btn__remove-time display-none" id="btn__remove-time" 
									onclick="design.actionButtonRemoveTime()">Убрать время</button>
							</div>
							<div class="detail">
								<h3>Период</h3>
								<input class="window-input" type="text" id="edit-task__period"
									value="${inputs.period}">
							</div>
						</div>
						<div class="detail detail__description">
							<h3>Комментарий</h3>
							<textarea class="window-input window-textarea" 
								id="edit-task__description">${inputs.description}</textarea>
						</div>
					</div>

				</div>
				<div class="window-buttons">
					${btnDone}
					${btnCancel}
					${btnRemove}
				</div>`);
	},

	// WARNING 1: inputs is object - [title, icon, description]
	// WARNING 3: handlers is object - [done: [title, handler], cancel: [...], remove: [...]]
	// handlers must have string type, for example - "handler(arg)"
	// IF atribute unviable you can set value = false
	getWindowEditProject: function(title, inputs, handlers) {
		let btnDone = btnCancel = btnRemove = '';

		if (handlers.done)
			btnDone = `<button class="win-btn win-btn__done"
						onclick="${handlers.done[1]}">${handlers.done[0]}</button>`;
		if (handlers.cancel)
			btnCancel = `<button class="win-btn win-btn__cancel"
						onclick="${handlers.cancel[1]}">${handlers.cancel[0]}</button>`;
		if (handlers.remove)
			btnRemove = `<button class="win-btn win-btn__remove"
						onclick="${handlers.remove[1]}">${handlers.remove[0]}</button>`;

		return this.clear(`<div class="window-content">
					<h2 class="window-title">${title}</h2>
					<input class="window-input input__title" type="text" 
						id="edit-project__title" value="${inputs.title}">
					<div class="window-details" id="edit-project__details">
						<div class="detail">
							<h3>Иконка</h3>
							<div class="icons-wrapper">
								${this.getRadioInputs(inputs.icon)}
							</div>
						</div>
						<div class="detail detail__description">
							<h3>Комментарий</h3>
							<textarea class="window-input window-textarea" 
								id="edit-project__description">${inputs.description}</textarea>
						</div>
					</div>

				</div>
				<div class="window-buttons">
					${btnDone}
					${btnCancel}
					${btnRemove}
				</div>`);
	},

	// selectedName is icon name, for example 'ico-build'
	getRadioInputs: function(selectedName) {
		let selected = selectedName.slice(4);
		let inputs = '';

		for (let i = 0; i < this.iconNames.length; i++)
			inputs += this.clear(`<input type="radio" 
					${(selected == this.iconNames[i]) ? (' checked ') : (' ')} 
					name="project-ico" 
				   	id="project-ico__${this.iconNames[i]}" 
				   	value="ico-${this.iconNames[i]}">
					<label for="project-ico__${this.iconNames[i]}" 
				   	class="edit-project__radio ico-${this.iconNames[i]}"></label>`);

		return inputs;
	}
}