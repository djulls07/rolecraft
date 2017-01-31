import { Template } from 'meteor/templating';
import { ModelSheets } from '../../api/model-sheets.js';
import { ReactiveDict } from 'meteor/reactive-dict';

import './model-sheet-form.html';

Template.modelSheetForm.onCreated(function onCreatedModelSheetForm() {
  const id = FlowRouter.getParam('_id');
  this.state = new ReactiveDict();
  this.state.set('modelSheetId', id);
  this.state.set('editSectionName', '');
  this.state.set('organize', false);

  this.sub = Meteor.subscribe('modelsheet', id);
});

Template.modelSheetForm.onRendered(function() {
  this.activeOrganize = function () {
    this.state.set('sheet', ModelSheets.findOne(FlowRouter.getParam('_id')));
    this.state.set('organize', true);
    //this.sub.stop();
    const sortablesSections = $('#mySortablesSections');
    const id = FlowRouter.getParam('_id');
    const instance = this;

    sortablesSections.sortable({
      disabled: false,
      items: '> div',
      containment: 'parent',
      //tolerance: "pointer",
      start: function(event, ui) {
      },
      stop: function(ev, ui) {
        const order = $(this).sortable('toArray');
        Meteor.call('modelsheets.changeSectionsPosition', id, order);
      }
    });
  }

  this.unactiveOrganize = function () {
    const id = FlowRouter.getParam('_id');
    this.state.set('organize', false);
    const sortablesSections = $('#mySortablesSections');
    sortablesSections.sortable({disabled: true});
    //this.sub = Meteor.subscribe('modelsheet', id);
    
  }
});

Template.modelSheetForm.helpers({
  'sheet'() {
    if (Template.instance().state.get('organize')) {
      return Template.instance().state.get('sheet');
    } else {
      return ModelSheets.findOne(FlowRouter.getParam('_id'));
    }
  },
  'elements'() {
    return [
      {name: 'text-field', type:'text'},
      {name: 'textarea-field', type: 'textarea'},
      {name: 'table-field', type: 'table'}
    ];
  },
  'editSectionName'(sectionId) {
    const instance = Template.instance();
    return (instance.state.get('editSectionName') === sectionId);
  },
  'selected'(a, b) {
    return a === b ? 'selected' : '';
  },
  'tableCaseField'(cases, field, x, y) {
    return (cases && cases[x] && cases[x][y] && cases[x][y][field]) ? cases[x][y][field] : '';
  },
  'isOrganize'() {
    return Template.instance().state.get('organize');
  }
});

Template.modelSheetForm.events({
  'submit .form-section-element'(event, instance) {
    event.preventDefault();
    const target = event.target;
    const element = target.element.value;
    let section = target.section.value;
    let size = 12;
    if (section.substring(0, 3) === 'new') {

      if (section.length > 3) {
        size = parseInt(section.substring(3));
      }
      section = section.substring(0, 3);
    }
    Meteor.call('modelsheets.addElement',
      instance.state.get('modelSheetId'),
      element,
      section,
      size
    );
  },
  'click .add-element'(event, instance) {
    event.preventDefault();
    const modelSheetId = instance.state.get('modelSheetId');
    Meteor.call('modelsheets.addElement',
      modelSheetId,
      'text', // by default
      this.id
    );
  },
  'click .remove-section'(event, instance) {
    const modelSheetId = instance.state.get('modelSheetId');
    Meteor.call('modelsheets.removeSection', modelSheetId, this.id, () => {
    });
  },
  'submit .edit-section'(event, instance) {
    event.preventDefault();
    const modelSheetId = instance.state.get('modelSheetId');
    const target = event.target;
    const name = target.section_name.value;
    const size = parseInt(target.section_size.value); // unchanged for now

    Meteor.call('modelsheets.updateSection',
      modelSheetId,
      this.id,
      name,
      size,
      () => {
      }
  );

    instance.state.set('editSectionName', '');
  },
  'click .editSectionName'(event, instance) {
    event.preventDefault();
    instance.state.set('editSectionName', this.id);
  },
  'click .remove-element'(event, instance) {
    event.preventDefault();
    const modelSheetId = instance.state.get('modelSheetId');
    Meteor.call('modelsheets.removeElement', modelSheetId, this.id);
  },
  'change .element-input'(event, instance) {
    event.preventDefault();
    const modelSheetId = instance.state.get('modelSheetId');
    const target = event.target;
    const fieldName = target.name;
    const fieldVal = target.value;
    Meteor.call('modelsheets.updateElementField',
      modelSheetId,
      this.id,
      fieldName,
      fieldVal
    )
  },
  'change .model-name-input'(ev) {
    Meteor.call('modelsheets.update', FlowRouter.getParam('_id'), ev.target.value);
  },
  'click .set-organize'(ev, instance) {
    const org = ! instance.state.get('organize');
    instance.state.set('organize', org);
    if (org) {
      instance.activeOrganize();
    } else {
      instance.unactiveOrganize();
    }
  },
  'click .clone-section'(ev, instance) {
    Meteor.call('modelsheets.cloneSection', FlowRouter.getParam('_id'), this.id);
  }
});
