angular.module('cssHandles').factory('DataService', function($rootScope) {
	var ds = {
		loaded: function(css) {
			ds.sheets = css;
			$rootScope.$emit('loaded', css);
		},
		
		select: function(element) {
			ds.selected = element;
			ds.getRules(element);
			$rootScope.$emit('select', element);
		},
		
		getRules: function(element) {
			// new method for getting rules
			var $element = $(element);
			this.properties = {};
			this.rules = [];
			this.parsedSheets = [];
			
			// find rules that apply to element
			var that = this;
			angular.forEach(ds.sheets, function(sheet) {
				var parsedSheet = css.parse(sheet.text);
				that.parsedSheets.push(parsedSheet);
				angular.forEach(parsedSheet.stylesheet.rules, function(rule) {
					if (rule.type == "rule" && $element.is(rule.selectors.join(', '))) {
						that.rules.push(rule);
						
						angular.forEach(rule.declarations, function(dec) {
							if (dec.type == "declaration") {
								// need to move this logic into CSS parser to parse property values
								/*var str = dec.value,
									val = Number(str.replace(/[a-zA-Z%]/g, '')),
									unit = str.replace(/[0-9\.-]/g, ''),
									props = {
										name: dec.property,
										value: val,
										unit: unit,
										//style: rule.style,
										dec: dec,
										rule: rule,
									};*/
								that.properties[dec.property] = new CssValue(dec.property, dec.value);
							}
						});
						
					} else if (rule.type == "media") {
						// loop over sub-rules for responsive rule modification?
						console.log('media rule found');
					}
				});
			});
			console.log(this.properties);
			
			// select active rule
			// need to improve this later with rule trumping logic
			this.activeRule = this.rules[this.rules.length-1];
			
			return this.rules;
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
			var activeRule = this.activeRule;
			var rule = this.properties[prop];
			
			// define new style if property isn't defined yet
			if (rule == undefined) {
				rule = {
					name: prop,
					value: 0,
					unit: defaultUnit,
					style: activeRule.style,
					rule: activeRule,
				}
				this.properties[prop] = rule;
			}
			
			// convert pixels to %, em, etc. when needed
			if (rule.unit == '%') {
				val = val / percentDenom * 100;
			} else if (rule.unit == 'em') {
				val = val / emDenom;
			}
			val *= this.zoomFactor;
			if (rule.unit == 'px') {
				val = Math.round(val);
			}
			
			// assign new value to CSS rule
			var newNum = rule.value + val;
			if (!allowNegative && newNum < 0) {
				newNum = 0;
			}
			newNum = Math.round(newNum * 1000) / 1000;
			var newVal = newNum + rule.unit;
			
			if (valWrapper != undefined) {
				newVal = valWrapper.replace('#', newVal);
			}
			
			var style = rule.style;
			/*if (this.selectedRule) {
				style = this.selectedRule.style;
			}
			style[prop] = newVal;*/
			
			// return text change object
			return {
				property: prop,
				value: newVal,
				position: rule.dec.position,
			};
			
		},
		
		finalizePixelMove: function(prop) {
			var rule = this.properties[prop];
			rule.value = Number( rule.style[prop].replace(rule.unit, '') );
			if (this.selectedRule) {
				rule.rule = this.selectedRule;
				rule.style = this.selectedRule.style;
			}
		},
		
		// used for cancelling a handle drag before release
		cancelPixelMove: function(prop) {
			var rule = this.properties[prop];
			if (rule != undefined) {
				rule.style[prop] = rule.value + rule.unit;
			}
		}
	};
	return ds;
})