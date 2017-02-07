import { Meteor } from 'meteor/meteor';
import { initDb } from '../imports/startup/init-db.js';
import { CollectionAPI } from 'meteor/xcv58:collection-api';
import { ModelSheets } from '../imports/api/model-sheets.js'; 

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

  // let meteor uses 'custom_users' collection as 'users' collection
  Accounts.users = new Mongo.Collection("rc_users", {
    _preventAutopublish: true
  });

  Meteor.users = Accounts.users;
});

if (Meteor.isServer) {
  Meteor.startup(function () {

    // All values listed below are default
    collectionApi = new CollectionAPI({
      authToken: undefined,              // Require this string to be passed in on each request
      apiPath: 'collectionapi',          // API path prefix
      standAlone: false,                 // Run as a stand-alone HTTP(S) server
      allowCORS: false,                  // Allow CORS (Cross-Origin Resource Sharing)
      sslEnabled: false,                 // Disable/Enable SSL (stand-alone only)
      listenPort: 3005,                  // Port to listen to (stand-alone only)
      listenHost: undefined,             // Host to bind to (stand-alone only)
      privateKeyFile: undefined,  // SSL private key file (only used if SSL is enabled)
      certificateFile: undefined, // SSL certificate key file (only used if SSL is enabled)
      timeOut: 120000
    });

    // Add the collection Users to the API "/players" path
    collectionApi.addCollection(Meteor.users, 'users', {
      // All values listed below are default
      authToken: undefined,                   // Require this string to be passed in on each request.
      authenticate: undefined, // function(token, method, requestMetadata) {return true/false}; More details can found in [Authenticate Function](#Authenticate-Function).
      methods: ['POST','GET','PUT','DELETE'],  // Allow creating, reading, updating, and deleting
      before: {  // This methods, if defined, will be called before the POST/GET/PUT/DELETE actions are performed on the collection.
                 // If the function returns false the action will be canceled, if you return true the action will take place.
        POST: function(obj, requestMetadata, returnObject) {
            // insert obj to your collection!
            returnObject.success = true;
            returnObject.statusCode = 201;
            returnObject.body = {
              method: 'POST',
              obj: obj
            };

            Accounts.createUser({
            	username: obj.username,
            	password: obj.plainPassword
            });
          return true;
        },    // function(obj, requestMetadata, returnObject) {return true/false;},
        GET: undefined,     // function(objs, requestMetadata, returnObject) {return true/false;},
        PUT: undefined,     // function(obj, newValues, requestMetadata, returnObject) {return true/false;},
        DELETE: undefined   // function(obj, requestMetadata, returnObject) {return true/false;}
      },
      after: {  // This methods, if defined, will be called after the POST/GET/PUT/DELETE actions are performed on the collection.
                // Generally, you don't need this, unless you have global variable to reflect data inside collection.
                // The function doesn't need return value.
        POST: undefined,    // function() {console.log("After POST");},
        GET: undefined,     // function() {console.log("After GET");},
        PUT: undefined,     // function() {console.log("After PUT");},
        DELETE: undefined   // function() {console.log("After DELETE");},
      }
    });

    // Add the collection Users to the API "/players" path
    collectionApi.addCollection(ModelSheets, 'modelsheets', {
      // All values listed below are default
      authToken: undefined,                   // Require this string to be passed in on each request.
      authenticate: undefined, // function(token, method, requestMetadata) {return true/false}; More details can found in [Authenticate Function](#Authenticate-Function).
      methods: ['POST','GET','PUT','DELETE'],  // Allow creating, reading, updating, and deleting
      before: {  // This methods, if defined, will be called before the POST/GET/PUT/DELETE actions are performed on the collection.
                 // If the function returns false the action will be canceled, if you return true the action will take place.
        POST: function(obj, requestMetadata, returnObject) {
          obj.createdAt = new Date();
          return true;
        },    // function(obj, requestMetadata, returnObject) {return true/false;},
        GET: undefined,     // function(objs, requestMetadata, returnObject) {return true/false;},
        PUT: function(obj, requestMetadata, returnObject) {
          console.log('PUT', obj.private);
          return true;
        },     // function(obj, newValues, requestMetadata, returnObject) {return true/false;},
        DELETE: undefined   // function(obj, requestMetadata, returnObject) {return true/false;}
      },
      after: {  // This methods, if defined, will be called after the POST/GET/PUT/DELETE actions are performed on the collection.
                // Generally, you don't need this, unless you have global variable to reflect data inside collection.
                // The function doesn't need return value.
        POST: undefined,    // function() {console.log("After POST");},
        GET: undefined,     // function() {console.log("After GET");},
        PUT: undefined,     // function() {console.log("After PUT");},
        DELETE: undefined   // function() {console.log("After DELETE");},
      }
    });

    // Starts the API server
    collectionApi.start();
  });
}