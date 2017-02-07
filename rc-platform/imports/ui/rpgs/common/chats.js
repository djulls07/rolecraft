import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Chats } from '../../../api/chats.js';

import './chats.html';

Template.rpgChats.onCreated(function onCreatedRpgChats() {
	this.state = new ReactiveDict();
	this.state.set('currentChat', '');
	this.state.set('hideBody', false);
});

Template.rpgChats.onRendered(() => {
	
});

Template.rpgChats.helpers({
	'chats'() {
		// all that is publish is my chats ( or all if RM )
		return Chats.find({rpg: FlowRouter.getParam('_id')});
	},
	'currentChat'() {
		const currentChatId = Template.instance().state.get('currentChat');
		Chats.find({_id:currentChatId}).observeChanges({
		   added: function (id, fields) {
		   		setTimeout(function() {
		   			let doc = document.getElementById('scrollBot');
					doc.scrollTop = doc.scrollHeight;
		   		}, 200);
		   },
		   changed: function (id, fields) {
		    	setTimeout(function() {
		   			let doc = document.getElementById('scrollBot');
					doc.scrollTop = doc.scrollHeight;
		   		}, 200);
		   }
		});
		return Chats.findOne(currentChatId);
	},
	'isActive'() {
		return (this._id === Template.instance().state.get('currentChat')) ? 'active' : '';
	},
	'hasSelectedChat'() {
		const inst = Template.instance();
		return inst.state.get('currentChat') && inst.state.get('currentChat').length;
	},
	'unread'() {
		return this.users.find(u => u.owner === Meteor.userId()).unread;
	},
	'chatName'() {
		if (this.name === 'all') {
			return this.name;
		}
		if (this.users.length > 2) {
			return this.name;
		}
		if (this.users[0].owner === Meteor.userId()) {
			return this.users[1].username;
		}
		return this.users[0].username;
	},
	'chatNb'() {
		return Chats.find({rpg: FlowRouter.getParam('_id')}).count();
	},
	'notHideBody'() {
		return Template.instance().state.get('hideBody') ? '' : 'hide';
	},
	chatNbPlayers(rpg) {
		if (!rpg) return 0;
		if (Meteor.userId() === rpg.roleMaster) {
			return rpg.players.length;
		}
		return 1;
	}
});

Template.rpgChats.events({
	'click .change-chat'(ev, instance) {
		instance.state.set('currentChat', this._id);
	},
	'submit .form-new-message'(event, instance) {
		event.preventDefault();
		const chatId = instance.state.get('currentChat');
		const target = event.target;
		const content = target.content.value;
		if (content.length) {
			Meteor.call('chats.insertMessage', chatId, content);
		}
		target.content.value = '';
	},
	'click .set-read'() {
		Meteor.call('chats.setRead', this._id);
	},
	'click .hide-body'(e, instance) {
		instance.state.set('hideBody', ! instance.state.get('hideBody'));
	}
});