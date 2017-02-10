var $ = jQuery;
/**
 * Submit on change capture all inputs, textareas, selects with attr submit-on-change
 * and submit the form if change event change is trigger on captured elements
 */
var SubmitOnChange = (function () {
    function SubmitOnChange() {
    }
    /**
     * Run the submit on change
     */
    SubmitOnChange.prototype.run = function () {
        $('[submit-on-change]')
            .change(function (ev) {
            var idForm = $(this).attr('submit-on-change');
            $('#' + idForm).submit();
        });
    };
    return SubmitOnChange;
})();
/**
 * Manage the forms to make ajax call
 * in order to update one input
 * on the model using url-update attribute
 */
var UpdateFieldForm = (function () {
    function UpdateFieldForm() {
        this.inputs = $('[update-url]');
    }
    UpdateFieldForm.prototype.run = function () {
        this.inputs.change(function (ev) {
            var url = $(this).attr('update-url');
            var name = $(this).attr('update-name');
            var value = $(this).val();
            var body = {};
            body[name] = value;
            $.post(url, body);
        });
    };
    return UpdateFieldForm;
})();
/**
 * Main app classe
 */
var App = (function () {
    function App(classesArray) {
        this.classesArray = classesArray;
        this.run();
    }
    /**
     * Run the app by running all run methods of all objects passed in constructor args
     */
    App.prototype.run = function () {
        this.classesArray.forEach(function (c) { return c.run(); });
    };
    return App;
})();
/**
 * RUN JS APP
 */
var app = new App([
    new SubmitOnChange(),
    new UpdateFieldForm()
]);
