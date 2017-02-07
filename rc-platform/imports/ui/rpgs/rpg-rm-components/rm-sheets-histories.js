import { Template } from 'meteor/templating';
import { Sheets } from '../../../api/my-sheets.js';
import { Rpgs } from '../../../api/rpgs.js';
import { ReactiveVar } from 'meteor/reactive-var';

import './rm-sheets-histories.html';

Template.rmSheetsHistories.onCreated(function onCreatedRmSheetsHistories() {
	this.selectedPlayer = new ReactiveVar('');
	this.sheet = new ReactiveVar({});
	this.showBody = new ReactiveVar(true);
});

Template.rmSheetsHistories.helpers({
	'selectedPlayer'() {
		return this.owner === Template.instance().selectedPlayer.get();
	},
	'selectedPlayerSheet'() {
		return Sheets.findOne({rpg: FlowRouter.getParam('_id'), owner: Template.instance().selectedPlayer.get()});
	},
	'hasSelectedPlayerAndHasHistory'() {
		const instance = Template.instance();
		return instance.selectedPlayer.get() && instance.selectedPlayer.get().length && instance.sheet.get().history && instance.sheet.get().history.length;
	},
	'transformRaw'(raw) {
		if (!raw) return '';
		let aux = raw.split('.');
		const sheet = Template.instance().sheet.get();
		if (!sheet || ! sheet._id) {
			return;
		}
		if (!sheet) return '';
		let ret = sheet;
		let label = '';
		label += sheet[aux[0]][aux[1]][aux[2]][aux[3]].label || sheet[aux[0]][aux[1]].label || '';
		label += ' ';
		if (aux[4] === 'table') {
			// on a des coords
			const cases = sheet[aux[0]][aux[1]][aux[2]][aux[3]][aux[4]][aux[5]];
			const caseY = (cases[0] && cases[0][aux[7]] && cases[0][aux[7]].label) ? cases[0][aux[7]] : {label: '--'};
			const caseX = (cases[aux[6]] && cases[aux[6]][0] && cases[aux[6]][0].label) ? cases[aux[6]][0] : {label: '--'};
			if (caseY && caseX) {
				label += '['+caseX.label+', '+caseY.label+'] ';
			}
		}
		aux.forEach(k => {
			if (! ret[k]) {
				ret = '';
				return;
			}
			ret = ret[k];
		});
		return [label, ret];
	},
	'formatDate'(d) {
	    return d.getHours() + ':' + d.getMinutes();
	},
	'showBody'() {
		return Template.instance().showBody.get();
	}
});

Template.rmSheetsHistories.events({
	'click .set-tab-player'(event, instance) {
		// ici on stock sheet dans une Var et on y access dans transform raw,
		// autorun pour avoir sheet tjr à jour ( évite de faire Sheets.findOne dans toutes les methods qui need it )
		instance.autorun(() => {
			const sheet = Sheets.findOne({owner: this.owner, rpg: FlowRouter.getParam('_id')});
			instance.sheet.set(sheet);
			instance.selectedPlayer.set(this.owner);
		});
	},
	'click .cancel-history'(ev, instance) {
		ev.preventDefault();
		// this is one entry of sheet.history ( send it to server )
		const sheet = instance.sheet.get();
		Meteor.call('sheets.cancelHistory', sheet._id, this.id);
	},
	'click .click-deploy'(ev, inst) {
		inst.showBody.set(! inst.showBody.get());
	}
});