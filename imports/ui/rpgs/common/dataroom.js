import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { RcFiles } from '../../../api/rc-files.js';
import { Rpgs } from '../../../api/rpgs.js';
import './dataroom.html';

Template.rpgDataroom.onCreated(function onCreatedDataroom() {
	this.state = new ReactiveDict();
	this.state.set('tab', 'mine');
});

Template.rpgDataroom.helpers({
	'myFiles'() {
		return RcFiles.find({
			'metadata.owner': Meteor.userId(),
			'metadata.rpg': FlowRouter.getParam('_id')// on précise le rpg ( ce qui fait la dataroom et exclus les autres fichiers uniquemùent lié au user )
		});
	},
	'sharedFiles'() {
		return RcFiles.find({
			'metadata.rpg': FlowRouter.getParam('_id'), // on précise le rpg ( ce qui fait la dataroom et exclus les autres fichiers uniquemùent lié au user )
			'metadata.sharedTo.owner': Meteor.userId()
		});
	},
	'getUrl'(file) {
		if (file) {
			file.getFileRecord();
			return file.url();
		}
	},
	'isActive'(tabName) {
		return Template.instance().state.get('tab') === tabName ? 'active' : '';
	},
	isActivate(tabName) {
		return Template.instance().state.get('tab') === tabName;
	},
	'notCurrentUser'(id) {
		return id !== Meteor.userId();
	},
	checked(fileObj, userId) {
		return (fileObj.metadata && fileObj.metadata.sharedTo && fileObj.metadata.sharedTo.find(u => u.owner === userId)) ? 'checked' : '';
	},
	rpg() {
		return Rpgs.findOne(FlowRouter.getParam('_id'));
	}
});

Template.rpgDataroom.events({
	'submit .new-upload': function(event, instance) {
		event.preventDefault();

		let sharedTo = [];
		if (event.target.sharedBox) {
			if (event.target.sharedBox && event.target.sharedBox.length) {
				event.target.sharedBox.forEach(s => {
					if (s.checked) {
						sharedTo.push({
							owner: s.value,
							username: s.getAttribute('username')
						});
					}
				});
			} else {
				if (event.target.sharedBox.checked) {
					sharedTo.push({
						owner: event.target.sharedBox.value,
						username: event.target.sharedBox.getAttribute('username')
					});
				}
			}
		}

	   	var fsFile = new FS.File(event.target.dataroomFile.files[0]);
	   	const type = event.target.name;
		fsFile.metadata = {
			owner: Meteor.userId(),
			type: type,
			username: Meteor.user().username,
			rpg: FlowRouter.getParam('_id'),
			sharedTo: sharedTo,
			title: event.target.title.value
		};
		
		RcFiles.insert(fsFile, function (err, fileObj) {
		  if (err) throw err;
		  bootbox.alert(Blaze._globalHelpers.translate('upload-success'));
		  event.target.title.value = '';
		});
  },
  'click .set-tab-mine'(ev, instance) {
  	instance.state.set('tab', 'mine');
  },
  'click .set-tab-shared'(ev, instance) {
  	instance.state.set('tab', 'shared');
  },
  'click .set-shared'(ev, instance) {
  	const userId = ev.target.value;
  	const id = ev.target.getAttribute('fileId');
  	Meteor.call('rcfiles.share', id, userId);
  },
  'click .remove-file'(ev) {
  	const id = ev.target.getAttribute('fileId');
  	RcFiles.remove(id);
  }
});