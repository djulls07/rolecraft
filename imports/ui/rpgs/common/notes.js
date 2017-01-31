import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Drawings } from '../../../api/drawings.js';
import { Notes } from '../../../api/notes';
import './notes.html';

Template.rpgNotes.onCreated(function onCreatedRpgNotes () {
	this.showBody = new ReactiveVar(true);
});

Template.rpgNotes.helpers({
	notes() {
		return Notes.find({});
	},
	'showBody'() {
		return Template.instance().showBody.get();
	}
});

Template.rpgNotes.events({
	'click .new-note'(ev, instance) {
		Meteor.call('notes.insert', FlowRouter.getParam('_id'), '');
	},
	'change, edit-note'(ev) {
		const id = this._id;
		const content = ev.target.value;
		Meteor.call('notes.update', id, content);
	},
	'click .remove-note'() {
		const id = this._id;
		Meteor.call('notes.remove', id);
	},
	'click .click-deploy'(ev, inst) {
		inst.showBody.set(! inst.showBody.get());
	}
});