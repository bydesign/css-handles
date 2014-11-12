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
				var rule = ds.properties[prop];
				if (rule != undefined) {
					return 1;
					//return rule.rule.index;
				}
			}
		},
		updateEditor: function(newVal, prop) {
			var editor = prop.rule.sheet.editor;
			var newStr = newVal + (prop.valobj.unit ? prop.valobj.unit : '');
			if (prop.valobj.pos != undefined) {
				var pos = prop.valobj.pos;
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
				var def = '\t' + prop.name + ': ';
				var startPos = def.length-1;
				def += newStr + ';\n';
				var line = editor.getLineNumber(prop.rule.pos.end.line);
				editor.replaceRange(def, {
					line: line,
					ch: prop.rule.pos.end.ch
				});
				// set property's position
				prop.valobj.pos = {
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
				var line = editor.getLineNumber(rule.valobj.pos.start.line);
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
				editor.removeLineClass(rule.valobj.pos.start.line, 'background', 'hoverLine');
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
			if (prop.valobj.pos != undefined) {
				var pos = prop.valobj.pos;
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
		
		proposePixelMove: function(prop, val, defaultUnit, allowNegative, percentDenom, emDenom, valWrapper) {
			// add grid/object snapping
			// determine active rule
			//var activeRule = this.activeRule;
			var rule = ds.properties[prop];
			
			// define new style if property isn't defined yet
			if (rule == undefined) {
				rule = {
					name: prop,
					valobj: {
						value: 0,
						unit: defaultUnit,
					},
					rule: ds.rules[ds.rules.length-1]
				}
				ds.properties[prop] = rule;
			}
			
			if (rule.originalValue == undefined) {
				rule.originalValue = rule.valobj.value;
			}
			
			// convert pixels to %, em, etc. when needed
			if (rule.valobj.unit == '%') {
				if (percentDenom > 0 || percentDenom < 0) {
					val = val / percentDenom * 100;
				} else {
					val = 0;
				}
			} else if (rule.valobj.unit == 'em') {
				val = val / emDenom;
			}
			//val *= this.zoomFactor;
			if (rule.valobj.unit == 'px') {
				val = Math.round(val);
			}
			
			// assign new value to CSS rule
			var newNum = rule.originalValue + val;
			if (!allowNegative && newNum < 0) {
				newNum = 0;
			}
			newNum = Math.round(newNum * 1000) / 1000;
			
			// apply value to css rule
			rule.valobj.value = newNum;
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
					valobj: {
						value: 0,
						unit: ''
					},
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
		}
		
	};
	return ds;
})