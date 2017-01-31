import { Translations } from '../api/translations.js';
const fs = Npm.require("fs");

export function initDb() {
  initTranslations();
}

function initTranslations() {
  import { translations } from '../api/db-init/translations.js';
  translations.forEach(entry => {
    let res = Translations.findOne({key: entry.key});
    if (res) {
      Translations.update(res._id, {
        $set: {
          fr: entry.fr,
          en: entry.en
        }
      });
    } else {
      Translations.insert(entry);
    }
  });
}
