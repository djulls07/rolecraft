import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const ModelSheets = new Mongo.Collection('modelsheets');

/* Simple schemas */
// element.table.case
// element.table.case

// element.table
export const TableElementSchema = new SimpleSchema({
  rows: {type: Number},
  cols: {type: Number},
  cases: {type: {Object}}
});

// element
export const ElementSchema = new SimpleSchema({
  label: {type: String},
  table: {type: TableElementSchema, optional: true},
  id: {type: String},
  type: {type: String}
});

export const SectionSchema = new SimpleSchema({
  id: {type: String},
  name: {type: String},
  elements: {type: [ElementSchema], optional: true},
  size: {type: Number, optional: true},
  isSeparator: {type: Boolean, optional: true}
});

// model sheet schema
ModelSheets.schema = new SimpleSchema({
  _id: {type: String, optional: true},
  name: {type: String, max: 40, min: 1},
  createdAt: {type: Date},
  owner: {type: String},
  username: {type: String},
  private: {type: Boolean},
  sections: {type: [SectionSchema], optional: true},
  language: {type: String}
});

// publications
if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('modelsheets', function ModelSheetsPublication() {
    return ModelSheets.find({
    	$or: [
    		{owner: this.userId},
        {private: false}
    	]
    });
  });

  Meteor.publish('modelsheet', function ModelSheetPublication(id) {
    return ModelSheets.find({
      _id: id,
      $or: [
    		{owner: this.userId},
        {private: false}
    	]
    });
  });

  Meteor.publish('modelsheets.search', function ModelSheetPublication(search) {
    return ModelSheets.find({
      name: new RegExp(search, 'i'),
      $or: [
        {owner: this.userId},
        {private: false}
      ]
    });
  });
}

Meteor.methods({
  'modelsheets.insert'(name, language, jsonStr = '') {
    check(name, String);
    check(language, String);
    check(jsonStr, String);

    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const n = ModelSheets.find({owner: this.userId}).count();
    if (n >= 50) {
      throw new Meteor.Error('not-authorized');
    }

    let sections = [];
    if (jsonStr.length) {
      try {
        sections = JSON.parse(jsonStr).sections;
      } catch(e) {
        console.log(e);
        sections = [];
      }
    }

    let model = {
      name: name,
      createdAt: new Date(),
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
      private: true,
      sections: [],
      language: language
    };

    ModelSheets.schema.validate(model);
    model.sections = sections;
    ModelSheets.insert(model);
  },
  'modelsheets.update'(modelSheetId, name, language, isPrivate) {
    check(modelSheetId, String);
    check(name, String);


    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const model = ModelSheets.findOne(modelSheetId);
    if (!model) {
      throw new Meteor.Error('not-found');
    }
    if (model.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (!language) {
      language = model.language;
      isPrivate = model.private;
    }
    ModelSheets.update(modelSheetId, {
      $set: {
        name: name,
        private: isPrivate,
        language: language
      }
    });
  },
  'modelsheets.remove'(modelSheetId) {
    check(modelSheetId, String);
    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const model = ModelSheets.findOne(modelSheetId);
    if (!model) {
      throw new Meteor.Error('not-found');
    }
    if (model.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    ModelSheets.remove(modelSheetId);
  },
  'modelsheets.removeSection'(modelSheetId, sectionId) {
    check(modelSheetId, String);
    check(sectionId, String);

    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const model = ModelSheets.findOne(modelSheetId);
    if (!model) {
      throw new Meteor.Error('not-found');
    }
    if (model.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    model.sections.forEach((s,i) => {
      if (s.id === sectionId) {
        model.sections.splice(i, 1);
      }
    });
    ModelSheets.update(modelSheetId, {
      $set: {
        sections: model.sections
      }
    });
  },
  'modelsheets.updateSection'(modelSheetId, sectionId, name, size) {
    check(modelSheetId, String);
    check(sectionId, String);
    check(name, String);
    check(size, Number);

    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const model = ModelSheets.findOne(modelSheetId);
    if (!model) {
      throw new Meteor.Error('not-found');
    }
    if (model.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    let set = {};
    model.sections.some((s,i) => {
      if (s.id === sectionId) {
        set['sections.'+i+'.name'] = name;
        set['sections.'+i+'.size'] = size;
        return true;
      }
    });
    // update
    ModelSheets.update(modelSheetId, {
      $set: set
    });
  },
  'modelsheets.addElement'(modelSheetId, elementType, sectionId, sectionSize = -1) {
    check(modelSheetId, String);
    check(elementType, String);
    check(sectionId, String);
    check(sectionSize, Number);

    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const model = ModelSheets.findOne(modelSheetId);
    if (!model) {
      throw new Meteor.Error('not-found');
    }
    if (model.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const element = {
      id: Random.id(),
      type: elementType,
      label: ''
    };

    if (sectionId === 'new') {
      ModelSheets.update(modelSheetId, {
        $push: {
          sections: {
            id: Random.id(),
            name: '',
            size: sectionSize,
            elements: [element]
          }
        }
      });
    } else {

      let sheet = ModelSheets.findOne(modelSheetId);
      let set = {};
      sheet.sections.forEach((s,i) => {
        if (s.id === sectionId) {
          s.elements.push(element);
          set['sections.'+i] = s;
        }
      });
      ModelSheets.update(modelSheetId, {
        $set: set
      });
    }
  },
  'modelsheets.removeElement'(id, elementId) {
    check(id, String);
    check(elementId, String);

    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const model = ModelSheets.findOne(id);
    if (!model) {
      throw new Meteor.Error('not-found');
    }
    if (model.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    let set = {};
    model.sections.some((s, i) => {
      return s.elements.some((e, j) => {
        if (e.id === elementId) {
          let section = s;
          section.elements.splice(j, 1);
          set['sections.'+i+'.elements'] = section.elements;
          return true;
        }
      });
    });
    ModelSheets.update(id, {
      $set: set
    });
  },
  'modelsheets.updateElementField'(id, elementId, fieldName, fieldVal) {
    check(id, String);
    check(elementId, String);
    check(fieldName, String);

    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const model = ModelSheets.findOne(id);
    if (!model) {
      throw new Meteor.Error('not-found');
    }
    if (model.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    let set = {};
    // exception for the 3 numbers ( client does not care about it )
    if (fieldName === 'size' || fieldName === 'table.rows' || fieldName === 'table.cols') {
      fieldVal = parseInt(fieldVal);
    }
    model.sections.some((s, i) => {
      return s.elements.some((e, j) => {
        if (e.id === elementId) {
          set['sections.'+i+'.elements.'+j+'.'+fieldName] = fieldVal;
          return true;
        }
      });
    });
    ModelSheets.update(id, {
      $set: set
    });
  },
  'modelsheets.changeSectionsPosition'(id, order) {
    check(id, String);
    check(order, Array);

    const model = ModelSheets.findOne(id);
    if (!model || !this.userId || this.userId !== model.owner) {
      throw new Meteor.Error('not-authorized');
    }

    const sections = model.sections;
    let newSections = [];

    order.forEach(sectionId => {
      newSections.push(sections.find(s => s.id === sectionId));
    });
    
    ModelSheets.update(id, {
      $set: {
        sections: newSections
      }
    });
  },
  'modelsheets.cloneSection'(id, sectionId) {
    check(id, String);
    check(sectionId, String);

    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const model = ModelSheets.findOne(id);
    let section = model.sections.find(s => s.id === sectionId);

    // on change les ids des éléments et de la section
    section.id = Random.id();
    section.elements.forEach(e => {
      e.id = Random.id();
    });
    ModelSheets.update(id, {
      $push: {
        sections: section
      }
    });
  },
  'modelsheets.clone'(id) {
    check(id, String);
    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const model = ModelSheets.findOne(id);
    let sections = model.sections;
    sections.forEach(section => {
      section.id = Random.id();
      section.elements.forEach(e => {
        e.id = Random.id();
      });
    });
    const newModel = {
      sections: sections,
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
      name: 'COPY - ' + model.name,
      private: true,
      language: model.language,
      createdAt: new Date()
    };
    ModelSheets.insert(newModel);
  }
});