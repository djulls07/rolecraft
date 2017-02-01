import { Template } from 'meteor/templating';
import { Pnjs } from '../../../api/pnjs.js';
import { ModelSheets } from '../../../api/model-sheets.js';
import { ReactiveVar } from 'meteor/reactive-var';

import './rm-pnjs.html';
import '../common/pnj-sheet.js';

Template.rmPnjs.onCreated(function onCreatedRmRollsHistory() {
	this.showBody = new ReactiveVar(true);
});

Template.rmPnjs.helpers({
	'pnjs'() {
		return Pnjs.find({rpg: FlowRouter.getParam('_id')});
	},
	'modelsheets'() {
		return ModelSheets.find({});
	},
	'showBody'() {
		return Template.instance().showBody.get();
	}
});

Template.rmPnjs.events({
	'submit .new-pnj'(ev) {
		ev.preventDefault();
		const target = ev.target;
		const name = target.name.value;
		let modelId = '';
		if (target.model) {
			modelId = target.model.value;
		}

		Meteor.call('pnjs.insert', FlowRouter.getParam('_id'), name, modelId);

		target.name.value = '';
	},
	'click .open-sheet': function (ev, instance) {
		let box = bootbox.dialog({
			message: '--',
			size: 'large',
			backdrop: true,
			onEscape: true,
			closeButton: false
		});
		box.find(".bootbox-body").empty();
		box.find(".modal-body").addClass('no-padding');

		Blaze.renderWithData(Template.pnjSheet, {pnjId: this._id}, box.find(".bootbox-body")[0]);
	},
	'keyup .model-search'(ev, instance) {
		const search = ev.target.value;
		if (instance.sub) instance.sub.stop();
		instance.sub = Meteor.subscribe('modelsheets.search', search);
	},
	'click .pnj-remove'(ev) {
		Meteor.call('pnjs.remove', this._id);
	},
	'click .click-deploy'(ev, inst) {
		inst.showBody.set(! inst.showBody.get());
	}
});