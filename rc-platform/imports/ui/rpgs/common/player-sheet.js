import { Template } from 'meteor/templating';
import { Sheets } from '../../../api/my-sheets.js';
import { Rpgs } from '../../../api/rpgs.js';
import { ReactiveDict } from 'meteor/reactive-dict';

import './player-sheet.html';

import './dices-launcher.js';

Template.playerSheet.onCreated(function onCreatedPlayerSheet() {
	const sheetId = Blaze.getData().sheetId;
	this.state = new ReactiveDict();
	this.state.set('sheetId', sheetId);
});

Template.playerSheet.onRendered(function() {
	$('.myDraggable').draggable();
});

Template.playerSheet.helpers({
	'sheet'() {
		const instance = Template.instance();
		return Sheets.findOne(instance.state.get('sheetId'));
	},
	'tableCaseField'(cases, field, x, y) {
    	return (cases && cases[x] && cases[x][y] && cases[x][y][field]) ? cases[x][y][field] : '';
  	},
  	'disabled'() {
  		const instance = Template.instance();
  		const sheet = Sheets.findOne(instance.state.get('sheetId'));
  		const rpg = Rpgs.findOne(sheet.rpg);
  		if (rpg.roleMaster === Meteor.userId()) {
  			return false;
  		}
  		return sheet.lock;
  	}
});

Template.playerSheet.events({
	'change .updatable'(event, instance) {
		const fieldName = event.target.name;
		let fieldVal = event.target.value;
		if (fieldVal.split('d').length === 2) {
			const nb = parseInt(fieldVal.split('d')[0]);
			const n = parseInt(fieldVal.split('d')[1]);
			fieldVal = parseInt((Math.random() * nb) * n);
		}
		Meteor.call('sheets.updateElementField', instance.state.get('sheetId'), this.id, fieldName, fieldVal); // rpgId ? suerId
	}
});