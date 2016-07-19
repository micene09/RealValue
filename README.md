# RealValue

A [jQuery](https://github.com/jquery/jquery) plugin with the goal to extend the standard concept of GET and SET on every HTML element as a jQuery selector, fully compatible with [RequireJS](http://requirejs.org/).

## Index

1. [Why](#why)
2. [How it works](#how)
3. [Installation](#install)
4. [Basic example](#example)
5. [API](#api)
	* [RealValue methods](#apirealv)
	* [jQuery methods](#apijq)
6. [Definitions Catalogue](#catalogue)
	* [Timestamp](#cattimestamp)
	* [Checkbox](#catcheckbox)
	* [Percentage](#catperc)
	* [Number](#catnumber)
	* [Icon](#caticons)

<a name="why"></a>
## Why

Sometimes...what you get from a field, using [jQuery.val()](http://api.jquery.com/val/) or whatever, need to be different from what user/client see. Just think about a date field, where after getting his value you will need to convert a string like "03/06/1989" to a Date object (or Timestamp).

With RealValue you can add unlimited custom definition to everything, increasing the production speed, getting and setting always with just one method called **rval**, directly on a jQuery selector.

<a name="how"></a>
## How it works

You have to set your custom fields definitions in a _.js file,_ after* the plugin inclusion.

Every definition will have **primary key**, this will give the ability to recognize the field definition during the setting/getting process.

To add a custom field definition, just use the method RealValue.add, as the following:

```javascript
RealValue.add("thePrimaryKey", {
    get: function() { // << the getter function
        return this.val();
    },
    set: function(value) { // << the setter function
        // your code here...
    }
});
```

_(for both functions, the "this" value is the jQuery selector of the element using the definition)_

Then attach this definition to an element using the **rfield** attribute:

```html
<input rfield="thePrimaryKey" type="text" id="myField" value="LOL" />
```

Now you can...

```javascript
// ...get
var value = $("#myField").rval(); // << this will set value to "LOL"

// ...or set
$("#myField").rval("the value"); // << this, will set "the value"
```

The rval method, **can be used with every tag**, even when a primary-key is not defined or the rfield attribute doesn't exist. In this case, rval will get/set using the proper method on the element (jQuery.val, jQuery.prop etc...).

<a name="install"></a>
## Installation

Include it in the head tag after jQuery:

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js"></script>
<script src="realvalue.min.js"></script>
```

...or if you are a RequireJS user, just map it (read the [documentation](http://requirejs.org/docs/api.html#config-paths) about path mapping) and require it as usual:

```javascript
require(['realvalue'], function(RealValue) {
    // your code here...
});
```

<a name="example"></a>
## Basic example

In our imaginary scenario, we have just 2 field:

```html
<input type="text" id="a" value="LOL" />
<input type="checked" id="b" checked />
```

In this case, we should use two different functions to get the values, in order:

- jQuery.val()
- jQuery.prop("checked")

### But we are doing something magic now...

Add the following definition with the primary-key "checkbox" (you can set whatever you want):

```javascript
RealValue.add("checkbox", {
    get: function() {
        // get the property
        return this.prop('checked');
    },
    set: function(value) {
        // Set using the Boolean conversion of value
        this.prop('checked', Boolean(value));
    }
});
```

Convert the HTML tag of that checkbox as the following:

```html
<input type="text" id="a" value="LOL" />
<input rfield="checkbox" type="checked" id="b" checked />
```

Now just write some code:

```javascript
// the text field, no definition here...
console.log( $("#a").rval() ); // << this will print: "LOL"

// the checkbox
console.log( $("#b").rval() ); // << this will print: true
```

<a name="api"></a>
## API

<a name="apirealv"></a>
### RealValue methods

#### field ( selector )

Return the definition object for a given jQuery selector as first argument.

#### add ( primaryKey, options )

Will add a new field definition with the given "primaryKey" and "options" as object. Here the full list of properties:

- **get** (required), function used to get value from a field definition. The "this" value inside this function will be the jQuery Selector of the element using the definition. Usually you will call a get without any parameters. In case you need a particular getter with one or more parameters (as option or whatever...), just set the _isGet_ property to alter the default process.

- **set** (required), function used to setting values from a field definition. The "this" value inside this function will be the jQuery Selector of the element using the definition. You can call it with one or more arguments in this function, everything it's up to you.

- **isGet** (optional), this function will return true, if the 'current' call of the rval method in a specific field definition will be a GET. The default value of this property is the following:

  ```javascript
   function isGet () {
        return arguments.length === 0;
    };
  ```

- **on** (optional), this will be another object used to intercept standard (or custom) jQuery Events on the field selector. Example:

  ```javascript
   on: {
       click: function (e) {
           // your code here...
       },
       change: function (e) {
           // your code here...
       }
   }
  ```

<a name="apijq"></a>
### jQuery methods

#### rval ()

The core method for setting or getting the real value of a field, used to SET or GET a value to a field. During the SET/GET definition is not found, internally will check the tagName of the element, chosing the proper method.

If you need to GET or SET in multiple elements, just use the **name attribute**:

```html
<input type="text" rfield="aPrimaryKey" name="A">
<span rfield="anotherPrimaryKey" name="B">
```

...then:

- GET: Use rval() on this selector, with no arguments. This call will return an object having field name and value as pairs:

  ```javascript
   {
       A:  "value of A",
       B:  "value of B"
   }
  ```

- SET Use rval() passing just one argument:

  ```
   1\. A value, to set every field with the same value.
   2\. An object, to set every field using the object pairs (key = rfield attribute).
  ```

#### autoVal ()

Used internally by rval, this will **never** check for field definition but will chose always the proper method to SET/GET on a jQuery Selector, using a:

TAG                    | jQuery.function
---------------------- | ---------------
input[type='checkbox'] | prop("checked")
other inputs           | val
select                 | val
span/div etc...        | text

<a name="catalogue"></a>
## Definitions Catalogue

The limit is only your imagination...but if you running out of ideas, the following list is for you.

<a name="cattimestamp"></a>
### Timestamp

Set using timestamp (or Date object) and show it using DD/MM/YYYY format. The get call will always return the date as timestamp.

```javascript
RealValue.add("timestamp", {
	get: function() {
		var stringValue = $.trim(this.autoVal()),
			arr = stringValue.split("/"),

			// returing format with DD/MM/YYYY
			ret = new Date(+arr[2], +arr[1] - 1, +arr[0]);

		// return the real value
		return isNaN(+ret) ? 0 : +ret;
	},
	set: function(value) {
		// value === timestamp ? ...then convert to Date:
		if (!isNaN(value)) value = new Date(value);

		// will return DD/MM/YYYY
		var newval = [value.getDate(), value.getMonth(), value.getFullYear()].join("/");

		// Print result
		this.autoVal(newval);
	}
});
```

<a name="catcheckbox"></a>
### Checkbox

Set using any type of value, the checkbox will be checked using the Boolean conversion. The GET call will return the property checked of the element.

```javascript
RealValue.add("checkbox", {
	get: function() {
		// get the property
		return this.prop('checked');
	},
	set: function(value) {
		// Set using the Boolean conversion of value
		this.prop('checked', Boolean(value));
	}
});
```

<a name="catperc"></a>
### Percentage

Set using a number and show it using the symbol "%". The GET call will always return a number. Note the _symbol_ property in the field definition object...we can access to it using the function RealValue.field().

```javascript
RealValue.add("perc", {
	symbol: " %",
	get: function() {
		var def = RealValue.field(this);

		// Just return the number
		return +(this.autoVal().replace(",", ".").replace(def.symbol, ""));
	},
	set: function(value) {
		var def = RealValue.field(this);

		// safely convert in string, then change the "," with the standard "."
		value = +String(value).replace(",", ".");

		// Pretty print this value
		this.autoVal(value.toFixed(2).replace(".", ",") + def.symbol);
	},
	on: {
		// Just handle the user changes...
		change: function(e) {
			var t = $(this);

			// return if empty
			if (!$.trim(t.autoVal())) return;

			// get the real value, as a number
			var value = t.rval();

			// then pretty print, using the definition SET
			t.rval(value);
		}
	}
});
```

<a name="catnumber"></a>
### Number

Set using a number, show it to users with "," as separator for decimals.
The get call will return a javascript number.

```javascript
RealValue.add("number", {
	get: function() {
		var ret = this.autoVal();

		if (isNaN(+ret))
			ret = String(this.autoVal()) // get the value
				.replace(",", "."); // replace the "," with "." for decimals

		return +ret; // return the value converted
	},
	set: function(value) {
		value = String(value).replace(",", ".");

		// separating integers and decimals
		var parts = value.split(".");

		if (parts[1]) value = (+value).toFixed(parts[1].length);

		// pretty print the value
		this.autoVal(value.replace(".", ","));
	},
	on: {
		// Just handle the user changes...
		change: function(e) {
			var t = $(this);

			// return if empty
			if (!$.trim(t.autoVal())) return;

			// get the value
			var value = t.autoVal().replace(",", ".");

			// if is not a number, just erase it...
			if (isNaN(+value)) return t.autoVal("");

			// then pretty print, using the definition SET
			t.rval(value);
		}
	}
});
```

<a name="caticons"></a>
### Icon

Assuming we have to select an icon (image, span or whatever) in a group of icons, in which every icon has a value in an attribute called _icon-value_.
The attribute rfield will be placed in a wrapper of icons...and the selected icon will be recognized by the class _.selected_ .
With this field definition, you can:
 * Set the selected icon via click or programmatically (set call of rval).
 * Get the selected icon value, using the get call of rval as usual.

```javascript
RealValue.add("icon", {
	get: function() {
		// find the selected and return his value...
		var sel = this.find(".selected");
		return sel.length ? sel.attr("icon-value") : "";
	},
	set: function(value) {
		// reset classes
		this.find(".selected").removeClass("selected");

		// find the new one and select it
		this.find("[icon-value='" + value + "']").addClass("selected");
	},
	on: {
		click: function(e) {
			var target = $(e.target).closest(".icon"),
				value = target.attr("icon-value");

			// set the new value using the definition setter...
			$(this).rval(value);
		}
	}
});
```
