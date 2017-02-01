import { Template } from 'meteor/templating';
import { Rolls } from '../../../api/rolls.js';

import './rm-rolls-history.html';

Template.rmRollsHistory.onCreated(function onCreatedRmRollsHistory() {

});

Template.rmRollsHistory.helpers({
	rolls(userId) {
		return Rolls.find({rpg: FlowRouter.getParam('_id'), owner: userId}, {sort: {date:-1}});
	}
});

Template.rmRollsHistory.events({
});