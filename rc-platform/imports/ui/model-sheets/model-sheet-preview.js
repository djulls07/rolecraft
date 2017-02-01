import { Template } from 'meteor/templating';
import { ModelSheets } from '../../api/model-sheets.js'; 
import './model-sheet-preview.html';

Template.modelSheetPreview.onCreated(function onCreatedModelSheetPreview() {
	const id = FlowRouter.getParam('_id');
	Meteor.subscribe('modelsheet', id);
});

Template.modelSheetPreview.helpers({
	sheet: function () {
		const id = FlowRouter.getParam('_id');
		return ModelSheets.findOne(id);
	},
	'tableCaseField'(cases, field, x, y) {
    	return (cases && cases[x] && cases[x][y] && cases[x][y][field]) ? cases[x][y][field] : '';
  	},
  	isOwner(sheet) {
  		return sheet && Meteor.userId() === sheet.owner;
  	}
});