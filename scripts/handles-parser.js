angular.module('cssHandles').factory('CssParser', function() {

var ps = {
	parse: function(text) {
		console.log('parsing');
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
							pos: {
								start: {
									line: startPos.line,
									char: startPos.char
								},
								end: {
									line: i,
									char: j
								}
							}
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
						if (mode == TEXTVAL) {
							subval.text = curToken;
							vals.push(subval);
							modes.shift();
							
						} else if (mode == NUMBERVAL) {
							subval.number = Number(curToken);
							vals.push(subval);
							modes.shift();
						
						} else if (mode == UNITVAL) {
							subval.unit = curToken;
							vals.push(subval);
							modes.shift();
						}
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
					if (mode == TEXTVAL && [COLORFNS].indexOf(curToken) != -1) {
						subval.type = 'color';
						subval.fn = curToken;
					}
					//console.log('function name: ' + curToken);
					modes.unshift(FUNCTION);
					//curToken = '';
						
				// end function
				} else if (char == ')') {
					//console.log('function value: ' + curToken);
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
					if (mode == UNITVAL) {
						subval.unit = curToken;
					} else if (mode == TEXTVAL) {
						subval.text = curToken;
					} else if (mode == NUMBERVAL) {
						subval.number = Number(curToken);
					} else if (mode == COLORVAL) {
						subval.color = curToken;
					}
					
					if (vals.length > 0) {
						vals.push(subval);
						curProp.value = vals;
					
					} else {
						curProp.value = subval;
					}
					curProp.pos = {
						start: {
							line: startPos.line,
							char: startPos.char
						},
						end: {
							line: i,
							char: j
						}
					};
					
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
							subval.number = Number(curToken);
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