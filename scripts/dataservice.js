angular.module('cssHandles').factory('DataService', function($rootScope, CssParser, HtmlParser) {
	function CssProperty(node) {
		// create with node received
		if (node != undefined) {
			this.node = node,
			this.name = node.value,
			this.editor = node.editor,
			this.rule = node.parent;
		
		// create new node
		} else {
			this.node = {
				
			};
		}
	};
	CssProperty.prototype = {
		getValueObj: function(fn) {
			var node;
			var rule = this.node;
			if (fn != undefined) {
				var children = rule.children;
				if (children != undefined) {
					for (var i=0, len=children.length; i<len; i++) {
						var child = children[i];
						if (child.value == fn) {
							node = child.children[0];
						}
					}
				}
				
			} else if (rule.isShorthand) {	// need to add support for all box model arrangements
				 node = rule.children[0];
				
			} else if (rule.valobj != undefined) {
				node = rule.valobj;
			}
			return node;
		},
		
		highlightValueLine: function(fn) {
			var node = this.getValueObj(fn);
			if (node != undefined) {
				var editor = node.editor;
				var line = node.pos.start.line;
				editor.addLineClass(line, 'background', 'hoverLine');
				var lineNum = editor.getLineNumber(line);
				editor.scrollIntoView({
					line: lineNum,
					ch: 0
				});
			}
		},
		
		unhighlightValueLine: function(fn) {
			var node = this.getValueObj(fn);
			if (node != undefined) {
				var editor = node.editor;
				editor.removeLineClass(node.pos.start.line, 'background', 'hoverLine');
			}
		},
		
		selectValueCode: function(fn) {
			var node = this.getValueObj(fn);
			var pos = node.pos;
			var editor = node.editor;
			editor.setSelection({
				line: editor.getLineNumber(pos.start.line), 
				ch: pos.start.ch
			}, {
				line: editor.getLineNumber(pos.end.line), 
				ch: pos.end.ch
			});
			editor.focus();
		},
		
		setValue: function(val, fn) {
			// set value in object model
			var node = this.getValueObj(fn);
			node.value = val;
			
			// create property definition in editor
			if (node.pos != undefined) {
				var newStr = this.toString(node);
				var editor = this.editor;
				var start = {
					line: editor.getLineNumber(node.pos.start.line),
					ch: node.pos.start.ch
				};
				var end = {
					line: editor.getLineNumber(node.pos.end.line),
					ch: node.pos.end.ch
				};
				editor.replaceRange(newStr, start, end);
				node.pos.end.ch = start.ch + newStr.length;
				this.selectValueCode(fn);
			}
		},
		
		hasFnDefined: function(fn) {
			var hasFn = false;
			var children = this.node.children;
			for (var i=0, len=children.length; i<len; i++) {
				if (children[i].value == fn) {
					hasFn = true;
				}
			}
			return hasFn;
		},
		
		toString: function(node) {
			// build full value and return string
			var str = '';
			
			// build string for value node
			if (node.type == 10) {
				str += node.value + node.unit;
				
			// build string for function node
			} else if (node.type == 6) {
				str += node.value + '(';
				var values = [];
				for (var i=0, len=node.children.length; i<len; i++) {
					values.push(node.children[i].toString());
				}
				str += values.join(',') + ')';
			
			// build string for property node
			} else {
				str += prop.name + ': ';
				if (node.isShorthand) {
					var values = [];
					for (var i=0, len=node.children.length; i<len; i++) {
						values.push(node.children[i].toString());
					}
					str += values.join(' ');
				
				} else if (node.isGrouped) {
						var values = [];
						for (var i=0, len=node.children.length; i<len; i++) {
							values.push(node.children[i].toString());
						}
						str += values.join(', ');
				
				} else {
					str += node.valObj.toString();
				}
				str += ';\n'
			}
			return str;
		},
	};
	
	var ds = {
		
		// define helper objects for dealing with CSS and editor
		
		/*****************************/
		// CssHelper is where all interactions with parsed CSS come from
		/*****************************/
		CssEditorHelper: {
		
			// builds a list of rules that apply to element
			// builds object with all defined properties for element
			// collapses code between applicable rules
			foldCssRules: function(element) {
				ds.properties = {};
				ds.rules = [];
				
				ds.CssEditorHelper.unfoldCode();
				angular.forEach(ds.sheets, function(sheet) {
					var editor = sheet.editor;
					var start = { line:0, ch:0 };
					var parsedSheet = CssParser.parseAlt(editor);
					angular.forEach(parsedSheet.rules, function(rule) {
						if (element.matches(rule.value)) {
							ds.rules.push(rule);
							
							angular.forEach(rule.children, function(prop) {
								ds.properties[prop.value] = new CssProperty(prop);
							});
							
							// fold code before rule
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
				
				// select active rule
				// need to improve this later with rule specificity logic
				ds.activeRule = ds.rules[ds.rules.length-1];
				
				return ds.rules;
				
			},
			
			unfoldCode: function() {
				angular.forEach(ds.sheets, function(sheet) {
					var editor = sheet.editor;
					for (var i=0, len=editor.lineCount(); i<len; i++) {
						editor.foldCode({line: i, ch: 0}, null, "unfold");
					}
				});
			},
			
			// determines whether a property is defined for selected element
			isPropertyDefined: function(prop, fn) {
				if (ds.properties != undefined) {
					var propObj = ds.properties[prop];
					
					// if property doesn't exist then return false
					if (propObj == undefined) {
						return false;
					}
					
					// if property exists, but function doesn't then return false
					if (fn != undefined) {
						return propObj.hasFnDefined(fn);
					}
					
					// property exists
					return true;
				}
			},
			
			getOrCreateProp: function(propName, fn, unit) {
				var prop = ds.properties[propName];
				
				// create new rule
				if (prop == undefined) {
					var rule = ds.rules[ds.rules.length-1];
					var editor = rule.editor;
					var node = {
						unit: unit,
						name: propName,
						editor: editor,
						type: 3,
						parent: rule,
					};
					prop = new CssProperty(node);
					var str = '\t' + node.name + ': ';
					var valStartPos = str.length;
					var lineNum = editor.getLineNumber(rule.pos.end.line);
					var handle;
					var endProp = ';\n';
					
					var val = {
						value: 0,
						unit: unit,
						type: 10,
						editor: editor,
					};
					
					// handle non-function values
					if (fn == undefined) {
						prop.node.valobj = val;
						
						// add property to code editor
						str += prop.toString(val) + endProp;
						rule.editor.replaceRange(str,
							{
								line: lineNum,
								ch: 0
							}
						);
						handle = editor.getLineHandle(lineNum);
						
						// set position for property value
						val.pos = {
							start: {
								line: handle,
								ch: valStartPos
							},
							end: {
								line: handle,
								ch: str.length-2
							}
						};
					
					// handle function values
					} else {
						// create CSS function objects
						var fnObj = {
							value: fn,
							type: 6,
							children: [val]
						}
						prop.node.children = [fnObj];
						
						// build string and add to editor
						str += fn + '(' + prop.toString(val) + ')' + endProp;
						rule.editor.replaceRange(str,
							{
								line: lineNum,
								ch: 0
							}
						);
						handle = editor.getLineHandle(lineNum);
						
						// add positions to function and value objects
						fnObj.pos = {
							start: {
								line: handle,
								ch: valStartPos
							},
							end: {
								line: handle,
								ch: str.length-2
							}
						};
						val.pos = {
							start: {
								line: handle,
								ch: valStartPos + fn.length + 1
							},
							end: {
								line: handle,
								ch: str.length-3
							}
						};
						
					}
					
					// set position for property node
					node.pos = {
						start: {
							line: handle,
							ch: 1
						},
						end: {
							line: handle,
							ch: str.length-1
						}
					};
					
					// add rule to object structure
					ds.properties[propName] = prop;
					rule.children.push(node);
				}
				
				// define child function if not set
				if (fn != undefined && !prop.hasFnDefined(fn)) {
					prop.children = [{
						type: 6,
						parent: prop,
						value: fn,
						pos: {},
						children: [{
							value: 0,
							unit: unit,
							type: 10,
							pos: {}
						}]
					}];
				}
				
				return prop;
			},
			
			/*getRule: function(prop, fn, create, unit) {
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
			},*/
		
		},
		
		HtmlEditorHelper: {
			
			// find element at pos in editor
			getHtmlElement: function(pos) {
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
			
			// select text in editor corresponding to element
			selectElementCode: function(element) {
		    var tag = element.tagName.toLowerCase();
		    var allTags = $(ds.doc).find(tag);
		    var index = allTags.index(element);
		    var tags = ds.html.types[tag];
		    if (tags != undefined && tags.length > index) {
		    	var position = tags[index].pos;
		    	var editor = ds.editor;
		    	if (position != undefined) {
		    		ds.isClickSelected = true;
		    		editor.setSelection(position.start, position.end);
		    		editor.scrollIntoView(position.start);
		    		editor.focus();
		    	}
		    }
		    
				
			},
		
		},
	
		
		/*******************************/
		// General methods for communication between handles and controller
		/*******************************/
		
		// load editors and match them up with stylesheets
		sheets: [],
		
		doc: function(doc) {
			ds.doc = doc;
		},
		
		// on-page select of an element
		select: function(element) {
			ds.selected = element;
			ds.CssEditorHelper.foldCssRules(element);
			ds.HtmlEditorHelper.selectElementCode(element);
			$rootScope.$broadcast('select', element);
		},
		
		// HTML editor loads
		// handles parsing html when editor changes
		// handles changing selected element, when editor's cursor changes
		htmlEditorLoaded: function(editor) {
			ds.editor = editor;
			editor.on('changes', function(editor, changes) {
				ds.html = HtmlParser.parse(editor);
			});
			editor.on('cursorActivity', function(editor) {
				var pos = editor.getCursor('anchor');
				var element = ds.HtmlEditorHelper.getHtmlElement(pos);
				if (element != undefined && element != ds.selected) {
						ds.selected = element;
						ds.CssEditorHelper.foldCssRules(element);
						$rootScope.$broadcast('select', element);
				}
			});
		},
		
		cssEditorLoaded: function(editor, sheet) {
			var sheetObj = {
				editor: editor,
				sheet: sheet
			};
			ds.sheets.push(sheetObj);
			editor.on('changes', function(editor, change) {
				$rootScope.$broadcast('cssChange', sheetObj, change);
			});
		},
		
		getRuleIndex: function(prop, fn) {
			if (ds.CssEditorHelper.isPropertyDefined(prop, fn)) {
				return 1;
			};
		},
		
		handleMouseOver: function(prop, fn) {
			var prop = ds.properties[prop];
			if (prop != undefined) {
				prop.highlightValueLine(fn);
				$rootScope.$broadcast('handleMouseOver', prop);
			}
		},
		
		handleMouseOut: function(prop, fn) {
			var prop = ds.properties[prop];
			if (prop != undefined) {
				prop.unhighlightValueLine(fn);
				$rootScope.$broadcast('handleMouseOut', prop);
			}
		},
		
		handleStartDrag: function(prop, fn, defaultUnit) {
			var prop = ds.CssEditorHelper.getOrCreateProp(prop, fn, defaultUnit);
			prop.selectValueCode(fn);
			$rootScope.$broadcast('handleStartDrag', prop);
		},
				
		proposePixelMove: function(propName, fn, val, allowNegative, percentDenom, emDenom, valWrapper) {
			var prop = ds.properties[propName];
			var valObj = prop.getValueObj(fn);
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
			prop.setValue(newNum, fn);
		},
		
		finalizePixelMove: function(propName, fn) {
			var prop = ds.properties[propName];
			if (prop != undefined) {
				var valObj = prop.getValueObj(fn);
				valObj.originalValue = undefined;
				$rootScope.$broadcast('handleStopDrag', prop);
				
				// need to add support for making single history item for dragging
			}
		},
		
		// used for cancelling a handle drag before release
		cancelPixelMove: function(propName, fn) {
			var prop = ds.properties[prop];
			if (prop != undefined) {
				var valObj = prop.getValueObj(fn);
				prop.setValue(valObj.originalValue, fn);
				valObj.originalValue = undefined;
			}
		}
		
	};
	return ds;
})