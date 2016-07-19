if (window.RealValue) {

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

	RealValue.add("icons", {
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

}
