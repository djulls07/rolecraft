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
    new SubmitOnChange()
]);
