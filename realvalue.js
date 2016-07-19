/**
 * @author Giovani Contino @ Micene09 - https://github.com/Micene09
 * @version v1.0.0
 */

(function(factory) {
	if (typeof define === 'function' && define.amd)
		define(['jquery'], factory);
	else factory(window.jQuery);
})(function($) {

	/**
	 * RealValue Singleton.
	 * @memberof	RealValue
	 * @namespace	RealValue
	 * @type		{object}	RealValue		Singleton
	 * @property	{object}	RealValue.defs	Object containing standard and custom definitions
	 */
	var R = {
		defs: {}
	};

	// Extending prototype

	/**
	 * Check if current call of jQuery.fn.rval is a GET or a SET.
	 * @memberof RealValue
	 * @return {boolean}
	 */
	R.isGet = function() {
		return arguments.length === 0;
	};

	/**
	 * Will return a message error in console, returing false for internal use.
	 * @memberof RealValue
	 * @param  {string} message
	 * @return {boolean}
	 */
	R.error = function(message) {
		if (message) console.error(message);
		return false;
	};

	/**
	 * Get the field definition from a jQuery selector.
	 * @memberof RealValue
	 * @param  {jQuery Selector} elem
	 * @return {object}
	 */
	R.field = function(elem) {
		var r = elem.attr("rfield");
		return r && R.defs ? R.defs[r] : null;
	};

	/**
	 * Set a new definition field, returning a boolean about the result of this operation.
	 * We have 2 options here:
	 * 1 - Call it with just 2 arguments:
	 * 		arguments[0] =>  Key of this definition, to be used as a value of [rfield] attribute.
	 * 		arguments[1] =>  Object with the details of this definition (GET/SET function etc...)
	 * 2 - Call it with just 1 argument only, having:
	 * 		key		=> Key of the definition
	 * 		value	=> Object with the details of this definition
	 * @memberof RealValue
	 * @param  {string} name	The definition key in option 1, or the object for option 2
	 * @param  {object} opts	The object for definition in option 1, or undefined for option 2
	 * @return {[type]}
	 */
	R.add = function(name, opts) {

		// Will add the definition, defining the handlers
		var addFunc = function(opts) {

			R.defs[name] = opts;

			if (opts.on) {
				var doc = $("html");

				// Registering an handler of every event, defined via de key
				// in the opts.on object, having:
				// key		event (ex: click)
				// value		function
				$.each(opts.on, function(eventKey, func) {
					doc.on(eventKey, "[rfield='" + name + "']", func);
				});
			}
		};

		// Option 1:
		if (arguments.length == 2) {

			if (R.defs[name]) return this.error("The field definition for the key '" + name + "' already exists.");
			else if (!opts || !opts.get || !opts.set) return this.error("A field definition needs a set and a get function to be ok. ");

			addFunc(opts);

			return true;

		}
		// Option 2
		else if (arguments.length == 1) {

			// Just security check
			if (!$.isPlainObject(name)) return this.error("Bad function call.");

			var error = false;

			// Cycling the plainobject
			$.each(name, function(defname, defobj) {

				if (R.defs[defname]) error = "The field definition key '" + defname + "' already exists.";
				else if (!defobj.get || !defobj.set) error = "The field definition with '" + defname + "' key , needs a set and a get function to be ok. ";

				if (error) return false;

				addFunc(opts);
			});

			if (error) return this.console.error(error);
			else return true;

		} else return this.error("Bad function call.");
	};

	/**
	 * Standard process of SET/GET in a field with the [rfield] attribute or standard HTML elements.
	 * This will give the opportunity to every definition, to SET or GET in any situation.
	 * @memberof RealValue
	 * @param  {mixed} value
	 * @return {mixed}
	 */
	$.fn.autoVal = function(value) {

		var u,
			elem = this,
			tg = elem.prop("tagName"),
			htmls = ["TD", "TH", "SPAN", "DIV", "A"];

		// Check for HTML elements, then innerHTML
		if ($.inArray(tg, htmls) > -1) {
			if (value !== u) elem[0].innerHTML = value;
			else return elem[0].innerHTML;
		}
		// ...or just use jQuery.val or jQuery.prop
		else {
			var canUseVal = $.inArray(tg, ["INPUT", "SELECT"]) > -1,
				isCheckBox = elem.attr("type") == 'checkbox';

			if (isCheckBox) {
				if (value !== u) return elem.prop('checked', Boolean(value));
				else return elem.prop('checked');
			} else if (canUseVal) {
				if (value !== u) return elem.val(value);
				else return elem.val();
			}
		}

	};

	/**
	 * jQuery function to SET or GET the real value of a DOM element, with or without a field definition (in this
	 * case, the jQuery.autoVal function will be called internally).
	 * We can call it on a selector with just one element (in this case we will GET/SET the real value), or
	 * in a selector with two or more elements.
	 * In this case the function will return an object where the key, will be one of these properties (in OR condition):
	 *  - value of [rkey] attribute
	 *  - value of [name] attribute
	 *  - value of [id] attribute
	 *  - index of the element in the selector
	 * ...and the value will be the RealValue (if we are setting, will be the new one).
	 * @memberof RealValue
	 * @name RealValue.rval
	 * @type {function}
	 */
	$.fn.rval = function() {

		// Controllo validità...
		if (!this.length) return;

		var args = arguments;
		justOne = function() {
			var def = R.field(this),
				// are we going to GET or SET ?
				isGet = def && def.isGet ?
					// if the definition has an "isGet" check...
					def.isGet.apply(this, arguments)
					// else use the standard method provided by the library
					: R.isGet.apply(this, arguments),
				// Function to execute
				todo = isGet ? "get" : "set";

			return def && def[todo] ?
				// custom definition
				def[todo].apply(this, arguments)
				// default definition
				: this.autoVal.apply(this, arguments);
		};

		// We can call it in just one element...
		if (this.length === 1) return justOne.apply(this, args);
		// ...or in 2 or more...
		else if (this.length > 1) {

			var ret = {};

			// Bind an object to the entire selector
			if (args.length === 1 && $.isPlainObject(args[0])) {

				var obj = args[0];
				this.each(function(i, elem) {
					var el = $(elem), key = el.attr("name");

					ret[key] = justOne.apply(el, [ obj[key] ]);
				});
			}
			// ...or just set the elements with the value provided (args)
			else {
				this.each(function(i, elem) {
					var el = $(elem), key = el.attr("name");

					ret[key] = justOne.apply(el, args);
				});
			}
			return ret;
		}
	};

	return (window.RealValue = R);
});
