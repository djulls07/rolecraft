import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Pnjs } from '../../../api/pnjs.js';

import './pnj-sheet.html';

import './dices-launcher.js';

Template.pnjSheet.onCreated(function onCreatedPlayerSheet() {
	const pnjId = Blaze.getData().pnjId;
	this.state = new ReactiveDict();
	this.state.set('pnjId', pnjId);
});

Template.pnjSheet.onRendered(function() {
	$('.myDraggable').draggable();
});

Template.pnjSheet.helpers({
	'pnj'() {
		const instance = Template.instance();
		return Pnjs.findOne(instance.state.get('pnjId'));
	},
	'sheet'() {
		const instance = Template.instance();
		return Pnjs.findOne(instance.state.get('pnjId')).sheet;
	},
	'tableCaseField'(cases, field, x, y) {
    	return (cases && cases[x] && cases[x][y] && cases[x][y][field]) ? cases[x][y][field] : '';
  	},
  	'disabled'() {
  		return false;
  	}
});

Template.pnjSheet.events({
	'change .updatable'(event, instance) {
		const fieldName = event.target.name;
		let fieldVal = event.target.value;
		if (fieldVal.split('d').length === 2) {
			const nb = parseInt(fieldVal.split('d')[0]);
			const n = parseInt(fieldVal.split('d')[1]);
			fieldVal = parseInt((Math.random() * nb) * n);
		}
		Meteor.call('pnjs.sheet.updateElementField', instance.state.get('pnjId'), this.id, fieldName, fieldVal);
	}
});