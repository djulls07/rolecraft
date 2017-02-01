import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Drawings = new Mongo.Collection('drawings');

const UserShare = new SimpleSchema({
	owner: {type: String},
	username: {type: String}
});

Drawings.schema = new SimpleSchema({
	_id: {type: String, optional: true},
	owner: {type: String},
	username: {type: String},
	sharedTo: {type: [UserShare]}, // ids of users
	rpg: {type: String}, // which rpg
	data: {type: String}, // json str representing drawing
	title: {type: String},
	createdAt: {type: Date}
});

if (Meteor.isServer) {
	Meteor.publish('drawings.rpg', function drawingsPublication(rpgId) {
		return Drawings.find({
			rpg: rpgId,
			$or: [
				{
					owner: this.userId,
				},
				{
					'sharedTo.owner': this.userId
				}
			]
		}, {
			fields: {
				data: -1,
				owner: 1,
				username:1,
				sharedTo: 1,
				rpg:1,
				title:1,
				createdAt:1
			}
		});
	});
}

Meteor.methods({
	'drawings.insert'(rpgId, title, data, sharedIds) {
		check(rpgId, String);
		check(data, String);
		check(title, String);

		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		if (data.length < 100) {
			return;
		}

		const drawingsCount = Drawings.find({rpg: rpgId, owner: this.userId}).count(); // 10 by rpg
		if (drawingsCount >= 10) {
			throw new Meteor.Error('not-authorized');
		}

		let sharedTo = [];
		if (Meteor.isServer) {
			const sharedUsers = Meteor.users.find({_id: {$in: sharedIds}});
			sharedUsers.forEach(u => {
				sharedTo.push({
					owner: u._id,
					username: u.username
				});
			});
		}

		const drawing = {
			owner: this.userId,
			username: Meteor.users.findOne(this.userId).username,
			sharedTo: sharedTo,
			rpg: rpgId,
			data: data,
			title: title,
			createdAt: new Date()
		};

		Drawings.schema.validate(drawing);
		Drawings.insert(drawing);
	},
	'drawings.remove'(id) {
		check(id, String);

		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		Drawings.remove({_id: id, owner: this.userId});
	},
	'drawings.setShared'(id, userId) {
		check(id, String);
		check(userId, String);

		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		const drawing = Drawings.findOne({owner: this.userId, _id: id});

		if (!drawing) {
			throw new Meteor.Error('not-authorized');
		}
		let indexRemove = -1;
		drawing.sharedTo.some((u,i) => {
			if (u.owner === userId) {
				indexRemove = i;
				return true;
			}
		});
		if (indexRemove === -1) {
			//push
			drawing.sharedTo.push({
				owner: userId,
				username: Meteor.users.findOne(userId)
			});
		} else {
			//spliced
			drawing.sharedTo.splice(indexRemove, 1);
		}
		//update
		Drawings.update(id, {
			$set: {
				sharedTo: drawing.sharedTo
			}
		});
	},
	'drawings.getWithData'(id) {
		check(id, String);

		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		if (Meteor.isServer) {
			const drawing = Drawings.findOne(id);
			if (drawing.owner === this.userId || drawing.sharedTo.find(u => u.owner === this.userId)) {
				return drawing;
			} else {
				throw new Meteor.Error('not-authorized');
			}
		}
	},
	'drawings.update'(id, title, data, sharedIds) {
		check(id, String);
		check(title, String);
		check(data, String);
		check(sharedIds, Array);

		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		if (Meteor.isServer) {
			const drawing = Drawings.findOne(id);
			if (drawing.owner !== this.userId) {
				throw new Meteor.Error('not-authorized');
			} else {
				let sharedTo = [];
				const sharedUsers = Meteor.users.find({_id: {$in: sharedIds}});
				sharedUsers.forEach(u => {
					sharedTo.push({
						owner: u._id,
						username: u.username
					});
				});
				Drawings.update(id, {
					$set: {
						title: title,
						data: data,
						sharedTo: sharedTo
					}
				});
			}
		}
	},
	'drawings.publicImgs'() {
		if (Meteor.isServer) {
			const fs = Npm.require("fs");
		  	const dessinsPath = process.env.PWD + '/public/images/dessins/';
		  	return fs.readdirSync(dessinsPath);
		}
	}
});