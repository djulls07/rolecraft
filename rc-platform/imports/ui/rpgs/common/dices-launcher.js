import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Drawings } from '../../../api/drawings.js';
import { Rolls } from '../../../api/rolls';
import './dices-launcher.html';

Template.dicesLauncher.onCreated(function onCreatedDicesLauncher() {
	this.state = new ReactiveDict();
	this.state.set('lastRoll', null);
});

Template.dicesLauncher.helpers({
	'lastRoll'() {
		return Template.instance().state.get('lastRoll');
	}
});

Template.dicesLauncher.events({
	'submit .new-roll'(event, instance) {
		event.preventDefault();
		const target = event.target;
		const value = target.entries.value;

		if (value.length < 3) {
			bootbox.alert(Blaze._globalHelpers.translate('roll-example'));
			return;
		}

		Meteor.call('rolls.rollDices', FlowRouter.getParam('_id'), value, (err, roll) => {
			instance.state.set('lastRoll', roll);
		});
		target.entries.value = '';
		
	},
	'click .click-submit'(ev) {
		$(ev.target).closest('.new-roll').submit();
	}
});