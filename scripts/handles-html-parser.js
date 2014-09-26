angular.module('cssHandles').factory('HtmlParser', function() {

var TAG = 0,
	ATTR = 1,
	ATTRVAL = 2,
	QUOTEDATTRVAL = 3,
	TEXT = 4,
	COMMENT = 5,
	TAGCLOSE = 6;
	
var ps = {
	parse: function(editor) {
		var t0 = performance.now();
		
		var parsed = {
			tags: [],
			tree: [],
			comments: []
		};
		var token = '';
		var curTag = {};
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
		
		function endTag(i, j) {
			curTag.selfclosing = prevChar=='/';
			if (curTag.tagName == undefined) {
				curTag.tagName = token;
			}
			curTag.pos = {
				start: startPos,
				end: {
					line: i,
					ch: j+1
				}
			};
			tags.push(curTag);
			//console.log(curTag);
			var parent = curTag;
			if (curTag.selfclosing) {
				parent = curTag.parent;
			}
			
			// start over with new tag object
			curTag = {
				parent: parent
			};
			token = '';
			mode = TEXT;
		}
		
		function addProp(tag, name, value) {
			if (value == undefined) {
				value = '';
			}
			tag[name] = value;
		}
		
		var lines = editor.getValue().split('\n');
		for (var i=0, len=lines.length; i<len; i++) {
			var line = lines[i];
			prevChar = '\n';
			
			for (var j=0, charCount=line.length; j<charCount; j++) {
				var char = line[j];
				
				switch(mode) {
					case TAG:
						if (token.length == 0) {
							if (whitespace.indexOf(char) > -1) {
								mode = TEXT;
								
							} else if (char == '/') {
								mode = TAGCLOSE;
							
							} else if (char == '!') {
								mode = COMMENT;
							
							} else {
								token += char;
							}
						} else {
							if (whitespace.indexOf(char) > -1) {
								curTag.tagName = token;
								token = ''
								mode = ATTR;
								
							} else if (char == '>') {
								endTag(i, j);
								
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
							// tag closed, so set end position
							curTag.parent.pos.end = {
								line: i,
								ch: j+1
							};
							// tag closed, so new tag will be parented under grandparent
							curTag.parent = curTag.parent.parent;
							
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
							endTag(i, j);
							
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
							endTag(i, j);
							
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
							startPos = {
								line: i,
								ch: j
							};
						}
						break;
						
					case COMMENT:
						if (token.length == 2 && token != '--') {
							mode = TEXT;
						
						} else if (char == '>' && prevChar == '-' && prevPrevChar == '-') {
							mode = TEXT;
							token = '';
						}
						token += char;
						
						break;
						
					default:
						
				}
				prevPrevChar = prevChar;
				prevChar = char;
			}
		}
		
		var t1 = performance.now();
		console.log("Parsing HTML took " + (t1 - t0) + " milliseconds.");
		
		return tags;
	
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