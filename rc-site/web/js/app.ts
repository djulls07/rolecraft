var $ = jQuery;

/**
 * Submit on change capture all inputs, textareas, selects with attr submit-on-change
 * and submit the form if change event change is trigger on captured elements
 */
class SubmitOnChange {
		
	constructor() {
	}

	/**
	 * Run the submit on change
	 */
	run() {
		$('[submit-on-change]')
		.change(function(ev) {
			let idForm = $(this).attr('submit-on-change');
			$('#' + idForm).submit();
		});
	}
}

/**
 * Main app classe
 */
class App {

	constructor (private classesArray)
	{
		this.run();
	}

	/**
	 * Run the app by running all run methods of all objects passed in constructor args
	 */
	run() {
		this.classesArray.forEach(c => c.run());
	}
}

/**
 * RUN JS APP
 */
let app = new App([
	new SubmitOnChange()
]);