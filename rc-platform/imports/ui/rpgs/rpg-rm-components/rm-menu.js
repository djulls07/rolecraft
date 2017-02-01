import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Blaze } from 'meteor/blaze';

import './rm-menu.html';

// import components
import '../common/drawing.js';
import './manage-open.js';
import '../common/dataroom.js';

Template.rmMenu.onCreated(function onCreatedPlayerMenuBot() {
});

Template.rmMenu.helpers({
	
});

Template.rmMenu.events({
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