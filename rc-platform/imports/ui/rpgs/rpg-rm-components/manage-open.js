import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Rpgs } from '../../../api/rpgs.js';

import './manage-open.html';

Template.manageOpen.onRendered(function() {
	
});

Template.manageOpen.helpers({
	checked(rpg) {
		return (rpg && rpg.open) ? 'checked' : '';
	}
});

Template.manageOpen.events({
	'click .open-game'(event) {
		const id = FlowRouter.getParam('_id');
		Meteor.call('rpgs.rm.setOpen', id);
	}
});