import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Rpgs } from '../../api/rpgs.js';
import { Positions } from '../../api/positions.js';

// main template
import './rpg-player.html';

// import components to include
import './rpg-player-components/player-player-list.js';
import './rpg-player-components/player-menu.js';
import './common/chats.js';
import './common/notes.js';
import './common/dices-launcher.js';

Template.rpgPlayer.onCreated(function onCreatedRpgRm() {
	const id = FlowRouter.getParam('_id');
	this.autorun(() => {
		Meteor.subscribe('rpg', id);
		Meteor.subscribe('rpgSheets', id);
		Meteor.subscribe('rpgUsers', id);
		Meteor.subscribe('rcfiles.rpg.avatar', id);
		Meteor.subscribe('rcfiles.rpg', id);
		Meteor.subscribe('chats.rpg', id);
		Meteor.subscribe('drawings.rpg', id);
		Meteor.subscribe('positions.rpg', id, () => {
			const draggables = $('.myDraggable');
			const isLock = Rpgs.findOne(FlowRouter.getParam('_id')).players.find(p => p.owner === Meteor.userId()).interfaceLock ? true : false;
			this.initInterfaceLock = isLock;
			draggables.draggable({disabled: isLock});
		});
		Meteor.subscribe('notes.rpg', id);
	}, true);
	this.state = new ReactiveDict();
	this.state.set('interfaceLock', false);
});

Template.rpgPlayer.onRendered(function onRenderedRpgPlayer() {
	const draggables = $('.myDraggable');
	draggables.draggable({containment: '.rpgPlayerContainer'});

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

Template.rpgPlayer.helpers({
	rpg() {
		const id = FlowRouter.getParam('_id');
		return Rpgs.findOne(id);
	},
	interfaceLock() {
		const id = FlowRouter.getParam('_id');
		const rpg = Rpgs.findOne(id);
		if (!rpg) return false;
		const player = rpg.players.find(p => p.owner === Meteor.userId());
		if (rpg.roleMaster === Meteor.userId()) {
			return rpg.roleMasterInterfaceLock;
		} else if (player) {
			return player.interfaceLock ? true : false;
		}
	}
});

Template.rpgPlayer.events({
	'click .set-lock'(ev, instance) {
		const isLock = Rpgs.findOne(FlowRouter.getParam('_id')).players.find(p => p.owner === Meteor.userId()).interfaceLock;
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