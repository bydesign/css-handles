angular.module('cssHandles').factory('DataService', function($rootScope, CssParser, HtmlParser) {
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
		
		doc: function(doc) {
			ds.doc = doc;
		},
		
		htmlEditorLoaded: function(editor) {
			ds.editor = editor;
			editor.on('changes', function(editor, changes) {
				console.log(changes);
				ds.html = HtmlParser.parse(editor);
			});
			editor.on('cursorActivity', function(editor) {
				if (ds.isClickSelected) {
					ds.isClickSelected = false;
				} else {
					var pos = editor.getCursor('anchor');
					var el = ds.getHtmlElement(pos);
					if (el != undefined && el != ds.selected) {
						ds.select(el, undefined, true);
					}
				}
			});
		},
		
		getHtmlElement: function(pos) {
			// find element at pos
			if (ds.html != undefined) {
				var tags = ds.html.tags;
				var selTag;
				angular.forEach(tags, function(tag) {
					var start = tag.pos.start,
						end = tag.pos.end;
					
					if ((
						pos.line > start.line ||
						(pos.line == start.line && pos.ch >= start.ch)
					) && (
						pos.line < end.line ||
						(pos.line == end.line && pos.ch <= end.ch)
					)) {
						selTag = tag;
					}
				});
				var tagName = selTag.tagName;
				var allTags = $(ds.doc).find(tagName);
				var index = ds.html.types[tagName].indexOf(selTag);
				
				if (allTags.length > index) {
					return allTags[index];
				}
			}
		},
		
		getElementPosition: function(element) {
		    var tag = element.tagName.toLowerCase();
		    var allTags = $(ds.doc).find(tag);
		    var index = allTags.index(element);
		    var tags = ds.html.types[tag];
		    if (tags != undefined && tags.length > index) {
		    	return tags[index].pos;
		    }
		},
		
		select: function(element, doc, suppressSelect) {
			ds.selected = element;
			ds.getRules(element);
			
			if (suppressSelect == undefined) {
				var position = ds.getElementPosition(element);
				var editor = ds.editor;
				if (position != undefined) {
					ds.isClickSelected = true;
					editor.setSelection(position.start, position.end);
					editor.scrollIntoView(position.start);
					editor.focus();
				}
			}
			
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
				var parsedSheet = CssParser.parseAlt(sheet.editor);
				//var parsedSheetAlt = CssParser.parse(sheet.editor);
				that.parsedSheets.push(parsedSheet);
				angular.forEach(parsedSheet.rules, function(rule) {
					//if (rule.selector[0] != '@' && $element.is(rule.selector)) {
					//if (rule.selector[0] != '@' && element.matches(rule.selector)) {
					//console.log(rule.value);
					if (element.matches(rule.value)) {
					
						rule.sheet = sheet;
						ds.rules.push(rule);
						
						angular.forEach(rule.children, function(prop) {
							prop.rule = rule;
							//console.log('--'+prop.value);
							ds.properties[prop.value] = prop;
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
				var rule = ds.getRule(prop);
				if (rule != undefined) {
					return 1;
					//return rule.rule.index;
				}
			}
		},
		updateEditor: function(newVal, prop, propName) {
			var editor = prop.rule.sheet.editor;
			var valObj = ds.getValObj(prop, propName);
			var pos = valObj.pos;
			console.log(prop);
			console.log(valObj);
			console.log(pos);
			var newStr = newVal + (valObj.unit ? valObj.unit : '');
			if (pos) {
				var start = {
					line: editor.getLineNumber(pos.start.line),
					ch: pos.start.ch
				};
				var end = {
					line: editor.getLineNumber(pos.end.line),
					ch: pos.end.ch
				};
				editor.replaceRange(newStr, start, end);
				//editor.setCursor(start);
				pos.end.ch = start.ch + newStr.length;
			
			// create new rule
			} else {
				if (propName.indexOf(':') != -1) {
					console.log(newVal);
					console.log(propName);
					if (prop.pos == undefined) {
						var fn = propName.split(':')[1];
						var def = '\t' + prop.name + ': ' + fn + '(';
						var startPos = def.length-1;
						def += newStr + ');\n';
						var line = editor.getLineNumber(prop.rule.pos.end.line);
						editor.replaceRange(def, {
							line: line,
							ch: prop.rule.pos.end.ch
						});
						// set property's position
						valObj.pos = {
							start: {
								line: editor.getLineHandle(line),
								ch: startPos+1
							},
							end: {
								line: editor.getLineHandle(line),
								ch: startPos + newStr.length+1
							}
						};
					
					} else {
						var fn = propName.split(':')[1];
						var def = ' ' + fn + '(' + newStr + ')';
						var pos = prop.children[0].pos;
						var startPos = pos.end.ch + 1;
						var line = editor.getLineNumber(pos.end.line);
						editor.replaceRange(def, {
							line: line,
							ch: startPos
						});
						
						// set property's position
						valObj.pos = {
							start: {
								line: editor.getLineHandle(line),
								ch: startPos + fn.length + 2
							},
							end: {
								line: editor.getLineHandle(line),
								ch: startPos + def.length - 1
							}
						};
					}
				
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
					valObj.pos = {
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
			}
			ds.selectValue(prop, propName);
		},
		
		getValObj: function(rule, prop) {
			var obj;
			if (prop.indexOf(':') != -1) {
				var fn = prop.split(':')[1];
				var children = rule.children;
				if (children != undefined) {
					for (var i=0, len=children.length; i<len; i++) {
						var child = children[i];
						if (child.value == fn) {
							obj = child.children[0];
						}
					}
				}
				
			} else if (rule.isShorthand) {	// need to add support for all box model arrangements
				 obj = rule.children[0];
				
			} else if (rule.valobj != undefined) {
				obj = rule.valobj;
			}
			return obj;
		},
		
		handleMouseOver: function(prop) {
			var rule = ds.getRule(prop);
			if (rule != undefined) {
				var editor = rule.rule.sheet.editor;
				var pos = ds.getValObj(rule, prop).pos;
				var line = editor.getLineNumber(pos.start.line);
				editor.addLineClass(line, 'background', 'hoverLine');
				editor.scrollIntoView({
					line: line,
					ch: 0
				});
			}
			$rootScope.$broadcast('handleMouseOver', prop);
		},
		
		handleMouseOut: function(prop) {
			var rule = ds.getRule(prop);
			if (rule != undefined) {
				var editor = rule.rule.sheet.editor;
				var pos = ds.getValObj(rule, prop).pos;
				editor.removeLineClass(pos.start.line, 'background', 'hoverLine');
			}
			$rootScope.$broadcast('handleMouseOut', prop);
		},
		
		handleStartDrag: function(prop) {
			var rule = ds.getRule(prop);
			if (rule != undefined) {
				ds.selectValue(rule, prop);
			}
			$rootScope.$broadcast('handleStartDrag', prop);
		},
		
		selectValue: function(rule, prop) {
			var editor = rule.rule.sheet.editor;
			var pos = ds.getValObj(rule, prop).pos;
			if (pos) {
				var start = editor.getLineNumber(pos.start.line);
				var end = editor.getLineNumber(pos.end.line);
				editor.setSelection({
					line: start, 
					ch: pos.start.ch
				}, {
					line: end, 
					ch: pos.end.ch
				});
				editor.focus();
			}
		},
		
		getRule: function(prop, create, unit) {
			var rule;
			var propName = prop;
			if (prop.indexOf(':') != -1) {
				var parts = prop.split(':');
				prop = parts[0];
				fn = parts[1];
				var posRule = ds.properties[prop];
				if (posRule != undefined) {
					var children = posRule.children;
					if (children != undefined) {
						for (var i=0, len=children.length; i<len; i++) {
							var child = children[i];
							if (child.value == fn) {
								rule = ds.properties[prop];
							}
						}
						if (rule == undefined && create) {
							children.push({
								value: fn,
								type: 6,
								parent: posRule,
								children: [{
									value: 0,
									unit: unit
								}]
							});
							rule = posRule;
						}
					}
				}
			} else {
				rule = ds.properties[prop];
			}
			if (rule == undefined && create) {
				rule = {
					name: prop,
					rule: ds.rules[ds.rules.length-1]
				}
				if (propName.indexOf(':') != -1) {
					rule.children = [{
						type: 6,
						parent: rule,
						value: propName.split(':')[1],
						children: [{
							value: 0,
							unit: unit
						}]
					}];
				
				} else {
					rule.valobj = {
						value: 0,
						unit: unit,
					};
				}
				
				ds.properties[prop] = rule;
			}
			return rule;
		},
		
		proposePixelMove: function(prop, val, defaultUnit, allowNegative, percentDenom, emDenom, valWrapper) {
			// add grid/object snapping
			// determine active rule
			//var activeRule = this.activeRule;
			//var rule = ds.properties[prop];
			// define new style if property isn't defined yet
			/*if (rule == undefined) {
				rule = {
					name: prop,
					valobj: {
						value: 0,
						unit: defaultUnit,
					},
					rule: ds.rules[ds.rules.length-1]
				}
				ds.properties[prop] = rule;
			}*/
			var rule = ds.getRule(prop, true, defaultUnit);
			var valObj = ds.getValObj(rule, prop);
			var unit = valObj.unit;
			if (valObj.originalValue == undefined) {
				valObj.originalValue = valObj.value;
			}
			
			// convert pixels to %, em, etc. when needed
			if (unit == '%') {
				if (percentDenom > 0 || percentDenom < 0) {
					val = val / percentDenom * 100;
				} else {
					val = 0;
				}
			} else if (unit == 'em') {
				val = val / emDenom;
			}
			//val *= this.zoomFactor;
			if (unit == 'px') {
				val = Math.round(val);
			}
			
			// assign new value to CSS rule
			var newNum = valObj.originalValue + val;
			if (!allowNegative && newNum < 0) {
				newNum = 0;
			}
			newNum = Math.round(newNum * 1000) / 1000;
			
			// apply value to css rule
			valObj.value = newNum;
			ds.updateEditor(newNum, rule, prop);
		},
		
		finalizePixelMove: function(prop) {
			var rule = ds.getRule(prop);
			var valObj = ds.getValObj(rule, prop);
			// finalize property
			if (rule != undefined) {
				valObj.originalValue = undefined;
				if (ds.selectedRule) {
					rule.rule = ds.selectedRule;
					rule.style = ds.selectedRule.style;
				}
			
			// create empty property
			// need to add support for shorthand properties
			} else {
				rule = {
					name: prop,
					valobj: {
						value: 0,
						unit: ''
					},
					rule: ds.rules[ds.rules.length-1]
				}
				ds.updateEditor('0', rule, prop);
				ds.properties[prop] = rule;
			}
			$rootScope.$broadcast('handleStopDrag', rule);
		},
		
		// used for cancelling a handle drag before release
		cancelPixelMove: function(prop) {
			console.log('cancel drag: '+prop);
			var rule = ds.getRule(prop);
			rule.value = rule.originalValue;
			rule.originalValue = undefined;
		}
		
	};
	return ds;
})