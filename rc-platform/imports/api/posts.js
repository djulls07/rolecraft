import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Posts = new Mongo.Collection('posts');

const PostVote = new SimpleSchema({
	owner: {type: String},
	vote: {type: Boolean}
});

Posts.schema = new SimpleSchema({
	_id: {type: String, optional: true},
	owner: {type: String},
	username: {type: String},
	title: {type: String},
	content: {type: String},
	votes: {type: [PostVote], optional: true},
	createdAt: {type: Date}
});

if (Meteor.isServer) {
	Meteor.publish('posts', function positionsPublication(rpgId) {
		return Posts.find({});
	});
}

Meteor.methods({
	'posts.insert'(title, content) {
		check(title, String);
		check(content, String);

		if (!this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		const post = {
			owner: this.userId,
			username: Meteor.users.findOne(this.userId).username,
			title: title,
			content: content,
			createdAt: new Date()
		};
		
		Posts.schema.validate(post);
		Posts.insert(post);
	}
});