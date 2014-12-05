angular.module('cssHandles').factory('CssPropTabMapping', function() {
	var SPACING = 1,
			SIZE = 2,
			POSITION = 3,
			BORDERS = 4,
			BACKGROUND = 5,
			FONT = 6,
			COLUMNS = 7,
			EFFECTS = 8,
			TRANSFORM = 9,
			TRANSFORM3D = 10;
	
	return {
		// spacing properties
		'padding': SPACING,
		'padding-top': SPACING,
		'padding-right': SPACING,
		'padding-bottom': SPACING,
		'padding-left': SPACING,
		'margin': SPACING,
		'margin-top': SPACING,
		'margin-right': SPACING,
		'margin-bottom': SPACING,
		'margin-left': SPACING,
		'box-sizing': SPACING,
		
		// size properties
		'min-width': SIZE,
		'width': SIZE,
		'max-width': SIZE,
		'min-height': SIZE,
		'height': SIZE,
		'max-height': SIZE,
		
		// position properties
		'position': POSITION,
		'top': POSITION,
		'right': POSITION,
		'bottom': POSITION,
		'left': POSITION,
		'clip': POSITION,
		'z-index': POSITION,
		
		// border properties
		'border': BORDERS,
		'border-style': BORDERS,
		'border-width': BORDERS,
		'border-color': BORDERS,
		'border-top': BORDERS,
		'border-right': BORDERS,
		'border-bottom': BORDERS,
		'border-left': BORDERS,
		'border-top-width': BORDERS,
		'border-right-width': BORDERS,
		'border-bottom-width': BORDERS,
		'border-left-width': BORDERS,
		'border-top-style': BORDERS,
		'border-right-style': BORDERS,
		'border-bottom-style': BORDERS,
		'border-left-style': BORDERS,
		'border-top-color': BORDERS,
		'border-right-color': BORDERS,
		'border-bottom-color': BORDERS,
		'border-left-color': BORDERS,
		'border-radius': BORDERS,
		'border-top-right-radius': BORDERS,
		'border-top-left-radius': BORDERS,
		'border-bottom-right-radius': BORDERS,
		'border-bottom-left-radius': BORDERS,
		'border-image-outset': BORDERS,
		'border-image-repeat': BORDERS,
		'border-image-slice': BORDERS,
		'border-image-source': BORDERS,
		'border-image-width': BORDERS,
		'outline': BORDERS,
		'outline-color': BORDERS,
		'outline-style': BORDERS,
		'outline-width': BORDERS,
		
		// background properties
		'background': BACKGROUND,
		'background-color': BACKGROUND,
		'background-image': BACKGROUND,
		'background-position': BACKGROUND,
		'background-attachment': BACKGROUND,
		'background-repeat': BACKGROUND,
		'background-clip': BACKGROUND,
		'background-origin': BACKGROUND,
		'background-size': BACKGROUND,
		
		// font properties
		'font': FONT,
		'font-family': FONT,
		'font-style': FONT,
		'font-weight': FONT,
		'font-size': FONT,
		'font-variant': FONT,
		'font-size-adjust': FONT,
		'font-stretch': FONT,
		'text-indent': FONT,
		'line-height': FONT,
		'word-spacing': FONT,
		'letter-spacing': FONT,
		'color': FONT,
		'text-align': FONT,
		'text-align-last': FONT,
		'text-justify': FONT,
		'text-transform': FONT,
		'white-space': FONT,
		'word-break': FONT,
		'word-wrap': FONT,
		'text-decoration': FONT,
		'text-decoration-color': FONT,
		'text-decoration-line': FONT,
		'text-decoration-style': FONT,
		'direction': FONT,
		'text-overflow': FONT,
		
		// column properties
		'columns': COLUMNS,
		'column-count': COLUMNS,
		'column-gap': COLUMNS,
		'column-rule': COLUMNS,
		'column-rule-color': COLUMNS,
		'column-rule-style': COLUMNS,
		'column-rule-width': COLUMNS,
		'column-fill': COLUMNS,
		'column-span': COLUMNS,
		'column-width': COLUMNS,
		
		// effects properties
		'box-shadow': EFFECTS,
		'text-shadow': EFFECTS,
		
		// transform properties
		'transform': TRANSFORM,
		'-webkit-transform': TRANSFORM,
		'transform-origin': TRANSFORM,
		'-webkit-transform-origin': TRANSFORM,
		'backface-visibility': TRANSFORM,
		'perspective': TRANSFORM,
		'perspective-origin': TRANSFORM,
		'transform-style': TRANSFORM,
		
		// transform 3d properties
	};

}).factory('CssParser', function() {

var RULE = 0,
	ATRULE = 1,
	PROPERTY = 2,
	VALUE = 3,
	COMMENT = 4,
	FUNCTION = 5,
	NUMBERVAL = 6,
	TEXTVAL = 7,
	COLORVAL = 8,
	BANGVAL = 9,
	UNITVAL = 10,
	IMPORTANTVAL = 11;
	
var COLORS = {
	'transparent': '',
	'black': '#000000',
	'navy': '#000080',
	'darkblue': '#00008B',
	'mediumblue': '#0000CD',
	'blue': '#0000FF',
	'darkgreen': '#006400',
	'green': '#008000',
	'teal': '#008080',
	'darkcyan': '#008B8B',
	'deepskyblue': '#00BFFF',
	'darkturquoise': '#00CED1',
	'mediumspringgreen': '#00FA9A',
	'lime': '#00FF00',
	'springgreen': '#00FF7F',
	'aqua': '#00FFFF',
	'cyan': '#00FFFF',
	'midnightblue': '#191970',
	'dodgerblue': '#1E90FF',
	'lightseagreen': '#20B2AA',
	'forestgreen': '#228B22',
	'seagreen': '#2E8B57',
	'darkslategray': '#2F4F4F',
	'limegreen': '#32CD32',
	'mediumseagreen': '#3CB371',
	'turquoise': '#40E0D0',
	'royalblue': '#4169E1',
	'steelblue': '#4682B4',
	'darkslateblue': '#483D8B',
	'mediumturquoise': '#48D1CC',
	'indigo': '#4B0082',
	'darkolivegreen': '#556B2F',
	'cadetblue': '#5F9EA0',
	'cornflowerblue': '#6495ED',
	'mediumaquamarine': '#66CDAA',
	'dimgray': '#696969',
	'slateblue': '#6A5ACD',
	'olivedrab': '#6B8E23',
	'slategray': '#708090',
	'lightslategray': '#778899',
	'mediumslateblue': '#7B68EE',
	'lawngreen': '#7CFC00',
	'chartreuse': '#7FFF00',
	'aquamarine': '#7FFFD4',
	'maroon': '#800000',
	'purple': '#800080',
	'olive': '#808000',
	'gray': '#808080',
	'skyblue': '#87CEEB',
	'lightskyblue': '#87CEFA',
	'blueviolet': '#8A2BE2',
	'darkred': '#8B0000',
	'darkmagenta': '#8B008B',
	'saddlebrown': '#8B4513',
	'darkseagreen': '#8FBC8F',
	'lightgreen': '#90EE90',
	'mediumpurple': '#9370DB',
	'darkviolet': '#9400D3',
	'palegreen': '#98FB98',
	'darkorchid': '#9932CC',
	'yellowgreen': '#9ACD32',
	'sienna': '#A0522D',
	'brown': '#A52A2A',
	'darkgray': '#A9A9A9',
	'lightblue': '#ADD8E6',
	'greenyellow': '#ADFF2F',
	'paleturquoise': '#AFEEEE',
	'lightsteelblue': '#B0C4DE',
	'powderblue': '#B0E0E6',
	'firebrick': '#B22222',
	'darkgoldenrod': '#B8860B',
	'mediumorchid': '#BA55D3',
	'rosybrown': '#BC8F8F',
	'darkkhaki': '#BDB76B',
	'silver': '#C0C0C0',
	'mediumvioletred': '#C71585',
	'indianred': '#CD5C5C',
	'peru': '#CD853F',
	'chocolate': '#D2691E',
	'tan': '#D2B48C',
	'lightgray': '#D3D3D3',
	'thistle': '#D8BFD8',
	'orchid': '#DA70D6',
	'goldenrod': '#DAA520',
	'palevioletred': '#DB7093',
	'crimson': '#DC143C',
	'gainsboro': '#DCDCDC',
	'plum': '#DDA0DD',
	'burlywood': '#DEB887',
	'lightcyan': '#E0FFFF',
	'lavender': '#E6E6FA',
	'darksalmon': '#E9967A',
	'violet': '#EE82EE',
	'palegoldenrod': '#EEE8AA',
	'lightcoral': '#F08080',
	'khaki': '#F0E68C',
	'aliceblue': '#F0F8FF',
	'honeydew': '#F0FFF0',
	'azure': '#F0FFFF',
	'sandybrown': '#F4A460',
	'wheat': '#F5DEB3',
	'beige': '#F5F5DC',
	'whitesmoke': '#F5F5F5',
	'mintcream': '#F5FFFA',
	'ghostwhite': '#F8F8FF',
	'salmon': '#FA8072',
	'antiquewhite': '#FAEBD7',
	'linen': '#FAF0E6',
	'lightgoldenrodyellow': '#FAFAD2',
	'oldlace': '#FDF5E6',
	'red': '#FF0000',
	'fuchsia': '#FF00FF',
	'magenta': '#FF00FF',
	'deeppink': '#FF1493',
	'orangered': '#FF4500',
	'tomato': '#FF6347',
	'hotpink': '#FF69B4',
	'coral': '#FF7F50',
	'darkorange': '#FF8C00',
	'lightsalmon': '#FFA07A',
	'orange': '#FFA500',
	'lightpink': '#FFB6C1',
	'pink': '#FFC0CB',
	'gold': '#FFD700',
	'peachpuff': '#FFDAB9',
	'navajowhite': '#FFDEAD',
	'moccasin': '#FFE4B5',
	'bisque': '#FFE4C4',
	'mistyrose': '#FFE4E1',
	'blanchedalmond': '#FFEBCD',
	'papayawhip': '#FFEFD5',
	'lavenderblush': '#FFF0F5',
	'seashell': '#FFF5EE',
	'cornsilk': '#FFF8DC',
	'lemonchiffon': '#FFFACD',
	'floralwhite': '#FFFAF0',
	'snow': '#FFFAFA',
	'yellow': '#FFFF00',
	'lightyellow': '#FFFFE0',
	'ivory': '#FFFFF0',
	'white': '#FFFFFF'
}
	
var SHORTHAND_STYLES = {
	'border': {
		'number': ['border-width'],
		'text': ['border-style'],
		'color': ['border-color']
	},
	'margin': {
		'number': ['margin-top','margin-right','margin-bottom','margin-left'],
		hasBoxModel: true
	},
	'padding': {
		'number': ['padding-top','padding-right','padding-bottom','padding-left'],
		hasBoxModel: true
	},
	'border-width': {
		'number': ['border-top-width','border-right-width','border-bottom-width','border-left-width'],
		hasBoxModel: true
	},
	'border-style': {
		'text': ['border-top-style','border-right-style','border-bottom-style','border-left-style'],
		hasBoxModel: true
	},
	'border-color': {
		'color': ['border-top-color','border-right-color','border-bottom-color','border-left-color'],
		hasBoxModel: true
	},
	'background': {
		'number': ['background-position-x', 'background-position-y'],
		'color': ['background-color'],
		'text': ['background-image', 'background-repeat', 'background-attachment'],
		//'url': []
	},
	'background-position': {
		'number': ['background-position-x', 'background-position-y']
	},
	'background-size': {
		'number': ['background-size-x', 'background-size-y']
	},
	// need to add support for second radius numbers on this shorthand property
	'border-radius': {
		'number': ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
		hasBoxModel: true
	},
	'box-shadow': {
		'number': ['shadow-h', 'shadow-v', 'shadow-blur', 'shadow-spread'],
		'color': ['shadow-color'],
		'text': ['shadow-inset']
	},
	'column-rule': {
		'color': ['column-rule-color'],
		'text': ['column-rule-style'],
		'number': ['column-rule-width']
	},
	'columns': {
		'number': ['column-width', 'column-count']
	},
	'flex': {
		'number': ['flex-grow', 'flex-shrink', 'flex-basis']
	},
	// this one isn't quite correct, should really be based on the type of value more specifically
	'font': {
		'number': ['font-size', 'line-height'],
		'text': ['font-style', 'font-variant', 'font-weight', 'font-family']
	},
	// note that URL is not really type, it's a function
	'list-style': {
		'text': ['list-style-type', 'list-style-position'],
		'url': ['list-style-image']
	},
	'outline': {
		'color': ['outline-color'],
		'number': ['outline-width'],
		'text': ['outline-style']
	},
	'text-shadow': {
		'color': ['shadow-color'],
		'number': ['shadow-h','shadow-v', 'shadow-blur']
	},
	'transform-origin': {
		'number': ['transform-origin-x', 'transform-origin-y', 'transform-origin-z']
	},
	'-webkit-transform-origin': {
		'number': ['transform-origin-x', 'transform-origin-y', 'transform-origin-z']
	}
	
};
	
var ps = {
	getPos: function(startPos, handle, j) {
		
		return {
			start: {
				line: startPos.line,
				ch: startPos.ch
			},
			end: {
				line: handle,
				ch: j
			}
		};
	},
	
	modifySubVal: function(mode, subval, curToken) {
		if (COLORS[subval] != undefined) {
			mode = COLORVAL;
		}
		if (mode == UNITVAL) {
			subval.unit = curToken;
		} else if (mode == TEXTVAL) {
			subval.value = curToken;
		} else if (mode == NUMBERVAL) {
			subval.value = Number(curToken);
		} else if (mode == COLORVAL) {
			subval.value = curToken;
		}
		return subval;
	},
	
	getSubProps: function(curProp, vals) {
		var mapping = SHORTHAND_STYLES[curProp.name];
		if (mapping != undefined) {
			var newVals = [];
			var positions = {};
			angular.forEach(vals, function(val) {
				var type = val.type;
				var typeIndex = positions[type];
				if (typeIndex == undefined) {
					typeIndex = 0;
				} else {
					typeIndex++;
				}
				val.name = mapping[type][typeIndex];
				val.shorthand = true;
				newVals.push(val);
				positions[type] = typeIndex;
				
				// go one level deeper here (shorthands of shorthands)
				// how should box model properties be handled?
			});
			
			return newVals;
		
		} else {
			return undefined;
		}
	},
	
	parseAlt: function(editor) {
		var t0 = performance.now();
		
		var COLORFNS = ['rgb','rgba','hsl','hsla'];
		var MULTIPARTPROPS = ['background', 'background-image', 'background-repeat', 'background-offset', 'box-shadow'];
		var RULE = 0,
			ATRULE = 1,
			MEDIAPROP = 2,
			PROPERTY = 3,
			PROPERTYFN = 6,
			COMMENT = 5,
			//VALNUM = 7,
			VALTEXT = 8,
			VALCOLOR = 9,
			VALUNIT = 10,
			VALGROUP = 11,
			VALUE = 12;
			
		var TYPE_NAMES = {};
		TYPE_NAMES[VALTEXT] = 'text';
		TYPE_NAMES[VALUNIT] = 'number';
		TYPE_NAMES[VALCOLOR] = 'color';
		
			
		var rules = [];
		var shorthandCounter = {
			colorCount: 0,
			textCount: 0,
			numberCount: 0
		};
		var comments = [];
		var curToken = '';
		var curNode;
		var tree = [];
		var isNumberRegex = /[0-9-\.]/,
			isTextRegex = /[a-zA-Z-\%]/,
			isWhitespaceRegex = /\s/,
			mode = RULE,
			prevChar,
			startPos;
			
		// expands shorthand properties into regular properties
		function addSubNodes(parent, name, secondLevel) {
			var shorthand = SHORTHAND_STYLES[name];
			if (shorthand != undefined) {
				var propNames = [];
				var typeName = TYPE_NAMES[curNode.type];
				if (typeName != undefined) {
					var count = shorthandCounter[typeName+'Count'];
					if (secondLevel) {
						count = 0;
					}
					
					// assign property based on count
					if (shorthand.hasBoxModel) {
						parent.hasBoxModel = true;
						// assign all 4 properties
						if (count == 0) {
							propNames = shorthand[typeName];
							
						// assign 2nd and 4th properties
						} else if (count == 1) {
							propNames.push(shorthand[typeName][1]);
							propNames.push(shorthand[typeName][3]);
							
						// assign matching 3rd or 4th property
						} else {
							propNames.push(shorthand[typeName][count]);
						}
						
					// assign single property
					} else {
						if (shorthand[typeName] != undefined) {
							propNames.push(shorthand[typeName][count]);
						}
					}
					shorthandCounter[typeName+'Count']++;
				}
				angular.forEach(propNames, function(propName) {
					if (propName != undefined) {
						node = {
							value: propName,
							parent: parent.parent,
							type: PROPERTY,
							editor: editor,
							pos: curNode.pos,
							valobj: curNode,
							implicit: true
						};
						parent[propName] = node;
						if (parent.type == PROPERTY) {
							parent.parent.children.push(node);
							addSubNodes(parent, propName, true);
						}
					}
				});
			}
			// add to shorthand property counter by type
		}
		
		function resetShorthandCounter() {
			shorthandCounter.colorCount = 0;
			shorthandCounter.textCount = 0;
			shorthandCounter.numberCount = 0;
		}
		
		function addNode(type, value, parent, startPos) {
			curNode = {
				parent: parent,
				type: type,
				editor: editor,
				pos: {
					start: startPos
				}
			};
			if (startPos != undefined) {
				curNode.pos.start = startPos;
			}
			if (value != undefined) {
				curNode.value = value;
			}
			
			if (type == PROPERTY) {
				if (MULTIPARTPROPS.indexOf(value) != -1) {	// is multipart rule
					curNode.isGrouped = true;
					
				}
				if (SHORTHAND_STYLES[value] != undefined || value.indexOf('transform') != -1) {
					curNode.isShorthand = true;
				}
				resetShorthandCounter();
			}
			
			if (parent == undefined) {
				tree.push(curNode);
				
			} else {
				// add child structure for grouped and shorthand properties
				if (parent.isShorthand && parent.isGrouped) {
					if (parent.children == undefined) {
						parent.children = [];
					}
					var groupedNode = {
						parent: parent,
						type: VALGROUP,
						pos: startPos,
						children: [curNode],
					};
					curNode.parent = groupedNode;
					parent.children.push(groupedNode);
					resetShorthandCounter();
				
				} else if (parent.type != PROPERTY || 
						   parent.type == VALGROUP || 
						   parent.isShorthand || 
						   parent.isGrouped) 
				{
					if (parent.children == undefined) {
						parent.children = [];
					}
					parent.children.push(curNode);
					
				} else {
					parent.valobj = curNode;
				}
				
				// add any new properties defined in shorthand
				if (parent.isShorthand || parent.isGrouped || parent.type == VALGROUP) {
					var propName = (parent.type == VALGROUP) ? parent.parent.value : parent.value;
					addSubNodes(curNode.parent, propName);
				}
				
			}
			curToken = '';
			if (type == RULE) {
				rules.push(curNode);
			}
		}
		
		function moveUp(endPos, num) {
			curNode.pos.end = endPos;
			var parent = curNode.parent;
			if (parent && parent.colorCount != undefined) {
				parent.colorCount = 0;
				parent.textCount = 0;
				parent.numberCount = 0;
			}
			var prevNode = curNode;
			if (num != undefined) {
				var parentEnd = { line: endPos.line, ch: endPos.ch+1 };
				if (num == 2) {
					if (parent.pos != undefined) {
						parent.pos.end = parentEnd;
					}
					curNode = parent.parent;
				} else if (num == 3) {
					//curNode.parent.pos.end = endPos;
					parent.parent.pos.end = parentEnd;
					curNode = parent.parent.parent;
				}
			} else {
				curNode = parent;
			}
			curToken = '';
			//console.log('move from '+prevNode.value+'('+prevNode.type+') to '+(curNode != undefined ? curNode.value+'('+curNode.type+')' : 'root'));
		}
		
		function addGroup(endPos) {
			if (isShortGrouped()) {
				moveUp(endPos, 2);
			} else {
				moveUp(endPos);
			}
		}
		
		function isShortGrouped() {
			return curNode.parent != undefined && 
				   curNode.parent.parent != undefined && 
				   curNode.parent.parent.isShorthand && 
				   curNode.parent.parent.isGrouped;
		}
			
		editor.eachLine(function(handle) {
			var line = handle.text;
			prevChar = '\n';
			
			for (var j=0, charCount=line.length; j<charCount; j++) {
				var char = line[j];
				if (curNode == undefined) {
					mode = RULE;
				} else {
					mode = curNode.type;
				}
				
				switch(mode) {
					case RULE:
						if (char == '{') {
							addNode(RULE, curToken.trim(), curNode, { line:handle, ch:j });
						
						} else if (char == ':') {
							var tokenTrim = curToken.trim();
							var char = j-tokenTrim.length;
							addNode(PROPERTY, tokenTrim, curNode, { line:handle, ch:char });
						
						} else if (char == '}') {
							moveUp({ line:handle, ch:j });
							
						} else if (char == '@') {
							addNode(ATRULE, undefined, curNode, { line:handle, ch:j });
							
						} else if (char == '*' && prevChar == '/') {
							addNode(COMMENT, undefined, curNode, { line:handle, ch:j-1 });
							curToken += char;
							
						} else {
							curToken += char;
						}
						break;
						
					case ATRULE:
						if (char == ':') {
							addNode(PROPERTY, curToken.trim(), curNode, { line:handle, ch:j });
						
						} else if (char == '{') {
							var tokenTrimmed = curToken.trim();
							if (tokenTrimmed.length > 0 && curNode.value == 'media') {
								addNode(RULE, tokenTrimmed, curNode, { line:handle, ch:j });
								
							} else {
								curNode.value = tokenTrimmed;
								curToken = '';
							}
						
						} else if (char == '}') {
							moveUp({ line:handle, ch:j });
							
						} else if (curNode.value == undefined && curToken.length > 0 && char.match(isWhitespaceRegex)) {
							curNode.value = curToken.trim();
						
						} else if (char == '(') {
							addNode(MEDIAPROP, undefined, curNode, { line:handle, ch:j });
							
						} else {
							curToken += char;
						}
						break;
						
					case MEDIAPROP:
						if (char == ':') {
							curNode.type = PROPERTY;
							curNode.value = curToken.trim();
							curToken = '';
						
						} else if (char == ')') {
							moveUp({ line:handle, ch:j });
							
						} else {
							curToken += char;
						}
						break;
						
					case PROPERTY:
					case VALGROUP:
					case PROPERTYFN:
						if (char.match(isNumberRegex)) {
							addNode(VALUNIT, Number(char), curNode, { line:handle, ch:j });
							curToken += char;
							
						} else if (char.match(isTextRegex)) {
							addNode(VALTEXT, char, curNode, { line:handle, ch:j });
							curToken += char;
							
						} else if (char == '#') {
							addNode(VALCOLOR, char, curNode, { line:handle, ch:j });
							curToken += char;
							
						} else if (char == '!') {
							curNode.important = true;
							curToken += char;
						
						} else if (char == '"' || char == "'") {
							addNode(VALTEXT, undefined, curNode, { line:handle, ch:j });
							curNode.quoteChar = char;
						
						} else if (char == ')' || char == ';' || char == '{') {
							moveUp({ line:handle, ch:j });
						
						} else if (char == ',' && mode == VALGROUP) {
							moveUp({ line:handle, ch:j });
						
						} else {
							curToken += char;
						}
						break;
						
					case COMMENT:
						if (char == '/' && prevChar == '*') {
							curToken += char;
							curNode.value = curToken;
							comments.push(curNode);
							moveUp({ line:handle, ch:j });
							
						} else {
							curToken += char;
						}
						break;
					
					case VALTEXT:
						if (curNode.quoteChar != undefined) {
							if (char == curNode.quoteChar) {
								//curNode.value = curToken;
								moveUp({ line:handle, ch:j });
							} else {
								curToken += char;
								curNode.value = curToken;
							}
						
						} else {
							if (char.match(isWhitespaceRegex)) {
								moveUp({ line:handle, ch:j });
								
							} else if (char == ';') {
								if (isShortGrouped()) {
									moveUp({ line:handle, ch:j }, 3);
								} else {
									moveUp({ line:handle, ch:j }, 2);
								}
								
							} else if (char == ',') {
								addGroup({ line:handle, ch:j });
							
							} else if (char == '(') {
								curNode.type = PROPERTYFN;
								curToken = '';
								
							} else if (char == ')') {
								moveUp({ line:handle, ch:j }, 2);
							
							} else {
								curToken += char;
								curNode.value = curToken;
							}
						}
						break;
					
						
					case VALCOLOR:
						if (char.match(isWhitespaceRegex)) {
							moveUp({ line:handle, ch:j });
							
						} else if (char == ';') {
							if (isShortGrouped()) {
								moveUp({ line:handle, ch:j }, 3);
							} else {
								moveUp({ line:handle, ch:j }, 2);
							}
								
						} else if (char == ',') {
							addGroup({ line:handle, ch:j });
						
						} else {
							curToken += char;
							curNode.value = curToken;
						}
						break;
						
					case VALUNIT:
						if (char.match(isWhitespaceRegex)) {
							moveUp({ line:handle, ch:j });
							
						} else if (char.match(isNumberRegex)) {
							curToken += char;
							curNode.value = Number(curToken);
							
						} else if (char == ';') {
							if (isShortGrouped()) {
								moveUp({ line:handle, ch:j }, 3);
							} else {
								moveUp({ line:handle, ch:j }, 2);
							}
						
						} else if (char.match(isTextRegex)) {
							if (curNode.unit == undefined) {
								curNode.unit = '';
							}
							curNode.unit += char;
								
						} else if (char == ',') {
							addGroup({ line:handle, ch:j });
						
						} else if (char == ')') {
							if (curNode.parent != undefined && 
								curNode.parent.parent != undefined && 
								curNode.parent.parent.value == 'media') 
							{
								moveUp({ line:handle, ch:j });
								
							} else {
								moveUp({ line:handle, ch:j }, 2);
							}
						
						} else {
							curToken += char;
						}
						break;
						
					case VALUE:
					//case VALLIST:
					default:
				}
				
				prevChar = char;
			}
		});
		
		var t1 = performance.now();
		console.log("Parsing CSS took " + (t1 - t0) + " milliseconds.");
		
		var parsed = {
			rules: rules,
			comments: comments,
			tree: tree
		};
		console.log(tree);
		//console.log(comments);
		
		return parsed;
		
	},

};

return ps;

});
// loop over characters
// detect if newline, whitespace, letters, token separators

// build object model while parsing
// store line and column numbers while parsing
// using finite state machine
// parse standard css first
// parse sass second
// parse less last
// explore partial sass compiles based on editor changes
// figure out object model lookups based on editor changes

// SASS SUPPORT
// nesting
// variables $variablename
// mixins @include
// selector inheritance @extends
// lists @each, nth, @for, etc.
// math operations and functions: round, percentage, etc.
// color modifiers
// color functions: rgba, fade-out, lighten, etc.
// nth function
// custom functions (run inside sass?)

// mixins for media queries