angular.module('cssHandles').factory('DataService', function($rootScope, CssParser) {
	var ds = {
		// load editors and match them up with stylesheets
		sheets: [],
		editorLoaded: function(editor, sheet) {
			var sheetObj = {
				editor: editor,
				//text: editor.getValue(),
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
			ds.unfoldCode();
			angular.forEach(ds.sheets, function(sheet) {
				var editor = sheet.editor;
				var start = { line:0, ch:0 };
				
				angular.forEach(ds.rules, function(rule) {
					if (rule.sheet == sheet) {
						// collapse before rule
						editor.foldCode(0, function(editor, pos) {
							return {
								from: start,
								to: {
									line: editor.getLineNumber(rule.pos.start.line)-1
								}
							};
						});
						
						start = {
							line: editor.getLineNumber(rule.pos.end.line)+1,
							ch:0
						};
					}
				});
				// fold code after last rule
				editor.foldCode(0, function(editor, pos) {
					return {
						from: start,
						to: {
							line: editor.lineCount()
						}
					};
				});
				
				editor.refresh();
			});
		},
		
		unfoldCode: function() {
			angular.forEach(ds.sheets, function(sheet) {
				var editor = sheet.editor;
				for (var i=0, len=editor.lineCount(); i<len; i++) {
					editor.foldCode({line: i, ch: 0}, null, "unfold");
				}
			});
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
				var parsedSheet = CssParser.parse(sheet.editor);
				that.parsedSheets.push(parsedSheet);
				angular.forEach(parsedSheet.rules, function(rule) {
					if (rule.selector[0] != '@' && $element.is(rule.selector)) {
						rule.sheet = sheet;
						ds.rules.push(rule);
						
						angular.forEach(rule.properties, function(prop) {
							prop.rule = rule;
							ds.properties[prop.name] = prop;
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
			if (prop.pos != undefined) {
				var start = {
					line: editor.getLineNumber(prop.pos.start.line),
					ch: prop.pos.start.ch
				};
				var end = {
					line: editor.getLineNumber(prop.pos.end.line),
					ch: prop.pos.end.ch
				};
				editor.replaceRange(newStr, start, end);
				//editor.setCursor(start);
				prop.pos.end.ch = start.ch + newStr.length;
			
			// create new rule
			} else {
				var def = '\t' + prop.name + ': ';
				var startPos = def.length-1;
				def += newStr + ';\n';
				var line = editor.getLineNumber(prop.rule.pos.end.line);
				editor.replaceRange(def, {
					line: line,
					ch: prop.rule.pos.end.ch
				});
				// set property's position
				prop.pos = {
					start: {
						line: editor.getLineHandle(line),
						ch: startPos+1
					},
					end: {
						line: editor.getLineHandle(line),
						ch: startPos + newStr.length+1
					}
				};
			}
			ds.selectValue(prop);
		},
		
		handleMouseOver: function(prop) {
			var rule = ds.properties[prop];
			if (rule != undefined) {
				var editor = rule.rule.sheet.editor;
				var line = editor.getLineNumber(rule.pos.start.line);
				editor.addLineClass(line, 'background', 'hoverLine');
				editor.scrollIntoView({
					line: line,
					ch: 0
				});
			}
			$rootScope.$broadcast('handleMouseOver', prop);
		},
		
		handleMouseOut: function(prop) {
			var rule = ds.properties[prop];
			if (rule != undefined) {
				var editor = rule.rule.sheet.editor;
				editor.removeLineClass(rule.pos.start.line, 'background', 'hoverLine');
			}
			$rootScope.$broadcast('handleMouseOut', prop);
		},
		
		handleStartDrag: function(prop) {
			var rule = ds.properties[prop];
			if (rule != undefined) {
				ds.selectValue(rule);
			}
			$rootScope.$broadcast('handleStartDrag', prop);
		},
		
		selectValue: function(prop) {
			var editor = prop.rule.sheet.editor;
			var start = editor.getLineNumber(prop.pos.start.line);
			var end = editor.getLineNumber(prop.pos.end.line);
			editor.setSelection({
				line: start, 
				ch: prop.pos.start.ch
			}, {
				line: end, 
				ch: prop.pos.end.ch
			});
			editor.focus();
		},
		
		proposePixelMove: function(prop, val, defaultUnit, allowNegative, percentDenom, emDenom, valWrapper) {
			// add grid/object snapping
			// determine active rule
			//var activeRule = this.activeRule;
			var rule = ds.properties[prop];
			
			// define new style if property isn't defined yet
			if (rule == undefined) {
				rule = {
					name: prop,
					value: 0,
					unit: defaultUnit,
					rule: ds.rules[ds.rules.length-1]
				}
				ds.properties[prop] = rule;
			}
			
			if (rule.originalValue == undefined) {
				rule.originalValue = rule.value;
			}
			
			// convert pixels to %, em, etc. when needed
			if (rule.unit == '%') {
				if (percentDenom > 0 || percentDenom < 0) {
					val = val / percentDenom * 100;
				} else {
					val = 0;
				}
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
			rule.value = newNum;
			ds.updateEditor(newNum, rule);
		},
		
		finalizePixelMove: function(prop) {
			var rule = ds.properties[prop];
			
			// finalize property
			if (rule != undefined) {
				rule.originalValue = undefined;
				if (ds.selectedRule) {
					rule.rule = ds.selectedRule;
					rule.style = ds.selectedRule.style;
				}
			
			// create empty property
			} else {
				rule = {
					name: prop,
					value: 0,
					unit: '',
					rule: ds.rules[ds.rules.length-1]
				}
				ds.updateEditor('0', rule);
				ds.properties[prop] = rule;
			}
			$rootScope.$broadcast('handleStopDrag', rule);
		},
		
		// used for cancelling a handle drag before release
		cancelPixelMove: function(prop) {
			console.log('cancel drag: '+prop);
			var rule = ds.properties[prop];
			rule.value = rule.originalValue;
			rule.originalValue = undefined;
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