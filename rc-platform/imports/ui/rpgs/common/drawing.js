import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Drawings } from '../../../api/drawings.js';
import { Rpgs } from '../../../api/rpgs';
import './drawing.html';


Template.rpgDrawing.onCreated(function onCreatedRpgDrawing() {
	this.state = new ReactiveDict();
	this.state.set('tab', 'new-drawing');

	this.canvasState = new ReactiveDict();
	this.canvasState.set('drawing', true); // for both canvas

	this.state.set('publicDrawings', []);
	// init list
	Meteor.call('drawings.publicImgs', (err, res) => {
		this.state.set('publicDrawings', res);
	});

	const self = this;

	// load new canvas
	this.loadCanvas = function () {

		const parentHeight = $('#canvasContainer').height();
		const parentWidth = $('#canvasContainer').width();

		self.canvasHisto = [];
		self.canvas = new fabric.Canvas('canvas', {
		  backgroundColor: 'rgb(250,250,250)',
		  //selectionColor: 'blue',
		  //selectionLineWidth: 2,
		  isDrawingMode: self.canvasState.get('drawing'),
		  width: parentWidth,
		  height: parentHeight
		});	
		// events
		self.canvas.on('mouse:down', function() {
			self.canvasHisto.push(JSON.stringify(self.canvas));
		});

		// event delete
		$(document).on('keyup', function(e) {
			if (e.keyCode === 46) {
				if (self.state.get('tab') === 'new-drawing' && self.canvas) {
					self.canvas.getActiveObject().remove();
				} else {
					if (self.canvasOpened) {
						self.canvasOpened.getActiveObject().remove();
					}
				}
			}
		});
	}

	// load a canvas with existing  db stored drawing
	this.loadOpenedCanvas = function (data, writeRights) {
		const parentHeight = $('#canvasOpenedContainer').height();
		const parentWidth = $('#canvasOpenedContainer').width();

		self.canvasOpenedHisto = [];
		if (!self.canvasOpened) {
			self.canvasOpened = new fabric.Canvas('canvasOpened', {
			  backgroundColor: 'rgb(250,250,250)',
			  //selectionColor: 'blue',
			  //selectionLineWidth: 2,
			  isDrawingMode: self.canvasState.get('drawing'),
			  width: parentWidth,
			  height: parentHeight
			});
			// events
			self.canvasOpened.on('mouse:down', function() {
				self.canvasOpenedHisto.push(JSON.stringify(self.canvasOpened));
			});
		}
		
		self.canvasOpened.loadFromJSON(data, function() {
			self.canvasOpened.renderAll();
		});

	}

});

Template.rpgDrawing.onRendered(function onRenderedRpgDrawing() {

	Template.instance().loadCanvas();
	//canvas.loadFromJSON('{"objects":[],"background":"rgba(0, 0, 0, 0)"}');
});



Template.rpgDrawing.helpers({
	'isActive'(tab) {
		return Template.instance().state.get('tab') === tab ? 'active' : '';
	},
	'notTab'(tab) {
		return Template.instance().state.get('tab') !== tab;
	},
	'myDrawings'() {
		return Drawings.find({owner: Meteor.userId()}, {sort: {createdAt: -1}});
	},
	sharedDrawings() {
		return Drawings.find({
			'sharedTo.owner': Meteor.userId()
		}, {sort: {createdAt: -1}});
	},
	notCurrentUser(userId) {
		return Meteor.userId() !== userId;
	},
	isSharedToChecked(drawing, userId,) {
		return (drawing && !! drawing.sharedTo.find(ud => ud.owner === userId)) ? 'checked' : '';
	},
	rpg() {
		return Rpgs.findOne(FlowRouter.getParam('_id'));
	},
	'openedDrawing'() {
		const d = Template.instance().state.get('openedDrawing');
		return d;
	},
	canvasState(state) {
		return Template.instance().canvasState.get(state);
	},
	'publicDrawings'() {
		return Template.instance().state.get('publicDrawings');
	}
});

Template.rpgDrawing.events({
	'click .set-tab-new'() {
		Template.instance().state.set('tab', 'new-drawing');
	},
	'click .set-tab-mine'() {
		Template.instance().state.set('tab', 'my-drawings');
	},
	'click .set-tab-shared'() {
		Template.instance().state.set('tab', 'shared-drawings');
	},
	'click .set-tab-opened'() {
		Template.instance().state.set('tab', 'opened-drawing');
	},
	'submit .save-drawing'(ev, instance) {
		ev.preventDefault();
		if (Drawings.find({rpg: FlowRouter.getParam('_id'), owner: Meteor.userId()}).count() >= 10) {
			bootbox.alert(Blaze._globalHelpers.translate('drawings-limit-info'));
			return;
		}
		const title = ev.target.title.value;
		let sharedIds = [];
		if(ev.target.test) {
			if (ev.target.test.length) {
				ev.target.test.forEach(function(t) {
					if (t.checked) {
						sharedIds.push(t.value);
					}
				});
			} else {
				if (ev.target.test.checked) {
					sharedIds.push(ev.target.test.value);
				}
			}
		}
		const data = JSON.stringify(instance.canvas);
		if (data.length < 100) {
			bootbox.alert(Blaze._globalHelpers.translate('drawings-data-info'));
			return;
		}
		Meteor.call('drawings.insert', FlowRouter.getParam('_id'), title, data, sharedIds, () => {
			bootbox.alert(Blaze._globalHelpers.translate('drawings-saved-info'));
			instance.canvasOpenedHisto = [];
		});
		instance.canvas.loadFromJSON('{"objects":[],"background":"rgb(250,250,250)"}');
		ev.target.title.value = '';
	},
	'click .reset-drawing'(ev, instance) {
		instance.canvas.loadFromJSON('{"objects":[],"background":"rgb(250,250,250)"}');
	},
	'click .remove-drawing'(ev) {
		const id = ev.target.getAttribute('drawingId');
		Meteor.call('drawings.remove', id);
	},
	'click .shared-to'(ev, inst) {
		const drawingIdUserId = ev.target.value.split("::");
		Meteor.call('drawings.setShared', drawingIdUserId[0], drawingIdUserId[1]);
	},
	'click .undo-drawing'(ev, instance) {
		
		const last = instance.canvasHisto.pop();
		
		instance.canvas.loadFromJSON(last, function() {
			instance.canvas.renderAll();
		});
		
	},
	'click .open-drawing'(ev, instance) {
		ev.preventDefault();
		const id = ev.target.getAttribute('drawingId');
		Meteor.call('drawings.getWithData', id, (err, res) => {
			if (err) {
				//console.log(err);
			} else {
				let writeRights = false;

				if (res.owner === Meteor.userId()) {
					writeRights = true;
				} else {
					if (res.sharedTo.find(u => u.owner === Meteor.userId())) {
						writeRights = true;
					}
				}
				instance.state.set('openedDrawing', res);
				instance.loadOpenedCanvas(res.data, writeRights);
				instance.state.set('tab', 'opened-drawing');
			}
		});
	},
	'click .reset-opened-drawing'(ev, instance) {
		instance.canvasOpened.loadFromJSON('{"objects":[],"background":"rgb(250,250,250)"}');
	},
	'click .undo-opened-drawing'(ev, instance) {
		
		const last = instance.canvasOpenedHisto.pop();
		
		instance.canvasOpened.loadFromJSON(last, function() {
			instance.canvasOpened.renderAll();
		});
		
	},
	'submit .save-open-drawing'(ev, instance) {
		ev.preventDefault();

		const title = ev.target.title.value;
		const id = instance.state.get('openedDrawing')._id;
		let sharedIds = [];
		if (ev.target.test.length) {
			ev.target.test.forEach(function(t) {
				if (t.checked) {
					sharedIds.push(t.value);
				}
			});
		} else {
			if (ev.target.test.checked) {
				sharedIds.push(ev.target.test.value);
			}
		}
		const data = JSON.stringify(instance.canvasOpened);
		if (data.length < 100) {
			bootbox.alert(Blaze._globalHelpers.translate('drawings-data-info'));
			return;
		}
		Meteor.call('drawings.update', id, title, data, sharedIds, (err, res) => {
			if (err) {
				bootbox.alert(Blaze._globalHelpers.translate('not-authorized'));
			} else {
				bootbox.alert(Blaze._globalHelpers.translate('drawings-saved-info'));
			}
		});
		//instance.canvasOpened.loadFromJSON('{"objects":[],"background":"rgb(250,250,250)"}');
	},
	'click .set-is-drawing'(ev, inst) {
		inst.canvasState.set('drawing', true);
		const drawing = inst.canvasState.get('drawing');
		if (inst.canvas) {
			inst.canvas.isDrawingMode = drawing;
		} 
		if (inst.canvasOpened) {
			inst.canvasOpened.isDrawingMode = drawing;
		}
	},
	'click .unset-is-drawing'(ev, inst) {
		inst.canvasState.set('drawing', false);
		const drawing = inst.canvasState.get('drawing');
		if (inst.canvas && inst.state.get('tab') === 'new-drawing') {
			inst.canvas.isDrawingMode = drawing;
		} 
		if (inst.canvasOpened && inst.state.get('tab') !== 'new-drawing') {
			inst.canvasOpened.isDrawingMode = drawing;
		}
	},
	'change .canvas-add-text'(ev, inst) {
		inst.canvasState.set('drawing', false);
		const text = new fabric.Text(ev.target.value, { left: 10, top: 10 });
		if (inst.canvas && inst.state.get('tab') === 'new-drawing') {
			inst.canvas.isDrawingMode = false;
			inst.canvas.add(text);
		} 
		if (inst.canvasOpened && inst.state.get('tab') !== 'new-drawing') {
			inst.canvasOpened.isDrawingMode = false;
			inst.canvasOpened.add(text);
		}
		ev.target.value = '';
	},
	'click .canvas-add-img'(ev, inst) {
		bootbox.confirm('<img class="img-responsive" src="'+ev.target.src+'">', function(res) {
			if (res) {
				const imgElement = ev.target;
				const imgInstance = new fabric.Image(imgElement, {
				  left: 10,
				  top: 10,
				  angle: 0,
				  opacity: 1
				});
				if (inst.canvas && inst.state.get('tab') === 'new-drawing') {
					inst.canvas.isDrawingMode = false;
					inst.canvas.add(imgInstance);
				} 
				if (inst.canvasOpened && inst.state.get('tab') !== 'new-drawing') {
					inst.canvasOpened.isDrawingMode = false;
					inst.canvasOpened.add(imgInstance);
				}
			}
		});
			
	}
});