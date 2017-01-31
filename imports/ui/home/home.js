import { Template } from 'meteor/templating';
import { Posts } from '../../api/posts.js';

import './home.html';

Template.home.onCreated(function onCreatedHome() {
	Meteor.subscribe('posts');
});
Template.home.helpers({
	posts() {
		return Posts.find({}, {sort: {createdAt: -1}});
	}
});
Template.home.events({
	'submit .form-new-post'(ev) {
		ev.preventDefault();
		const t = ev.target;
		Meteor.call('posts.insert', t.title.value, t.content.value);
		t.title.value = '';
		t.content.value = '';
	}
});