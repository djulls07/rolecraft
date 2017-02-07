import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Rpgs } from './rpgs.js';

export const Rolls = new Mongo.Collection('rolls');

const Result = new SimpleSchema({
	type: {type: Number},
	result: {type: Number}
});

Rolls.schema = new SimpleSchema({
	_id: {type: String, optional: true},
	owner: {type: String}, // _id of user
	username: {type: String}, // username of user,
	rpg: {type: String},
	date: {type: Date},
	results: {type: [Result]},
	total: {type: Number},
	date: {type: Date}
});

if (Meteor.isServer) {
	Meteor.publish('rolls.rpg', function rollsRpgPublication(rpgId) {
		const rpg = Rpgs.findOne(rpgId);
		if (this.userId === rpg.roleMaster) {
				return Rolls.find(
				{
					rpg: rpgId
				},
				{
					sort: {
						date: -1
					},
					limit: 50
				}
			);
		}
	});
}

Meteor.methods({
	'rolls.rollDices'(rpgId, val) {
		check(val, String);
		if (val.length < 3) {
			throw new Meteor.Error('not-authorized');
		}
		if (val.length > 50) {
			throw new Meteor.Error('not-authorized');
		}
		let roll = {};
		if (Meteor.isServer) {
			const rpg = Rpgs.findOne(rpgId);
			let results = [];
			if (!this.userId || !rpg) {
				throw new Meteor.Error('not-authorized');
			}
			if (rpg.roleMaster !== this.userId) {
				if (! rpg.players.find(p => p.owner === this.userId)) {
					throw new Meteor.Error('not-authorized');
				}
			}
			let total = 0;
			let aux = 0;
			let sep1 = ',';
			let sep2 = 'd';
			val.split(sep1).forEach((entry) => {
				const diceNb = parseInt(entry.split(sep2)[0]);
				const diceType = parseInt(entry.split(sep2)[1]);
				if (diceNb > 20) {
					throw new Meteor.Error('not-authorized');
				}
				
				for (let i = 0; i < diceNb; i++) {
					aux = parseInt(Math.random() * diceType) + 1;
					total += aux;
					results.push({
						type: diceType,
						result: aux
					});
				}
			});
			roll = {
				owner: this.userId,
				username: Meteor.users.findOne(this.userId).username,
				rpg: rpgId,
				date: new Date(),
				results: results,
				total: total
			};
			Rolls.schema.validate(roll);
			Rolls.insert(roll);
			return roll;
		}
		
	}
});