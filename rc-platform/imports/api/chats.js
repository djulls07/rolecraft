import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Rpgs } from './rpgs.js';

export const Chats = new Mongo.Collection('chats');

const ChatUser = new SimpleSchema({
	owner: {type: String},
	username: {type: String},
	unread: {type: Number}
});

const ChatMessage = new SimpleSchema({
	content: {type: String},
	owner: {type: String},
	username: {type: String},
	date: {type: String}
});

Chats.schema = new SimpleSchema({
	_id: {type: String, optional: true},
	rpg: {type: String},
	name: {type: String}, // nom du chat
	users: {type: [ChatUser]},
	messages: {type: [ChatMessage]},
	type: {type: String} // all-players or other
});

if (Meteor.isServer) {
	Meteor.publish('chats.rpg', function chatRpgPublication(rpgId) {
		const rpg = Rpgs.findOne(rpgId);
		if (rpg.roleMaster === this.userId) {
			// role Master can see all chats
			return Chats.find({rpg: rpgId});
		}
		return Chats.find({
			'rpg': rpgId,
			'users.owner': this.userId
		});
	});
}

Meteor.methods({
	'chats.insertMessage'(id, content) {
		check(id, String);
		check(content, String);

		if (! content.length) {
			return;
		}

		if (!this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		const chat = Chats.findOne(id);
		let users = [];
		chat.users.forEach(u => {
			if (u.owner !== this.userId) {
				u.unread++;
			}
			users.push(u);
		});

		Chats.update(id, {
			$push: {
				messages: {
					content: content,
					owner: this.userId,
					username: Meteor.users.findOne(this.userId).username,
					date: new Date()
				}
			},
			$set: {
				'users': users
			}
		});
	},
	'chats.setRead'(id) {
		check(id, String);

		if (!this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		const chat = Chats.findOne(id);
		let set = {};
		chat.users.some((u, i) => {
			if (u.owner === this.userId) {
				set['users.'+i+'.unread'] = 0;
				return true;
			}
			return false;
		});

		Chats.update(id, {
			$set: set
		});
	}
});