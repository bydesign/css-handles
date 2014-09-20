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
	
var STYLES = {
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
		'text': ['list-style-type', 'list-style-position']
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
				char: startPos.char
			},
			end: {
				line: i,
				char: j-1
			}
		};
	},
	
	modifySubVal: function(mode, subval, curToken) {
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
						char: j-1
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
						properties: []
					};
					if (curRules.length > 0) {
						rule.parentRule = curRules[0];
					}
					curRules.unshift(rule);
					
					curToken = '';
					
				// end selector definition
				} else if (char == '}') {
					modes.shift();
					parsed.rules.push(curRules[0]);
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
							char: j-1
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