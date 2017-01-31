import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Rpgs } from './rpgs';
import { ModelSheets } from './model-sheets';

export const Sheets = new Mongo.Collection('sheets');

// element.table
const TableElementSchema = new SimpleSchema({
  rows: {type: Number},
  cols: {type: Number},
  cases: {type: Object} // {} decrivant les cases ex Object.0.0 => 1er case ( contient label ) chaque case a 2 attr => value et label ( set par rm )
});

// element
const ElementSchema = new SimpleSchema({
  label: {type: String},
  table: {type: TableElementSchema},
  id: {type: String},
  type: {type: String}
});

const SectionSchema = new SimpleSchema({
	id: {type: String},
	name: {type: String},
	elements: {type: [ElementSchema]},
	size: {type: Number}
});

const SheetHistory = new SimpleSchema({
	raw: {type: String},
	date: {type: Date},
	owner: {type: String},
	username: {type: String},
	id: {type: String}, // id generated at my demand allow to ident history entry
	previousVal: {type: String}
});

Sheets.schema = new SimpleSchema({
	_id: {type: String, optional: true},
	model: {type: String},
	sections: {type: [SectionSchema]},
	owner: {type: String},
	username: {type: String},
	rpg: {type: String},
	lock: {type: Boolean},
	history: {type: [SheetHistory]}
});

if (Meteor.isServer) {
	Meteor.publish('rpgSheet', function sheetPublication(rpgId) {
		// on ne peut récupérer que la feuille du rpg pour l'id du current user
		return Sheets.find({owner: this.userId, rpg: rpgId});
	});
	Meteor.publish('rpgSheets', function sheetPublication(rpgId) {
		// on ne peut récupérer que la feuille du rpg pour l'id du current user
		return Sheets.find({rpg: rpgId});
	});
}

Meteor.methods({
	'sheets.updateElementField'(id, elementId, fieldName, fieldVal) {
		if (Meteor.isClient) return;
    check(id, String);
    check(elementId, String);
    check(fieldName, String);

    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const sheet = Sheets.findOne(id);

    if (!sheet) {
      throw new Meteor.Error('not-found');
    }
    const rpg = Rpgs.findOne(sheet.rpg);
    if (sheet.lock === true && rpg.roleMaster !== this.userId) {
    	// lock by roleMaster
    	throw new Meteor.Error('not-authorized');
    }
    if (sheet.owner !== this.userId && rpg.roleMaster !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    let set = {};
    let push = {};
    sheet.sections.some((s, i) => {
      return s.elements.some((e, j) => {
        if (e.id === elementId) {
        	// calcul previous val
        	let previousVal = sheet.sections[i].elements[j];
        	const keys = fieldName.split('.');
        	keys.some(k => {
        		if (!! previousVal[k]) {
        			previousVal = previousVal[k];
        		} else {
        			previousVal = '';
        			return true; // to stop it
        		}
        	});

          set['sections.'+i+'.elements.'+j+'.' + fieldName] = fieldVal;
          push['history'] = {
          	$each: [
          		{
          			raw: 'sections.'+i+'.elements.'+j+'.' + fieldName,
		          	date: new Date(),
		          	owner: this.userId,
		          	username: Meteor.users.findOne(this.userId).username,
		          	id: Random.id(),
		          	previousVal: previousVal
          		}
          	],
          	$position: 0
          };
          return true;
        }
      });
    });
    Sheets.update(id, {
      $set: set,
      $push: push
    });
	},
	'sheets.setLock'(rpgId, playerId) {
		check(playerId, String);
		check(rpgId, String);

		const sheet = Sheets.findOne({owner: playerId, rpg: rpgId});
		if (!sheet) {
			throw new Meteor.Error('not-found');
		}

		const rpg = Rpgs.findOne(rpgId);
		// only RM can lock or unlock
		if (!this.userId || rpg.roleMaster !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Sheets.update(sheet._id, {
			$set: {
				lock: ! sheet.lock
			}
		});
	},
	'sheets.cancelHistory'(sheetId, historyId) {
		check(sheetId, String);
		check(historyId, String);

		const sheet = Sheets.findOne(sheetId);
		if (!sheet) {
			throw new Meteor.Error('not-found');
		}
		const rpg = Rpgs.findOne(sheet.rpg);
		if (! this.userId || rpg.roleMaster !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		const historyEntry = sheet.history.find(h => h.id === historyId);
		let set = {};
		set[historyEntry.raw] = historyEntry.previousVal || '';
		Sheets.update(sheetId, {
			$set: set,
			$pull: {
				history: {id: historyId}
			}
		});
	}
});