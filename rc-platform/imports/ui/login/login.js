import { Template } from 'meteor/templating';

import './login.html';

Template.myLogin.events({
	'submit .form-login'(ev) {
		ev.preventDefault();

		const username = ev.target.username.value;
		const password = ev.target.password.value;
		Meteor.loginWithPassword(username, password, (err) => {
			if (err) {

			} else {
				bootbox.hideAll();
			}
		});
	}
});