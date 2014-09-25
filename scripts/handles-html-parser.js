angular.module('cssHandles').factory('HtmlParser', function() {

var TAG = 0,
	ATTR = 1,
	ATTRVAL = 2,
	QUOTEDATTRVAL = 3,
	TEXT = 4,
	COMMENT = 5,
	TAGCLOSE = 6;
	
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
	
	parse: function(editor) {
		console.log('parsing');
		
		//var lines = text.split('\n');
		var parsed = {
			tags: [],
			tree: [],
			comments: []
		};
		var token = '';
		var curTag = {};
		//var modes = [RULE];
		var mode = TEXT;
		var isNumberRegex = /[0-9-\.]/,
			isTextRegex = /[a-zA-Z\%]/,
			whitespace = ' \t\n\r\v',
			tags = [],
			tree = [],
			prevChar,
			prePreChar,
			startPos,
			quoteChar,
			parentTag,
			curProp,
			quoteChar;
			
		function addTag(tag) {
			tags.push(tag);
			console.log(tag);
			curTag = {};
		}
		
		function addProp(tag, name, value) {
			if (value == undefined) {
				value = '';
			}
			tag[name] = value;
		}
			
		editor.eachLine(function(handle) {
			var line = handle.text;
			prevChar = '\n';
			
			for (var j=0, charCount=line.length; j<charCount; j++) {
				//var mode = modes[0];
				var char = line[j];
				
				switch(mode) {
					case TAG:
						if (token.length == 0) {
							if (whitespace.indexOf(char) > -1) {
								mode = TEXT;
								
							} else if (char == '/') {
								mode = TAGCLOSE;
							
							} else {
								token += char;
							}
						} else {
							if (whitespace.indexOf(char) > -1) {
								curTag.tagName = token;
								token = ''
								mode = ATTR;
								
							} else if (char == '>') {
								curTag.selfclosing = prevChar == '/';
								curTag.tagName = token;
								addTag(curTag);
								token = '';
								mode = TEXT;
								
							} else {
								token += char;
							}
						}
						
						break;
					
					case TAGCLOSE:
						if (whitespace.indexOf(char) > -1) {
							mode = TEXT
							token += char;
							
						} else if (char == '>') {
							mode = TEXT;
							
						} else {
							token += char;
						}
						break;
					
					case ATTR:
						if (whitespace.indexOf(char) > -1) {
							if (token.length > 0) {
								addProp(curTag, token);
								curProp = '';
								token = '';
							}
						
						} else if (char == '=') {
							mode = ATTRVAL;
							curProp = token;
							addProp(curTag, token);
							token = '';
						
						} else if (char == '>') {
							addTag(curTag);
							token = '';
							mode = TEXT;
							
						} else {
							token += char;
						}
						break;
					
					case ATTRVAL:
						if (token.length == 0 && (char == '"' || char == "'")) {
							mode = QUOTEDATTRVAL;
							quoteChar = char;
						
						} else if (whitespace.indexOf(char) > -1) {
							mode = ATTR;
							addProp(curTag, curProp, token);
							token = '';
						
						} else if (char == '>') {
							addProp(curTag, curProp, token);
							addTag(curTag);
							token = '';
							mode = TEXT;
							
						} else {
							token += char;
						}
					
						break;
						
					case QUOTEDATTRVAL:
						if (char == quoteChar) {
							addProp(curTag, curProp, token);
							token = '';
							quoteChar = undefined;
							mode = ATTR;
						
						} else {
							token += char;
						}
						break;
						
					case TEXT:
						if (char == '<') {
							mode = TAG;
							token = '';
						}
						break;
						
					case COMMENT:
						break
						
					default:
						
				}
				prevPrevChar = prevChar;
				prevChar = char;
			}
		});
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