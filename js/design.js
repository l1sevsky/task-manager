var design = {
	changeTheme: function() {
		let elements = document.getElementsByClassName('theme');

		for (let i = 0; i < elements.length; i++) {
			elements[i].classList.toggle('light-theme');
			elements[i].classList.toggle('dark-theme');
		}
	},


	openMenu: function() {
		document.getElementById('datetime').classList.toggle('shift-right-250');
		document.getElementById('content').classList.toggle('shift-right-100');
		document.getElementById('sidebar').classList.toggle('display-none');

		document.getElementById('nav-btn__open-menu').classList.toggle('btn__close-menu');
	},


	showButtonRemoveTime: function() {
		let button = document.getElementById('btn__remove-time');

		if (button.classList.contains('display-none'))
			button.classList.remove('display-none');
	},


	actionButtonRemoveTime: function() {
		let button = document.getElementById('btn__remove-time');
		let input = document.getElementById('edit-task__date');
		let value = input.value;

		if (value !== '' && value.length > 10) {
			input.value = value.slice(0, 10);
			button.classList.toggle('display-none');
		}
	},


	showElement: function(categoryId) {
		let elem = document.getElementById(categoryId);

		if (elem == null) return
		else elem.classList.remove('display-none');
	},

	hideElement: function(categoryId) {
		let elem = document.getElementById(categoryId);

		if (elem == null) return
		else elem.classList.add('display-none');
	},

	switchElement: function(hideId, showId) {
		this.hideElement(hideId);
		this.showElement(showId);
	}
}


// NAV buttons onclicks

let navBtn;

navBtn = document.getElementById('nav-btn__open-menu');
navBtn.onclick = design.openMenu;

navBtn = document.getElementById('nav-btn__change-theme');
navBtn.onclick = design.changeTheme;