import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import '../login/login.js';
import './header.html';

Template.header.helpers({
	isLog() {
		return Meteor.userId();
	},
	user() {
		return Meteor.user();
	},
	host() {
		return 'http://' + document.domain.substring(5);
	}
});

Template.header.events({
	'click .open-login'(ev, instance) {
		let box = bootbox.dialog({
			title: 'Login',
			message: '--',
			size: 'small',
			backdrop: true,
			onEscape: true,
			closeButton: false
		});
		box.find(".bootbox-body").empty();
		Blaze.renderWithData(Template.myLogin, {}, box.find(".bootbox-body")[0]);
	},
	'click .logout'() {
		Accounts.logout();
	}
});
