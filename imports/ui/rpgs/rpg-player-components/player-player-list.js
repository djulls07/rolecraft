import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Rpgs } from '../../../api/rpgs.js';
import { RcFiles } from '../../../api/rc-files.js';
import { Positions } from '../../../api/positions.js';

import './player-player-list.html';

// main
Template.playerPlayerList.onCreated(function onCreatedPlayerList() {
	this.state = new ReactiveDict();
	this.state.set('vertical', false);
	this.state.set('elementId', 'dragPlayerPlayerList');
});

Template.playerPlayerList.onRendered(function() {
	this.autorun(() => {
		const position = Positions.findOne({rpg: FlowRouter.getParam('_id'), elementId: this.state.get('elementId')});
		if (!! position) {
			this.state.set('vertical', position.vertical);
		}
	});
});

Template.playerPlayerList.helpers({
	'playerConnected'() {
		let user = Meteor.users.findOne({_id: this.owner, 'status.online': true});
		return user ? true : false;
	},
	'isCurrentUser'() {
		return this.owner === Meteor.userId();
	},
	'avatarUrl'() {
		let avatar = RcFiles.findOne({'metadata.owner': this.owner, 'metadata.type': 'avatar'});
		if (!avatar) return '/images/avatar.jpg';
		avatar.getFileRecord();
		return avatar.url();
	},
	'sortRpgPlayers'() {
		let players = [];
		let me = null;
		if (!this.rpg) return players;
		this.rpg.players.forEach(p => {
			if (p.owner !== Meteor.userId()) {
				players.push(p);
			} else {
				players.unshift(p);
			}
		});
		return players;
	},
	isVertical() {
		return Template.instance().state.get('vertical');
	}
	
});

Template.playerPlayerList.events({
	'click .set-vertical'(e, instance) {
		instance.state.set('vertical', ! instance.state.get('vertical'));
		Meteor.call(
			'positions.insertOrUpdateVertical',
			FlowRouter.getParam('_id'),
			instance.state.get('elementId'),
			instance.state.get('vertical')
		);
	},
	'change .inputFileAvatar': function(event, template) {
	  var fsFile = new FS.File(event.target.files[0]);
	  const type = 'avatar';
		fsFile.metadata = {
			owner: Meteor.userId(),
			type: type,
			username: Meteor.user().username
		};
		const previous = RcFiles.find({
			'metadata.owner': Meteor.userId(),
			'metadata.type': type
		});
		if (!previous) {
			RcFiles.insert(fsFile, function (err, fileObj) {
			  if (err) throw err;
			  console.log(fileObj);
			});
		} else {
			RcFiles.insert(fsFile, function (err, fileObj) {
			  if (err) throw err;
			  previous.forEach(function (p) {
			  	if (fileObj._id === p._id) return;
					RcFiles.remove(p._id);
				});
			  console.log(fileObj);
			});
		}
	}
});