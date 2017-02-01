import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { ModelSheets } from './model-sheets.js';
import { Sheets } from './my-sheets.js';
import { Chats } from './chats.js';

export const Rpgs = new Mongo.Collection('rpgs');

const PlayerSchema = new SimpleSchema({
	owner: {type: String}, // _id of user
	username: {type: String}, // username of user,
	interfaceLock: {type: Boolean, optional: true}
});

Rpgs.schema = new SimpleSchema({
	_id: {type: String, optional: true},
	name: {type: String, min: 1},
	modelSheet: {type: ModelSheets.schema},
	language: {type: String, min: 2},
	password: {type: String, optional: true},
	roleMaster: {type: String},
	roleMasterUsername: {type: String},
	roleMasterInterfaceLock: {type: Boolean, optional: true},
	open: {type: Boolean},
	players: {type: [PlayerSchema], optional: true},
	archived: {type: Boolean},
	createdAt: {type: Date}
});

function getRpgQuery(onlyMine, archived = false) {
	if (onlyMine) {
		return {
			archived: archived,
			$or: [
				{roleMaster: this.userId},
				{'players.owner': this.userId}
			]
		};
	} else {
		return {
			archived:archived,
			$or: [
				{roleMaster: this.userId},
				{'players.owner': this.userId},
				{'open': true}
			]
		};
	}
}

if (Meteor.isServer) {
	//list
	Meteor.publish('rpgs', function rpgsPublication(onlyMine, archived = false) {
		return Rpgs.find(getRpgQuery.call(this, onlyMine, archived));
	});

	// roleMasters list status
	Meteor.publish('rpgsRoleMastersStatus', function rpgsRoleMastersStatusPublication(onlyMine, archived = false) {
		let userIds = [];
		Rpgs.find(getRpgQuery.call(this, onlyMine, archived))
		.forEach((rpg) => {
			userIds.push(rpg.roleMaster);
		});
		return Meteor.users.find(
			{
				$and: [
					{_id: {$in: userIds}},
					{'status.online': true},
				]
			},
			{
				fields: {status: 1}
			}
		);
	});

	// one rpg
	Meteor.publish('rpg', function rpgPublication(id) {
		// Find rpg with _id == id & where user is already player or RM
		return Rpgs.find({
			$and: [
				{_id: id},
				{$or: [
					{roleMaster: this.userId},
					{'players.owner': this.userId},
				]}
			]
		});
	});
	//publis all users of a rpg
	Meteor.publish('rpgUsers', function rpgUsersPublication(id) {
		const rpg = Rpgs.findOne(id);
		let ids = rpg.players.map(p => p.owner);
		ids.push(rpg.roleMaster);
		return Meteor.users.find(
			{_id: {$in: ids}},
			{fields: {status: 1}}
		);
	});
}

Meteor.methods({
	'rpgs.insert'(name, language, modelSheet, password) {
		check(name, String);
		check(language, String);
		check(modelSheet, String);
		check(password, String);

		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		let model = ModelSheets.findOne(modelSheet);
		let rpg = {
			name: name,
			language: language,
			modelSheet: model, // is a clone of model ( then the real one can be modify without changing the user experience )
			password: password,
			roleMaster: this.userId,
			roleMasterUsername: Meteor.users.findOne(this.userId).username,
			open: true,
			players: [],
			archived: false,
			createdAt: new Date()
		};
		//Rpgs.schema.validate(rpg);
		Rpgs.insert(rpg);
	},
	'rpgs.enterGame'(id, password = '') {
		check(id, String);
		check(password, String);

		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		// check if user not in rpg already & rpg is open to new players
		const rpg = Rpgs.findOne(id);
		if (!rpg) {
			throw new Meteor.Error(404, 'not-found');
		}
		if (rpg.roleMaster === this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		if (rpg.players.some(p => p.owner === this.userId)) {
			throw new Meteor.Error('not-authorized');
		}
		if (rpg.password && rpg.password.length) {
			if (rpg.password !== password) {
				throw new Meteor.Error('not-authorized');
			}
		}
		if (rpg.archived) {
			throw new Meteor.Error('not-authorized');
		}

		/* Generate sheet */
		const model = rpg.modelSheet;
		const username = Meteor.users.findOne(this.userId).username;
				
		let sheet = {
			model: rpg.modelSheet._id,
			sections: model.sections,
			owner: this.userId,
			username: username,
			rpg: rpg._id,
			lock: false
		};
		//Sheets.schema.validate(sheet);
		sheet = Sheets.insert(sheet);

		let newPlayer = {
			owner: this.userId,
			username: username,
			interfaceLock: false
		}
		// check schema
		PlayerSchema.validate(newPlayer);

		Rpgs.update(id, {
			$push: {
				players: newPlayer
			}
		});

		/* Create of add player to mainChat & create private one between */
		const mainChat = Chats.findOne({
			rpg: id,
			type: 'all-players'
		});

		if(! mainChat) {
			const newChat = {
				rpg: id,
				type: 'all-players',
				name: 'all',
				users: [
					{
						owner: this.userId,
						username: username,
						unread: 0
					},
					{
						owner: rpg.roleMaster,
						username: rpg.roleMasterUsername,
						unread: 0
					}
				],
				messages: []
			}
			Chats.schema.validate(newChat);
			Chats.insert(newChat);
		} else {
			Chats.update(mainChat._id, {
				$push: {
					users: {
						owner: this.userId,
						username: username,
						unread: 0
					}
				}
			});
		}

		const newPrivateChat = {
			rpg: id,
			name: username + ' - ' + rpg.roleMasterUsername,
			type: 'rm-player',
			users: [
				{
					owner: this.userId,
					username: username,
					unread: 0
				},
				{
					owner: rpg.roleMaster,
					username: rpg.roleMasterUsername,
					unread: 0
				}
			],
			messages: []
		}
		Chats.schema.validate(newPrivateChat);
		Chats.insert(newPrivateChat);
	},
	'rpgs.rm.setOpen'(id) {
		check(id, String);
		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		// check if user not in rpg already & rpg is open to new players
		const rpg = Rpgs.findOne(id);
		if (!rpg) {
			throw new Meteor.Error(404, 'not-found');
		}
		if (rpg.roleMaster !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		Rpgs.update(id, {
			$set: {
				open: ! rpg.open
			}
		});
	},
	'rpgs.setInterfaceLock'(id) {
		check(id, String);
		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		const rpg = Rpgs.findOne(id);
		let set = {};
		if (rpg.roleMaster === this.userId) {
			const val = rpg.roleMasterInterfaceLock ? true : false;
			set['roleMasterInterfaceLock'] = ! val;
		} else {
			rpg.players.some((p, i) => {
				if (p.owner === this.userId) {
					const val = p.interfaceLock ? true : false;
					set['players.'+i+'.interfaceLock'] = ! val;
				}
			});
		}
			
		Rpgs.update(id, {
			$set: set
		});
	},
	'rpgs.setArchived'(id) {
		check(id, String);

		const rpg = Rpgs.findOne({_id: id, roleMaster: this.userId});
		Rpgs.update({_id: id, roleMaster: this.userId}, {
			$set: {
				archived: ! rpg.archive
			}
		});
	}
});