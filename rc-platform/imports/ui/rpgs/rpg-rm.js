import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Rpgs } from '../../api/rpgs.js';
import { Positions } from '../../api/positions.js';

// import components & template for page

import './rpg-rm-components/rm-menu.js';
import './rpg-rm-components/rm-player-list.js';
import './rpg-rm-components/rm-sheets-histories.js';
import './common/chats.js';
import './common/notes.js';
import './common/dices-launcher.js';
import './rpg-rm-components/rm-pnjs.js';
import './rpg-rm-components/rm-rolls-history.js';

// import main template
import './rpg-rm.html';

Template.rpgRm.onCreated(function onCreatedRpgRm() {
	const id = FlowRouter.getParam('_id');
	this.autorun(() => {
		Meteor.subscribe('rpg', id);
		Meteor.subscribe('rpgSheets', id);
		Meteor.subscribe('rpgUsers', id);
		Meteor.subscribe('rcfiles.rpg.avatar', id);
		Meteor.subscribe('rcfiles.rpg', id);
		Meteor.subscribe('chats.rpg', id);
		Meteor.subscribe('drawings.rpg', id);
		Meteor.subscribe('rolls.rpg', id);
		Meteor.subscribe('positions.rpg', id, () => {
			const draggables = $('.myDraggable');
			const isLock = Rpgs.findOne(FlowRouter.getParam('_id')).roleMasterInterfaceLock ? true : false;
			this.initInterfaceLock = isLock;
			draggables.draggable({disabled: isLock});
		});
		Meteor.subscribe('pnjs.rpg', id);
		Meteor.subscribe('notes.rpg', id);
	}, true);
});

Template.rpgRm.onRendered(function onRenderedRpgRm() {
	const draggables = $('.myDraggable');
	
	draggables.draggable({containment: '.rpgRmContainer'});
	draggables.draggable({disabled: true});

	// init positioning & autorun positioning
	this.autorun(() => {
		$.each(draggables, function(index, d) {
			const elem = $(d);
			const elemId = elem.attr('id');
			const position = Positions.findOne({rpg: FlowRouter.getParam('_id'), elementId: elemId});
			if (!! position) {
				elem.css('left', position.left+'px');
				elem.css('top', position.top +'px');
			}
		});
	}, true);
	
	//save positioning
	draggables.on('dragstop', function(ev, ui) {
		const id = $(this).attr('id');
		Meteor.call(
			'positions.insertOrUpdate',
			FlowRouter.getParam('_id'),
			id,
			ui.position.left,
			ui.position.top
		);
	});
});

Template.rpgRm.helpers({
	rpg() {
		const id = FlowRouter.getParam('_id');
		return Rpgs.findOne(id);
	},
	interfaceLock() {
		const id = FlowRouter.getParam('_id');
		const rpg = Rpgs.findOne(id);
		if (!rpg) return false;
		return rpg.roleMasterInterfaceLock;
	}
});

Template.rpgRm.events({
	'click .set-lock'(ev, instance) {
		const isLock = Rpgs.findOne(FlowRouter.getParam('_id')).roleMasterInterfaceLock;
		// db now:
		Meteor.call('rpgs.setInterfaceLock', FlowRouter.getParam('_id'));
		
		const draggables = $('.myDraggable');
		if (! isLock) {
			//lock 
			draggables.draggable({'disabled': true});
		} else {
			draggables.draggable({containment: '.rpgRmContainer', 'disabled': false});
		}
	},
	'click .set-reset'() {
		bootbox.confirm(Blaze._globalHelpers.translate('reset-inferface-confirm'), function(res) {
			if (res) {
				Meteor.call('positions.remove', FlowRouter.getParam('_id'));
			}
		});
	}
});