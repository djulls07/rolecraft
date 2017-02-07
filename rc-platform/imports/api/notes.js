import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Rpgs } from './rpgs.js';

export const Notes = new Mongo.Collection('notes');

Notes.schema = new SimpleSchema({
	_id: {type: String, optional: true},
	owner: {type: String},
	username: {type: String},
	attachedTo: {type: String, optional: true},
	rpg: {type: String},
	content: {type: String}
});


if (Meteor.isServer) {
	Meteor.publish('notes.rpg', function(rpgId) {
		return Notes.find({
			owner: this.userId,
			rpg: rpgId
		});
	});
}

Meteor.methods({
	'notes.insert'(rpgId, content) {
		check(rpgId, String);
		check(content, String);

		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		const note = {
			owner: this.userId,
			username: Meteor.users.findOne(this.userId).username,
			rpg: rpgId,
			content: content
		};
		Notes.schema.validate(note);
		Notes.insert(note);
	},
	'notes.update'(id, content) {
		check(id, String);
		check(content, String);

		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Notes.update({_id:id, owner: this.userId}, {
			$set: {
				content: content
			}
		});
	},
	'notes.remove'(id) {
		check(id, String);

		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Notes.remove({_id: id, owner: this.userId});
	}
});