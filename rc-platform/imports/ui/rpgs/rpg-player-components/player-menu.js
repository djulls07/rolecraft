import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Sheets } from '../../../api/my-sheets.js';
import { Blaze } from 'meteor/blaze';

import './player-menu.html';

// import components
import '../common/player-sheet.js';
import '../common/drawing.js';


Template.playerMenu.onCreated(function onCreatedPlayerMenuBot() {
	
});

Template.playerMenu.helpers({
	
});

Template.playerMenu.events({
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
		const sheet = Sheets.findOne({rpg: this.rpg._id, owner: Meteor.userId()});
		Blaze.renderWithData(Template.playerSheet, {sheetId: sheet._id}, box.find(".bootbox-body")[0]);
	},
	'click .open-drawing'(ev, instance) {
		let box = bootbox.dialog({
			title: 'Drawings',
			message: '--',
			size: 'large',
			backdrop: true,
			onEscape: true,
			closeButton: false
		});
		box.find(".bootbox-body").empty();
		Blaze.renderWithData(Template.rpgDrawing, {}, box.find(".bootbox-body")[0]);
	},
	'click .open-dataroom'(ev, instance) {
		let box = bootbox.dialog({
			title: Blaze._globalHelpers.translate('dataroom'),
			message: '--',
			size: 'large',
			backdrop: true,
			onEscape: true,
			closeButton: false
		});
		box.find(".bootbox-body").empty();
		Blaze.renderWithData(Template.rpgDataroom, {}, box.find(".bootbox-body")[0]);
	}
});