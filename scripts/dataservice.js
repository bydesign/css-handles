angular.module('cssHandles').factory('DataService', function($rootScope, CssParser) {
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
		
		htmlEditorLoaded: function(editor) {
			ds.editor = editor;
		},
		
		select: function(element, doc) {
			ds.selected = element;
			ds.getRules(element);
			
			// highlight line in HTML
			ds.get_clean_lines();
			var lineNum = ds.line_number(element, doc);
			ds.editor.setCursor({
				line: lineNum,
				ch: 0
			});
			ds.editor.focus();
			
			ds.foldRules();
			
			$rootScope.$broadcast('select', element);
		},
		
		// fold non-relevant CSS
		foldRules: function() {
			var firstRule = ds.rules[0];
			if (firstRule != undefined) {
				// fold anything before first relevant rule
				var sheetEditor = firstRule.sheet.editor;
				for (var i=0, len=sheetEditor.lineCount(); i<len; i++) {
					sheetEditor.foldCode({line: i, ch: 0}, null, "unfold");
				}
				var startLine = firstRule.pos.start.line-1;
				if (startLine >= 0) {
					var startLength = sheetEditor.getLine(startLine).length;
					sheetEditor.foldCode(0, function(editor, pos) {
						return {
							from: {
								line: 0,
								ch: 0
							},
							to: {
								line: startLine,
								ch: startLength
							}
						};
					});
				}
				// fold anything after relevant rules
				angular.forEach(ds.rules, function(rule, index) {
					var nextLine;
					if (index+1 < ds.rules.length) {
						var ruleNext = ds.rules[index+1];
						nextLine = ruleNext.pos.start.line-1;
					} else {
						nextLine = sheetEditor.lineCount();
					}
					var line = rule.pos.end.line+1;
					sheetEditor.foldCode(line, function(editor, pos) {
						return {
							from: pos,
							to: {
								line: nextLine,
								ch: 1
							}
						};
					});
				});
			}
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
				//var parsedSheet = css.parse(sheet.editor.getValue());
				var parsedSheet = CssParser.parse(sheet.editor.getValue());
				that.parsedSheets.push(parsedSheet);
				angular.forEach(parsedSheet.rules, function(rule) {
					if (rule.selector[0] != '@' && $element.is(rule.selector)) {
						rule.sheet = sheet;
						ds.rules.push(rule);
						
						angular.forEach(rule.properties, function(prop) {
							prop.rule = rule;
							ds.properties[prop.name] = prop;
							/*if (dec.type == "declaration") {
								ds.properties[dec.property] = new CssValue(sheet, dec);
							}*/
						});
						
					}/* else if (rule.type == "media") {
						// loop over sub-rules for responsive rule modification?
						console.log('media rule found');
					}*/
				});
			});
			
			// select active rule
			// need to improve this later with rule specificity logic
			ds.activeRule = ds.rules[ds.rules.length-1];
			
			console.log('ds.properties');
			console.log(ds.properties);
			
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
		updateEditor: function(newVal, prop) {
			var editor = prop.rule.sheet.editor;
			var newStr = newVal + (prop.unit ? prop.unit : '');
			editor.replaceRange(newStr, prop.pos.start, prop.pos.end);
			editor.setCursor(prop.pos.start);
			prop.pos.end.ch = prop.pos.start.ch + newStr.length;
		},
		
		selectValue: function(prop) {
			var editor = prop.rule.sheet.editor;
			editor.setSelection(prop.pos.start, prop.pos.end);
			editor.focus();
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
			ds.updateEditor(newNum, rule);
		},
		
		finalizePixelMove: function(prop) {
			var rule = ds.properties[prop];
			rule.originalValue = undefined;
			//rule.value = Number( rule.style[prop].replace(rule.unit, '') );
			if (ds.selectedRule) {
				rule.rule = ds.selectedRule;
				rule.style = ds.selectedRule.style;
			}
			ds.selectValue(rule);
			$rootScope.$broadcast('handleStopDrag', rule);
		},
		
		// used for cancelling a handle drag before release
		cancelPixelMove: function(prop) {
			var rule = ds.properties[prop];
			rule.value = rule.originalValue;
			rule.originalValue = undefined;
			/*if (rule != undefined) {
				rule.style[prop] = rule.value + rule.unit;
			}*/
		},
		
		
	    // walks the source code to find the desired node
	    // does this by finding where the desired node is in sequence with all other nodes of the same tag
	    // then (somewhat naively) counts such tags until it finds that many instances of the tag
	    // require source to be scrubbed of potential false positives (see clean_lines())
	
	    // FIXME: will fail if any tags of the same type have been added to the page, probably need to make a copy in an iframe and compare that instead
	    line_number: function(node, doc) {
	        var tag = node.tagName;
	        var all_tags = $(doc).find(tag);
	        var index = all_tags.index(node) + 1;
	        var num_tags_found = 0;
	        for (var row = 0; row < ds.clean_lines.length; row++) {
	            var re = new RegExp('<' + tag, 'gi');
	            var matches = ds.clean_lines[row].match(re);
	            if (matches && matches.length) {
	                num_tags_found += matches.length;
	                if (num_tags_found >= index) {
	                    return row;
	                }
	            }
	        }
	    },
	    
	    get_clean_lines: function() {
            var lines = ds.editor.getValue().split(/\r?\n/);
    
            // now sanitize the raw html so you don't get false hits in code or comments
            var inside = false;
            var tag = '';
            var closing = {
                xmp: '<\\/\\s*xmp\\s*>',
                script: '<\\/\\s*script\\s*>',
                '!--': '-->'
            };
            ds.clean_lines = $.map(lines, function(line) {
                if (inside && line.match(closing[tag])) {
                    var re = new RegExp('.*(' + closing[tag] + ')', 'i');
                    line = line.replace(re, "$1");
                    inside = false;
                } else if (inside) {
                    line = '';
                }
    
                if (line.match(/<(script|!--)/)) {
                    tag = RegExp.$1;
                    line = line.replace(/<(script|xmp|!--)[^>]*.*(<(\/(script|xmp)|--)?>)/i, "<$1>$2");
                    var re = new RegExp(closing[tag], 'i');
                    inside = ! (re).test(line);
                }
    
                // remove quoted strings, because they might have false positive tag matches (like '<span>')
                line = line.replace(/(["'])(?:[^\\\1]|\\.)*\1/, '$1unsafe_string$1');
    
                return line;
            });
        }
	};
	return ds;
})