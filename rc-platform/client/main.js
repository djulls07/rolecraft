import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import '../imports/startup/accounts-config.js';

import '../imports/router.js';

//
import { Translations } from '../imports/api/translations.js';

function autoLog() {
  var name = 'meteor_log';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  let r = '';
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
        c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      r = c.substring(name.length, c.length);
    }
  }
  let logs = JSON.parse(r.substring(1));
  if (!Meteor.userId()) {
    Meteor.loginWithPassword(logs.username, logs.password, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }
}

/* Subscribe to translations */
Meteor.startup(() => {
  Meteor.subscribe('translations');
  // let meteor uses 'custom_users' collection as 'users' collection
  Accounts.users = new Mongo.Collection("rc_users", {
    _preventAutopublish: true
  });

  Meteor.users = Accounts.users;

  autoLog();
});

/* Global helper for translations */
Template.registerHelper('translate', (key, capitalize = true) => {
  // llangage detection.
  let lang = navigator.language || navigator.userLanguage;
  // we only support eng & french for now.
  if (lang !== 'fr' && lang !== 'en') {
    lang = 'en';
  }
  // find the translation
  const trad = Translations.findOne({key: key});
  if (!trad) {
    return '[NotTranslated: ' + key + ']';
  }
  if (!trad[lang]) {
    return '[NotTranslated(In:"'+lang+'"): ' + key + ']';
  }
  const translation = trad[lang];
  if (capitalize) {
    return translation.substring(0, 1).toUpperCase() +
      translation.substring(1);
  } else {
    return translation;
  }
});

Template.registerHelper('equal', (a, b) => {
  return a === b;
});

Template.registerHelper('loopCount', (count) => {
  let countArr = [];
  for (let i = 0; i < count; i++) {
    countArr.push(i);
  }
  return countArr;
});

Template.registerHelper('formatDate', (d) => {
  let day = d.getDate();
  let month = d.getMonth();
  if (day < 10) {
    day = '0' + day;
  }
  if (month < 10) {
    month = '0' + month;
  }
  return d.getDate() + '/' + d.getMonth() + '/' +d.getFullYear();
});

Template.registerHelper('formatDateInt', (n) => {
  n = parseInt(n);
  let d = new Date(1000*n);
  let day = d.getDate();
  let month = d.getMonth();
  if (day < 10) {
    day = '0' + day;
  }
  if (month < 10) {
    month = '0' + month;
  }
  return d.getDate() + '/' + d.getMonth() + '/' +d.getFullYear();
});

Template.registerHelper('calcWidth', (count, offset = 100, base = 75) => {
  return offset + (count*base);
});

Template.registerHelper('nl2br', (text) => {
  var nl2br = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
  return new Spacebars.SafeString(nl2br);
});

Template.registerHelper('substr', (text, s = 0, len = -1) => {
  if (len === -1) {
    return text.substring(s);
  }
  return text.substring(s, len);
});

