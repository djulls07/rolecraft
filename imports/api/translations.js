import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Translations = new Mongo.Collection('translations');

// publications
if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('translations', function translationsPublication() {
    return Translations.find({});
  });
}
