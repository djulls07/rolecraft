import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Rpgs } from '../../api/rpgs.js';
import { ModelSheets } from '../../api/model-sheets.js';
import './rpg-list.html';

Template.rpgList.onCreated(function onCreatedRpgList() {
	this.state = new ReactiveDict();
	this.state.set('onlyMine', false);
	this.state.set('archived', false);
	this.autorun(() => {
		Meteor.subscribe('rpgs', this.state.get('onlyMine'), this.state.get('archived'), () => {
			Meteor.subscribe('rpgsRoleMastersStatus', this.state.get('onlyMine'), this.state.get('archived'));
		});
	}, true);
	this.autorun(() => {
	    Meteor.subscribe('modelsheets');
	});
});

Template.rpgList.helpers({
	rpgs() {
		return Rpgs.find({}, {sort: {createdAt: -1}});
	},
	roleMasterOnline() {
		// if we found it he is online ( server publish only the status of online roleMasters )
		const rm = Meteor.users.findOne(this.roleMaster);
		return (rm && rm.status && rm.status.online) ? true : false;
	},
	isRm() {
		return this.roleMaster === Meteor.userId();
	},
	isPlayer() {
		const userId = Meteor.userId();
		return this.players.some(p => p.owner === userId);
	},
	canEnter() {
		const userId = Meteor.userId();
		return userId && (this.roleMaster === userId || 
		this.players.some(p => p.owner === userId) ||
		this.open === true);
	},
	modelSheets() {
		return ModelSheets.find({},{sort: {name: 1}});
	},
	'isNotArchived'() {
		return ! this.archived;
	}
});

Template.rpgList.events({
	'submit .form-new-rpg'(event, instance) {
		event.preventDefault();
		const target = event.target;
		const name = target.rpgName.value;
		const language = target.rpgLanguage.value;
		const password = target.rpgPassword.value;
		const modelSheet = target.rpgSheet.value;
		Meteor.call('rpgs.insert', name, language, modelSheet, password, () => {
			Meteor.subscribe('rpgsRoleMastersStatus', instance.state.get('onlyMine'), instance.state.get('archived'));
		});
		target.rpgName.value = '';
		target.rpgLanguage.value = '';
		target.rpgPassword.value = '';
	},
	'click .filter-only-me'(event, instance) {
		instance.state.set('onlyMine', ! instance.state.get('onlyMine'));
	},
	'click .filter-archived'(event, instance) {
		instance.state.set('archived', ! instance.state.get('archived'));
	},
	'click .log-to-enter'(ev) {
		ev.preventDefault();
		const mess = Blaze._globalHelpers['translate']('login-to-continue');
		bootbox.alert(mess);
	},
	'click .enter-game'(event, instance) {
		event.preventDefault();
		const rpgId = this._id;
		let role = 'new';
		if (! Meteor.userId()) {
			bootbox.alert('Please log in');
		}
		if (this.roleMaster === Meteor.userId()) {
			role = 'rm';
		} else {
			this.players.some(p => {
				if (p.owner === Meteor.userId()) {
					role = 'p';
					return true;
				}
			});
		}
		if (role === 'new' && ! this.password) {
			Meteor.call('rpgs.enterGame', rpgId, (err, res) => {
				if (! err) {
					// redirect
					FlowRouter.go('rpgPlayer', {_id: rpgId});
				}
			});
		}
		if (role === 'new' && this.password.length) {
			bootbox.prompt('Password', function(password) {
				Meteor.call('rpgs.enterGame', rpgId, password, (err, res) => {
					if (! err) {
						// redirect
						FlowRouter.go('rpgPlayer', {_id: rpgId});
					}
				});
			});
		} else {
			if (role === 'rm') {
				FlowRouter.go('rpgRm', {_id: rpgId});
			} else {
				FlowRouter.go('rpgPlayer', {_id: rpgId});
			}
		}
	},
	'click .set-archived'() {
		Meteor.call('rpgs.setArchived', this._id);
	}
});