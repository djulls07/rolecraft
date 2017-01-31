import './ui/home/home.js';
import './ui/footer/footer.js';
import './ui/header/header.js';
import './ui/model-sheets/model-sheet-list.js';
import './ui/model-sheets/model-sheet-form.js';
import './ui/model-sheets/model-sheet-preview.js';
import './ui/rpgs/rpg-list.js';
import './ui/rpgs/rpg-rm.js';
import './ui/rpgs/rpg-player.js';

/* CLIENT ROUTING */
FlowRouter.route('/', {
  name: 'home',
  action(params, queryParams) {
    BlazeLayout.render('simpleLayout', {
      main: 'home',
      header: 'header',
      footer: 'footer'
    });
  }
});

// groupe modelSheets
const modelSheets = FlowRouter.group({
  prefix: '/modelsheets'
});
// modelSheets route
modelSheets.route('/', {
  name: 'modelSheetList',
  action(params, queryParams) {
    BlazeLayout.render('simpleLayout', {
    	main: 'modelSheetList',
    	header: 'header',
    	footer: 'footer'
    });
  }
});
modelSheets.route('/:_id/form', {
  name: 'modelSheetEdit',
  action(params, queryParams) {
    BlazeLayout.render('simpleLayout', {
    	main: 'modelSheetForm',
    	header: 'header',
    	footer: 'footer'
    });
  }
});
modelSheets.route('/:_id/preview', {
  name: 'modelSheetPreview',
  action(params, queryParams) {
    BlazeLayout.render('simpleLayout', {
      main: 'modelSheetPreview',
      header: 'header',
      footer: 'footer'
    });
  }
});

const rpgs = FlowRouter.group({
  prefix: '/rpgs'
});

rpgs.route('/', {
  name: 'rpgList',
  action(params, queryParams) {
    BlazeLayout.render('simpleLayout', {
      main: 'rpgList',
      header: 'header',
      footer: 'footer'
    });
  }
});
rpgs.route('/:_id/rm', {
  name: 'rpgRm',
  action(params, queryParams) {
    BlazeLayout.render('simpleLayout', {
      main: 'rpgRm',
    });
  }
});
rpgs.route('/:_id/player', {
  name: 'rpgPlayer',
  action(params, queryParams) {
    BlazeLayout.render('simpleLayout', {
      main: 'rpgPlayer',
    });
  }
});