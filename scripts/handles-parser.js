angular.module('cssHandles').factory('CssParser', function() {

var ps = {
	parse: function(text) {
		console.log('parsing');
		var RULE = 0,
			ATRULE = 1,
			PROPERTY = 2,
			VALUE = 3,
			COMMENT = 4;
		
		var lines = text.split('\n');
		var parsed = {
			rules: [],
			comments: []
		};
		var curToken = '';
		var curRules = [];
		var curProp = {};
		var modes = [RULE];
		var prevChar,
			startPos;
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
						curProp.name = curToken;
						curToken = '';
					} else {
						curToken += char;
					}
				
				// end property value
				} else if (char == ';') {
					modes[0] = PROPERTY;
					curProp.value = curToken;
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
					curProp = {};
					curToken = '';
				
				} else {
					if (curToken.length == 0) {
						startPos = {
							line: i,
							char: j-1
						};
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