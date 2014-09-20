angular.module('cssHandles').factory('CssParser', function() {

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
		'number': ['margin-top','margin-right','margin-bottom','margin-left']
	},
	'padding': {
		'number': ['padding-top','padding-right','padding-bottom','padding-left']
	},
	'border-width': {
		'number': ['border-top-width','border-right-width','border-bottom-width','border-left-width']
	},
	'background': {
		'number': ['background-position-x', 'background-position-y'],
		'color': ['background-color'],
		'text': ['background-repeat', 'background-attachment'],
		'url': ['background-image']
	},
	'background-position': {
		'number': ['background-position-x', 'background-position-y']
	},
	'background-size': {
		'number': ['background-size-x', 'background-size-y']
	},
	// need to add support for second radius numbers on this shorthand property
	'border-radius': {
		'number': ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius']
	},
	'box-shadow': {
		'number': ['box-shadow-h', 'box-shadow-v', 'blur', 'spread'],
		'color': ['box-shadow-color'],
		'text': ['inset']
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
		'color': ['text-shadow-color'],
		'number': ['text-shadow-h','text-shadow-v', 'text-shadow-blur']
	},
	'transform-origin': {
		'number': ['transform-origin-x', 'transform-origin-y', 'transform-origin-z']
	}
	
};
	
var ps = {
	getPos: function(startPos, i, j) {
		
		return {
			start: {
				line: startPos.line,
				ch: startPos.ch
			},
			end: {
				line: i,
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
			});
			
			return newVals;
		
		} else {
			return undefined;
		}
	},
	
	parse: function(text) {
		console.log('parsing');
		
		var COLORFNS = ['rgb','rgba','hsl','hsla'];
		var lines = text.split('\n');
		var parsed = {
			rules: [],
			comments: []
		};
		var curToken = '';
		var curRules = [];
		var curProp = {};
		var modes = [RULE];
		var isNumberRegex = /[0-9-\.]/,
			isTextRegex = /[a-zA-Z\%]/,
			prevChar,
			startPos,
			vals = [],
			subval = {};
		for (i=0, lineCount=lines.length; i<lineCount; i++) {
			var line = lines[i];
			for (var j=0, charCount=line.length; j<charCount; j++) {
				var mode = modes[0];
				var char = line[j];
				
				// start comment
				if (mode != COMMENT && char == '*' && prevChar == '/') {
					startPos = {
						line: i,
						ch: j
					};
					curToken += char;
					modes.unshift(COMMENT);
					
				// continue or end comment
				} else if (mode == COMMENT) {
					curToken += char;
					if (char == '/' && prevChar == '*') {
						parsed.comments.push({
							text: curToken,
							pos: ps.getPos(startPos, i, j)
						});
						curToken = '';
						modes.shift();
					}
				
				// handle whitespace
				} else if (' \t\n\r\v'.indexOf(char) > -1) {
					if (curToken.length == 0) {
						prevChar = char;
						continue;
					
					} else if (mode == ATRULE) {
						curToken += char;
							
					} else if (modes.indexOf(VALUE) != -1) {
						subval = ps.modifySubVal(mode, subval, curToken);
						subval.pos = ps.getPos(startPos, i, j);
						vals.push(subval);
						modes.shift();
						subval = {};
						curToken = '';
					}
				
				// start @rule
				} else if (char == '@') {
					modes.unshift(ATRULE);
					curToken += char;
								
				// start selector definition
				} else if (char == '{') {
					modes.unshift(PROPERTY);
					var rule = {
						selector: curToken.trim(),
						pos: {
							start: startPos
						},
						properties: []
					};
					rule.atrule = modes.indexOf(ATRULE) != -1;
					
					if (curRules.length > 0) {
						rule.parentRule = curRules[0];
					}
					curRules.unshift(rule);
					
					curToken = '';
					
				// end selector definition
				} else if (char == '}') {
					modes.shift();
					var rule = curRules[0];
					rule.pos.end = {
						line: i,
						ch: j
					};
					parsed.rules.push(rule);
					curRules.shift();
					curToken = '';
					
				// end property name
				} else if (char == ':') {
					if (mode == PROPERTY) {
						modes[0] = VALUE;
						curProp.name = curToken.trim();
						curToken = '';
						//console.log(curProp.name);
					} else {
						curToken += char;
					}
					
				// start function
				} else if (char == '(') {
					if (mode == TEXTVAL) {
						if ([COLORFNS].indexOf(curToken) != -1) {
							subval.type = 'color';
							subval.fn = curToken;
						} else {
							subval.type = curToken;
						}
						curToken = '';
					}
					//console.log('function name: ' + curToken);
					modes.unshift(FUNCTION);
					//curToken = '';
						
				// end function
				} else if (char == ')') {
					//console.log('function value: ' + curToken);
					//subval.value = curToken;
					modes.shift();
					//curToken = '';
				
				// parse commas
				} else if (char == ',') {
					//console.log('comma');
					if (mode = FUNCTION) {
						console.log(subval);
						console.log('function parameter: ' + curToken);
					} else if (mode = VALUE) {
						console.log('multi-part value');
					}
				
				// end property value
				} else if (char == ';') {
					subval = ps.modifySubVal(mode, subval, curToken);
					
					if (vals.length > 0) {
						subval.pos = ps.getPos(startPos, i, j);
						vals.push(subval);
						curProp.values = vals;
						subprops = ps.getSubProps(curProp, vals);
						if (subprops != undefined) {
							curRules[0].properties = curRules[0].properties.concat(subprops);
						}
					
					} else {
						curProp.type = subval.type;
						curProp.value = subval.value;
						curProp.unit = subval.unit;
						curProp.pos = ps.getPos(startPos, i, j);
					}
					
					curRules[0].properties.push(curProp);
					modes.shift();
					modes[0] = PROPERTY;
					vals = [];
					subval = {};
					curProp = {};
					curToken = '';
				
				} else {
					if (curToken.length == 0) {
						startPos = {
							line: i,
							ch: j
						};
						if (mode == VALUE) {
							if (char.match(isNumberRegex)) {
								modes.unshift(NUMBERVAL);
								subval.type = 'number';
							} else if (char.match(isTextRegex)) {
								modes.unshift(TEXTVAL);
								subval.type = 'text';
							} else if (char == '#') {
								modes.unshift(COLORVAL);
								subval.type = 'color';
							} else if (char == '!') {
								modes.unshift(IMPORTANTVAL);
								subval.type = 'important';
							}
						}
					} else {
						if (mode == NUMBERVAL && char.match(isTextRegex)) {
							modes[0] = UNITVAL;
							subval.value = Number(curToken);
							curToken = '';
						}
					}
					curToken += char;
				}
				prevChar = char;
			}
		}
		console.log(parsed);
		
		return parsed;
	
	}
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