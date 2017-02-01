import { Meteor } from 'meteor/meteor';
import { initDb } from '../imports/startup/init-db.js';

// import api
import '../imports/api/model-sheets.js';
import '../imports/api/translations.js';
import '../imports/api/rpgs.js';
import '../imports/api/rc-files.js';
import '../imports/api/my-sheets.js';
import '../imports/api/chats.js';
import '../imports/api/drawings.js';
import '../imports/api/rolls.js';
import '../imports/api/positions.js';
import '../imports/api/pnjs.js';
import '../imports/api/posts.js';
import '../imports/api/notes.js';


Meteor.startup(() => {
  // code to run on server at startup
  initDb();

});