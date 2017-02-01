import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Rpgs } from './rpgs.js';
import { ModelSheets } from './model-sheets';

export const Pnjs = new Mongo.Collection('pnjs');

Pnjs.schema = new SimpleSchema({
	_id: {type: String, optional: true},
	name: {type: String},
	rpg: {type: String},
	owner: {type: String},
	username: {type: String},
	sheet: {type: Object}
});

if (Meteor.isServer) {
	Meteor.publish('pnjs.rpg', function positionsPublication(rpgId) {
		return Pnjs.find({
			rpg: rpgId,
			owner: this.userId // seul le mj pourra en créer
		});
	});
}

Meteor.methods({
	'pnjs.insert'(rpgId, name, modelSheetId) {
		check(rpgId, String);
		check(name, String);
		
		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		const rpg = Rpgs.findOne(rpgId);
		if (!rpg || rpg.roleMaster !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		let modelSheet = rpg.modelSheet;
		if (modelSheetId && modelSheetId.length) {
			modelSheet = ModelSheets.findOne(modelSheetId);
		}

		if (!modelSheet) {
			modelSheet = rpg.modelSheet;
		}

		Pnjs.insert({
			owner: this.userId,
			username: Meteor.users.findOne(this.userId).username,
			sheet: modelSheet, // contient sa feuille directement ( la collec sheet ne contient que des feuilles de joueurs )
			rpg: rpgId,
			name: name
		});
	},
	'pnjs.sheet.updateElementField'(id, elementId, fieldName, fieldVal) {
		check(id, String);
	    check(elementId, String);
	    check(fieldName, String);

	    if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		const pnj = Pnjs.findOne(id);
		if (pnj.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		let sheet = pnj.sheet;
		let set = {};
		sheet.sections.some((section, indexS) => {
			return section.elements.some((element, indexE) => {
				if (element.id === elementId) {
					set['sheet.sections.'+indexS+'.elements.'+indexE+'.'+fieldName] = fieldVal;
					return true;
				}
			});
		});
		Pnjs.update(id, {
			$set: set
		});
	},
	'pnjs.remove'(id) {
		check(id, String);
		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		const pnj = Pnjs.findOne(id);
		if (pnj.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Pnjs.remove(id);
	}
});