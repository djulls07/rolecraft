import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Positions = new Mongo.Collection('positions');

Positions.schema = new SimpleSchema({
	_id: {type: String, optional: true},
	owner: {type: String},
	rpg: {type: String},
	elementId: {type: String},
	left: {type: Number},
	top: {type: Number},
	offsetTop: {type: Number, optional: true},
	offsetLeft: {type: Number, optional: true},
	vertical: {type: Boolean, optional: true}
});

if (Meteor.isServer) {
	Meteor.publish('positions.rpg', function positionsPublication(rpgId) {
		return Positions.find({
			rpg: rpgId,
			owner: this.userId
		});
	});
}

Meteor.methods({
	'positions.insertOrUpdate'(rpgId, elemId, left, top) {
		check(rpgId, String);
		check(elemId, String);
		check(left, Number);
		check(top, Number);

		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		const position = Positions.findOne({
			owner: this.userId,
			rpg: rpgId,
			elementId: elemId
		});
		if (! position) {
			// create
			const newPosition = {
				owner: this.userId,
				rpg: rpgId,
				elementId: elemId,
				left: left,
				top: top,
				vertical: false
			};
			Positions.schema.validate(newPosition);
			Positions.insert(newPosition);
		} else {
			// update
			Positions.update(position._id, {
				$set: {
					left: left,
					top: top
				}
			});
		}
	},
	'positions.insertOrUpdateVertical'(rpgId, elemId, vertical) {
		check(rpgId, String);
		check(elemId, String);
		check(vertical, Boolean);

		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		const position = Positions.findOne({
			owner: this.userId,
			rpg: rpgId,
			elementId: elemId
		});
		if (! position) {
			// create
			const newPosition = {
				owner: this.userId,
				rpg: rpgId,
				elementId: elemId,
				left: 10,
				top: 10,
				vertical: vertical
			};
			Positions.schema.validate(newPosition);
			Positions.insert(newPosition);
		} else {
			// update
			Positions.update(position._id, {
				$set: {
					vertical: vertical
				}
			});
		}
	},
	'positions.remove'(rpgId) {
		check (rpgId, String);

		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Positions.update(
			{
				owner: this.userId,
				rpg: rpgId
			},
			{
				$set: {
					left: 10,
					top: 10,
					vertical: false
				}
			},
			{
				multi: true
			}
		);
	}
});