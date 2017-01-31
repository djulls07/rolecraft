import { Template } from 'meteor/templating';
import { ModelSheets } from '../../api/model-sheets';
import { ReactiveDict } from 'meteor/reactive-dict';

import './model-sheet-list.html';

Template.modelSheetList.onCreated(function onCreatedModelSheetList() {
  this.autorun(() => {
    Meteor.subscribe('modelsheets');
  });
  this.state = new ReactiveDict();
  this.state.set('editingModel', '');
  this.state.set('tab', 'mine');
});

Template.modelSheetList.onRendered(function () {
});

Template.modelSheetList.helpers({
  'sheets'() {
    if (Template.instance().state.get('tab') === 'mine') {
      return ModelSheets.find({owner: Meteor.userId()}, {sort: {createdAt: -1}});
    }
    return ModelSheets.find({owner: {$ne: Meteor.userId()}}, {sort: {createdAt: -1}});
  },
  'isOwner'() {
    return Meteor.userId() === this.owner;
  },
  'editingModel'() {
    const instance = Template.instance();
    return instance.state.get('editingModel') === this._id;
  },
  'checkedIfPrivate'() {
    return this.private ? 'checked' : '';
  },
  'checkedIfPublic'() {
    return ! this.private ? 'checked' : '';
  },
  'yesNoIfPrivate'() {
    return this.private ? 'No' : 'Yes';
  },
  'myModelSheetsLimit'() {
    return ModelSheets.find({owner: Meteor.userId()}).count() >= 50;
  },
  'isActiveTab'(tabName) {
    return tabName === Template.instance().state.get('tab') ? 'active' : '';
  }
});

Template.modelSheetList.events({
  'submit .new-model-sheet'(event) {
    event.preventDefault();
    const target = event.target;
    const name = target.name.value;
    const language = target.language.value;

    let file = event.target.import.files[0];

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {
        Meteor.call('modelsheets.insert', name, language, e.target.result);
      };
    })(file);

    if (! file) {
      Meteor.call('modelsheets.insert', name, language);
    } else {
      // Read the file.
      reader.readAsText(file);
    }
    
    target.name.value = '';
  },
  'click .remove-sheet'(event) {
    Meteor.call('modelsheets.remove', this._id);
  },
  'click .set-edit-model'(event, instance) {
    instance.state.set('editingModel', this._id);
  },
  'submit .form-model-sheet'(event, instance) {
    event.preventDefault();
    const target = event.target;
    const name = target.name.value;
    const language = target.language.value;
    const isPrivate = target.private.value === 'true' ? true : false;
    Meteor.call('modelsheets.update', this._id, name, language, isPrivate);
    instance.state.set('editingModel', '');
  },
  'click .model-export'() {
    const id = this._id;
    const data = JSON.stringify(this);
    const filename = 'export_' + this.name + '.json';
    let blob = new Blob([data], {type: 'text/json'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        let elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
  },
  'click .set-state-mine'(ev, instance) {
    instance.state.set('tab', 'mine');
  },
  'click .set-state-public'(ev, instance) {
    instance.state.set('tab', 'public');
  },
  'click .model-clone'(ev, instance) {
    Meteor.call('modelsheets.clone', this._id, (err, res) => {
      bootbox.alert(Blaze._globalHelpers.translate('copy-modelsheets-done'));
    });
  }
});
