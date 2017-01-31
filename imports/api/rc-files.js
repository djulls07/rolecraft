import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Rpgs } from './rpgs.js';

export const RcFiles = new FS.Collection("rcfiles", {
  stores: [new FS.Store.GridFS("rcfiles")],
  filter: {
    maxSize: 10485760, // in bytes
    allow: {
      contentTypes: ['image/*', 'video/*', 'audio/*'],
      extensions: ['png', 'jpg', 'gif', 'mp3', 'mp4', 'jpeg']
    },
    onInvalid: function (message) {
      if (Meteor.isClient) {
        bootbox.alert(message);
      } else {
        console.log(message);
      }
    }
  }
});

const UserShare = new SimpleSchema({
	owner: {type: String},
	username: {type: String}
});
const MetadataSchema = new SimpleSchema({
	owner: {type: String},
	username: {type: String},
	rpg: {type: String, optional: true},
	sharedTo: {type: [UserShare], optional: true},
	type: {type: String, optional: true},
	title: {type: String, optional: false}
});

if (Meteor.isServer) {

	RcFiles.allow({
	  'insert': function (userId, doc) {
	    // add custom authentication code here
	    if (!userId) {
	    	return false;
	    }
	    if(! doc.metadata.rpg && doc.metadata.type !== 'avatar') {
	    	return false;
	    }
	    const files = RcFiles.find({
	    	'metadata.owner': userId,
	    	'metadata.rpg': doc.metadata.rpg
	    });
	    // check size
	    let size = 0;
	    files.forEach(f => {
	    	size += f.size();
	    });
	    if (size > 10485760) {
	    	return false;
	    }
	    return true;
	  },
	  'update': function (userId, doc) {
	    // add custom authentication code here
	    return doc.metadata.owner === userId;
	  },
	  'download': function (userId, doc) {
	    // add custom authentication code here
	    if (doc.metadata.type === 'avatar') {
	    	return true;
	    }
	    if (doc.metadata.sharedTo && doc.metadata.sharedTo.find(u => u.owner === this.userId)) {
	    	return true;
	    }
	    // si pas avatar, on refuse le download ( pour le moment )
	    return doc.metadata.owner === userId;
	  },
	  remove: function(userId, doc) {
	  	return doc.metadata.owner === userId;
	  }
	});

	Meteor.publish('rcfiles.rpg', function rcFilesPublication(rpgId) {
		if (this.userId) {
			return RcFiles.find({
				
				$or: [
					{
						'metadata.owner': this.userId,
						'metadata.rpg': rpgId
					},
					{
						'metadata.sharedTo.owner': this.userId,
						'metadata.rpg': rpgId
					}
				]
			});
		}
	});

	Meteor.publish('rcfiles.rpg.avatar', function rcFilesRpgAvatars(rpgId) {
		const rpg = Rpgs.findOne(rpgId);
		let ids = rpg.players.map(p => p.owner);
		ids.push(rpg.roleMaster);
		return RcFiles.find({
			'metadata.owner': {
				$in: ids
			},
			'metadata.type': 'avatar'
		});
	});

}

Meteor.methods({
	'rcfiles.share'(id, ownerId) {
		check(id, String);
		check(ownerId, String);

		const file = RcFiles.findOne(id);

		let sharedTo = file.metadata.sharedTo;
		if (! sharedTo) {
			sharedTo = [];
		}
		let found = false;
		sharedTo.some((u, i) => {
			if (u.owner === ownerId) {
				sharedTo.splice(i, 1);
				found = true;
				return true;
			}
		});
		if (! found) {
			// add it
			sharedTo.push({
				owner: ownerId,
				username: Meteor.users.findOne(ownerId)
			});
		}
		RcFiles.update(id, {
			$set: {
				'metadata.sharedTo': sharedTo
			}
		});
	}
})