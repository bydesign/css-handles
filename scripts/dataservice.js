var CssValue = function(sheet, dec) {
	this.sheet = sheet;
	this.dec = dec;
	this.prop = dec.property;
	this.text = dec.value;
	this.parse(this.text);
};

CssValue.prototype = {
	parse: function(text) {
		var val = 0;
		var unit = '';
		text = text.trim();	
		
		// types = grouped, multiple, string, number
		var type = "string";
		if (text.indexOf(',') > -1) {
			type = "grouped";
			
		} else if (text.indexOf(' ') > -1) {
			type = "multiple";
			
		} else if (text.indexOf('#') > -1) {
			type = "color";
				
		} else if (text.indexOf('(') > -1) {
			type = "function";
			
		} else if (/\d/.test(text)) {
			type = "number";
			
			val = Number(text.replace(/[a-zA-Z%]/g, ''));
			unit = text.replace(/[0-9\.-]/g, '');
		}
		
		// parse shorthand values into parts
		/*var groups = text.split(',');
		angular.forEach(groups, function(group) {
			var parts = group.trim().split(' ');
			angular.forEach(parts, function(part) {
				console.log(part.trim());
			});
		});*/
		
		this.type = type;
		this.value = val;
		this.unit = unit;
	},
	
	setValue: function(value, unit) {
		this.value = value;
		this.unit = unit;
		this.apply();
	},
	
	apply: function() {
		var start = this.dec.position.start,
			end = this.dec.position.end,
			newStr = this.toString(),
			editor = this.sheet.editor;
		editor.replaceRange(newStr,
			{
				line: start.line-1,
				ch: start.column-1
			},
			{
				line: end.line-1,
				ch: end.column-1
			}
		);
		end.column = start.column + newStr.length;
		editor.setCursor({
			line: start.line-1,
			ch: start.column-1
		});
	},
	
	toString: function() {
		return this.dec.property + ': ' + this.value + this.unit;
	},
	// method to apply new value
};

angular.module('cssHandles').factory('DataService', function($rootScope) {
	var ds = {
		// load editors and match them up with stylesheets
		sheets: [],
		editorLoaded: function(editor, sheet) {
			var sheetObj = {
				editor: editor,
				text: editor.getValue(),
				sheet: sheet
			};
			ds.sheets.push(sheetObj);
			editor.on('changes', function(editor, change) {
				$rootScope.$broadcast('cssChange', sheetObj, change);
			});
		},
		
		select: function(element) {
			ds.selected = element;
			ds.getRules(element);
			$rootScope.$broadcast('select', element);
		},
		
		getRules: function(element) {
			// new method for getting rules
			var $element = $(element);
			ds.properties = {};
			ds.rules = [];
			ds.parsedSheets = [];
			
			// find rules that apply to element
			var that = this;
			angular.forEach(ds.sheets, function(sheet) {
				var parsedSheet = css.parse(sheet.editor.getValue());
				that.parsedSheets.push(parsedSheet);
				angular.forEach(parsedSheet.stylesheet.rules, function(rule) {
					if (rule.type == "rule" && $element.is(rule.selectors.join(', '))) {
						ds.rules.push(rule);
						
						angular.forEach(rule.declarations, function(dec) {
							if (dec.type == "declaration") {
								ds.properties[dec.property] = new CssValue(sheet, dec);
							}
						});
						
					} else if (rule.type == "media") {
						// loop over sub-rules for responsive rule modification?
						console.log('media rule found');
					}
				});
			});
			
			// select active rule
			// need to improve this later with rule trumping logic
			ds.activeRule = ds.rules[ds.rules.length-1];
			
			return ds.rules;
		},
		
		// returns the numbered index of the rule for specified property
		// this number is used for color coding handles and rules
		getRuleIndex: function(prop) {
			if (ds.properties != undefined) {
				var rule = ds.properties[prop];
				if (rule != undefined) {
					return 1;
					//return rule.rule.index;
				}
			}
		},
		
		proposePixelMove: function(prop, val, defaultUnit, allowNegative, percentDenom, emDenom, valWrapper) {
			// add grid/object snapping
			// determine active rule
			//var activeRule = this.activeRule;
			var rule = ds.properties[prop];
			if (rule.originalValue == undefined) {
				rule.originalValue = rule.value;
			}
			
			// define new style if property isn't defined yet
			if (rule == undefined) {
				rule = {
					name: prop,
					value: 0,
					unit: defaultUnit,
					style: activeRule.style,
					rule: activeRule,
				}
				ds.properties[prop] = rule;
			}
			// convert pixels to %, em, etc. when needed
			if (rule.unit == '%') {
				val = val / percentDenom * 100;
			} else if (rule.unit == 'em') {
				val = val / emDenom;
			}
			//val *= this.zoomFactor;
			if (rule.unit == 'px') {
				val = Math.round(val);
			}
			
			// assign new value to CSS rule
			var newNum = rule.originalValue + val;
			if (!allowNegative && newNum < 0) {
				newNum = 0;
			}
			newNum = Math.round(newNum * 1000) / 1000;
			
			// apply value to css rule
			rule.setValue(newNum, rule.unit);
		},
		
		finalizePixelMove: function(prop) {
			var rule = ds.properties[prop];
			rule.originalValue = undefined;
			//rule.value = Number( rule.style[prop].replace(rule.unit, '') );
			if (ds.selectedRule) {
				rule.rule = ds.selectedRule;
				rule.style = ds.selectedRule.style;
			}
		},
		
		// used for cancelling a handle drag before release
		cancelPixelMove: function(prop) {
			var rule = ds.properties[prop];
			rule.value = rule.originalValue;
			rule.originalValue = undefined;
			/*if (rule != undefined) {
				rule.style[prop] = rule.value + rule.unit;
			}*/
		}
	};
	return ds;
})