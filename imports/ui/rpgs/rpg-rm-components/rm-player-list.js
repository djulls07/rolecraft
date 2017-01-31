import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Rpgs } from '../../../api/rpgs.js';
import { Sheets } from '../../../api/my-sheets.js';
import { RcFiles } from '../../../api/rc-files.js';
import { Positions } from '../../../api/positions.js';
import './rm-player-list.html';

// import components
import '../common/player-sheet.js';

// main
Template.rmPlayerList.onCreated(function onCreatedPlayerList() {
	this.state = new ReactiveDict();
	this.state.set('vertical', false);
	this.state.set('elementId', 'dragRmPlayerList');
});

Template.rmPlayerList.onRendered(function() {
	this.autorun(() => {
		const position = Positions.findOne({rpg: FlowRouter.getParam('_id'), elementId: this.state.get('elementId')});
		if (!! position) {
			this.state.set('vertical', position.vertical);
		}
	});
});

Template.rmPlayerList.helpers({
	'playerConnected'() {
		let user = Meteor.users.findOne({_id: this.owner, 'status.online': true});
		return user ? true : false;
	},
	'avatar'() {
		return RcFiles.findOne({'metadata.owner': this.owner, 'metadata.type': 'avatar'});
	},
	url(avatar) {
		if (!avatar) return '/images/avatar.jpg';
		avatar.getFileRecord();
		return avatar.url();
	},
	sheetLock() {
		const s = Sheets.findOne({owner: this.owner, rpg: FlowRouter.getParam('_id')});
		return s && s.lock;
	},
	isVertical() {
		return Template.instance().state.get('vertical');
	}
});

Template.rmPlayerList.events({
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
		const sheet = Sheets.findOne({rpg: FlowRouter.getParam('_id'), owner: this.owner});
		Blaze.renderWithData(Template.playerSheet, {sheetId: sheet._id}, box.find(".bootbox-body")[0]);
	},
	'click .set-lock-sheet'() {
		Meteor.call('sheets.setLock', FlowRouter.getParam('_id'), this.owner);
	},
	'click .set-vertical'(e, instance) {
		instance.state.set('vertical', ! instance.state.get('vertical'));
		Meteor.call(
			'positions.insertOrUpdateVertical',
			FlowRouter.getParam('_id'),
			instance.state.get('elementId'),
			instance.state.get('vertical')
		);
	}
});