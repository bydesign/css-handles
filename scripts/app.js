var css = {
	parse: module.exports
};

angular.module('cssHandles', ['ui.codemirror']);
//angular.bootstrap(document, ['cssHandles']);
	
	
	/*this.keys = {
		PLUS: 187,
		MINUS: 189,
		SPACE: 32,
		CMDL: 91,
		CMDR: 93,
		CTRL: 17,
		ZERO: 48,
		TAB: 9,
		B: 66,
		M: 77,
		P: 80,
		D: 68,
		E: 69,
		C: 67,
		T: 84,
		R: 82,
		F: 70,
		S: 83,
		G: 71,
		Z: 90,
		F: 70,
	};
	$(document).focus();
	
	angular.element(this.iframe.contentDocument).on('keydown', function(e) {
		console.log('key down: ' + e.keyCode);
		var key = e.keyCode;
		if (key == that.keys.SPACE) {
			$scope.pan = true;
			e.preventDefault();
		} else if (key == that.keys.PLUS) {
			that.zoomIn();
		} else if (key == that.keys.MINUS) {
			that.zoomOut()
		} else if (key == that.keys.ZERO) {
			that.zoom(1);
			$scope.panX = 0;
			$scope.panY = 0;
		} else if (key == that.keys.TAB) {
			$scope.showControls = !$scope.showControls;
			e.preventDefault();
		} else if (key == that.keys.S) {
			$scope.tabId = 1;
		} else if (key == that.keys.Z) {
			$scope.tabId = 2;
		} else if (key == that.keys.P) {
			$scope.tabId = 3;
		} else if (key == that.keys.B) {
			$scope.tabId = 4;
		} else if (key == that.keys.G) {
			$scope.tabId = 5;
		} else if (key == that.keys.F) {
			$scope.tabId = 6;
		} else if (key == that.keys.C) {
			$scope.tabId = 7;
		} else if (key == that.keys.E) {
			$scope.tabId = 8;
		} else if (key == that.keys.T) {
			$scope.tabId = 9;
		} else if (key == that.keys.D) {
			$scope.tabId = 10;
		}
		$scope.$apply();
		
	}).on('keyup', function(e) {
		var key = e.keyCode;
		if (key == that.keys.SPACE) {
			$scope.pan = false;
		}
		$scope.$apply();
    });*/
	
	/*$scope.cssLoaded = function(editor, styleSheet) {
		var doc = that.iframe.contentWindow.document;
		var $style = $(doc).find('#'+styleSheet.elementId);
		editor.on("change", function(instance, changeObj){
			$style.html(instance.getValue());
		});
	};
	
	$scope.htmlLoaded = function(editor) {
		editor.on("change", function(instance, changeObj) {
			var doc = that.iframe.contentWindow.document;
			var html = instance.getValue();
			
			doc.open();
			doc.write(html);
			doc.close();
		});
	};
	
	this.zoomIn = function() {
		var zoom = $scope.zoom;
		if (zoom <= 4) {
			this.zoom(zoom + 1);
		}
	};
	
	this.zoomOut = function() {
		var zoom = $scope.zoom;
		if (zoom > 1) {
			this.zoom($scope.zoom - 1);
		}
	};
	
	this.zoom = function(level) {
		if ($scope.offset == undefined) {
			$scope.originX = $(window).width() / 2 + 'px';
			$scope.originY = $(window).height() / 2 + 'px';
		} else {
			$scope.originX = $scope.offset.left + $scope.paddingLeft + $scope.borderLeft + $scope.width/2 + 'px';
			$scope.originY = $scope.offset.top + $scope.paddingTop + $scope.borderTop + $scope.height/2 + 'px';
		}
		$scope.zoom = level;
		dataService.zoomNotify(level, $scope.zoomLevels);
	};
	
	$scope.$on('styleModified', function(evt, prop) {
		that.update();
		$scope.propVal = dataService.getStyle(prop);
		$scope.$apply();
	});
	
	$scope.$on('handleStartDrag', function(evt, prop) {
		$scope.propName = prop;
		$scope.dragging = true;
	});
	
	$scope.$on('handleStopDrag', function(evt, prop) {
		$scope.dragging = false;
		$scope.$apply();
	});
	
	$scope.$on('handleMouseOver', function(evt, prop) {
		$timeout.cancel(that.timeout);
		$scope.showCurProp = true;
		$scope.propName = prop;
		$scope.propVal = dataService.getStyle(prop);
		$scope.$apply();
	});
	
	$scope.$on('handleMouseOut', function(evt, prop) {
		if (!$scope.dragging) {
			that.timeout = $timeout(function() {
				$scope.showCurProp = false;
			}, 700);
		}
	});
	$scope.keepVisible = function() {
		$timeout.cancel(that.timeout);
	};
	$scope.timeoutHide = function() {
		that.timeout = $timeout(function() {
			$scope.showCurProp = false;
		}, 700);
	};
	$scope.deleteProperty = function(prop) {
		dataService.deleteProperty(prop);
		that.update();
	};
	
	// selects or deselects the current rule
	$scope.toggleRule = function(rule) {
		if ($scope.activeRule == rule) {
			rule = undefined;
		}
		$scope.activeRule = dataService.setRule(rule);
	};
		
	// set the currently selected item for editing 
	this.select = function(element) {
		this.selected = element;
		$scope.isSelected = true;
		$scope.rules = dataService.getRules(element, $scope.sheets);
		dataService.setRule(undefined);
		
		this.update(true);
		$scope.$emit('selectElement');
	};*/

// this service keeps track of all defined CSS properties
// all interaction with CSS rules goes through this service
/*app.factory('dataService', [function(){
	return {
		items: [],
		
		properties: {},
		
		rule: undefined,
		
		element: undefined,
		
		rules: [],
		
		zoomFactor: 1,
		
		zoomNotify: function(zoom, factors) {
			this.zoomFactor = 1 / factors[zoom-1];
		},
		
		getComputedStyle: function(element) {
			return window.getComputedStyle(element);
		},
		
		getStyle: function(propName) {
			var prop = this.getProperty(propName);
			if (prop != undefined) {
				return prop.style[propName];
			}
		},
		
		getProperty: function(prop) {
			return this.properties[prop];
		},
		
		deleteProperty: function(prop) {
			this.properties[prop].style.removeProperty(prop);
			delete this.properties[prop];
		},
		
		// sets active and selected rules
		// active rule is what new handles set
		// selected rule overrides handle's default rule 
		setRule: function(rule) {
			this.selectedRule = rule;
			if (rule == undefined) {
				rule = this.rules[this.rules.length-1];
			}
			this.activeRule = rule;
			
			return this.selectedRule;
		},
		
		
		// could possibly hash CSS rule text to lookup later:
		// http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
		getRules: function(element, sheets) {
			/*this.properties = {};
			var frameWindow = document.getElementById('page').contentWindow;
			this.rules = frameWindow.getMatchedCSSRules(element[0]);
			
			if (this.rules == undefined) {
				return [];
			}
			
			var that = this;
			var len = this.rules.length;
			angular.forEach(this.rules, function(rule, i) {
				rule.index = len-i;
				rule.highlight = false;
				angular.forEach(rule.style, function(style) {
					var str = rule.style[style],
						val = Number(str.replace(/[a-zA-Z%]/g, '')),
						unit = str.replace(/[0-9\.-]/g, ''),
						props = {
							name: style,
							value: val,
							unit: unit,
							style: rule.style,
							rule: rule,
						};
					that.properties[style] = props;
				});
			});
			
			this.activeRule = this.rules[this.rules.length-1];
			
		},
				
		// used to change the units for a particular handle
		changeUnit: function(prop, unit) {
			var rule = this.properties[prop];
			if (rule != undefined) {
				// convert value of property
				
				// assign new value and new unit
				console.log('change handle unit');
			}
			
		},
	};
}]);*/



/*chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
	console.log(response.farewell);
	$('body').prepend(response.farewell)
});*/

/*function getCSSRule(ruleName, deleteFlag) {               // Return requested style obejct
   ruleName=ruleName.toLowerCase();                       // Convert test string to lower case.
   if (document.styleSheets) {                            // If browser can play with stylesheets
      for (var i=0; i<document.styleSheets.length; i++) { // For each stylesheet
         var styleSheet=document.styleSheets[i];          // Get the current Stylesheet
         var ii=0;                                        // Initialize subCounter.
         var cssRule=false;                               // Initialize cssRule. 
         for (var ii=0; ii<styleSheet.rules.length; ii++) {
            if (styleSheet.rules && styleSheet.rules[ii])  {                               // If we found a rule...
              cssRule = styleSheet.rules[ii];
               if (cssRule.selectorText && cssRule.selectorText.toLowerCase()==ruleName) { //  match ruleName?
                  if (deleteFlag=='delete') {             // Yes.  Are we deleteing?
                     if (styleSheet.cssRules) {           // Yes, deleting...
                        styleSheet.deleteRule(ii);        // Delete rule, Moz Style
                     } else {                             // Still deleting.
                        styleSheet.removeRule(ii);        // Delete rule IE style.
                     }                                    // End IE check.
                     return true;                         // return true, class deleted.
                  } else {                                // found and not deleting.
                     return cssRule;                      // return the style object.
                  }                                       // End delete Check
               }                                          // End found rule name
            }                                             // end While loop
         }
      }                                                   // end For loop
   }                                                      // end styleSheet ability check
   return false;                                          // we found NOTHING!
}
*/


/*var rule = getCSSRule('.myclass');
console.log(rule);
rule.style.backgroundColor = '#ccc';

$('body').click(function(evt) {
	//evt.preventDefault();
	var el = evt.target;
	console.log(el);
	var rules = window.getMatchedCSSRules(el);
	console.log(rules);
	rules[1].style.color = '#000';
	chrome.runtime.sendMessage({greeting: "hi"}, function(response) {
		console.log(el);
		console.log(rules);
		$('body').prepend(response.farewell)
	});
});*/


// THIRD PARTY LIBRARIES TO INTEGRATE
// http://csslint.net/ (builtin to codemirror)
// http://codemirror.net/
// http://ot.substance.io/demo/
// https://github.com/medialize/sass.js
// possibly use as reference
// http://www.brothercake.com/site/resources/scripts/cssutilities/
// http://shrthnd.volume7.io/
// http://www.regbirch.com/blog/colour-picker-for-sass



// CSS PROPERTY GROUPS
// loosely based on w3schools list


// SPACING
//	box-sizing, margin, padding, 

// SIZE
//	width, height, min-width, max-width, min-height, max-height

// POSITION
//	position, top, left, right, bottom, float, clip, overflow, z-index, clear, display, visibility

// BORDER
//	border, border-radius
//  outline, outline-offset, border-image, opacity

// BACKGROUNDS
//	background-position, size, gradients
//  backgrounds (images, repeat, origin, attachment, clip, etc.)

// TEXT
//	size, text-indent, line-height, letter-spacing, word-spacing
//  size-adjust, font-family, style, weight, stretch, color, alignment, white-space, text-transform, text-decoration, variant, direction, vertical-align, punctuation, text-wrap, word-break, word-wrap, 

// COLUMNS
// column-count, fill, gap, rule, span, width

// EFFECTS
//	box-shadow, text-shadow, blur, grayscale, dropshadow, sepia, brightness, contrast, hue-rotate, invert, saturate, opacity

// TRANSFORM
//	translate, scale, rotate, skew, rotation?, rotation-point?

// TRANSFORM 3D
//  translate3D, scale3D, rotate3D, perspective, perspective-origin


// HANDLE CONCEPT
/*
- bind direction to value (vertical, horizontal, diagonal)
- direction of handle is constrained
- hover on handle shows its value and property name
- while dragging handle, value is visible
- value change initiates:
	- location of handle change
	- css property(ies) updated
- modifier keys allow
	- snapping (to grid or objects)
	- smaller adjustments
	- single digit increments
	- constraining to a direction
	- zooming the view
- values affected belong to selectors or are inline
- keyboard shortcuts should abound
- should work on tablet with basic handle features & pinch-zoom (not extra chrome plugin window resize stuff, etc.)
- should support navigating the dom & selecting selectors with keyboard
- should support grids & guides of some kind
- should support color picker of some kind
- should support drag-and-drop images and text
- should support shorthand html creation
- should support addons for svg editor, cms integration, font service integration, stock photo integration


// MONETIZATION
- save to server option
- group pages into projects
- full project history with save points
- realtime multi-device updates
- design review workflow with annotations
- collaborative editing
- save & share code snippets
- make cross-browser function
- font service affiliation
- save to third-party cms integration
- stock photo service affiliation
- addon sales? (svg editor, image editor, animation editor, etc.)
*/

// FUTURE POSSIBILITIES

// TRANSITION
//	transition-property, delay, duration, timing-function

// LISTS
//	list-style, position, type, image

// TABLES
//	table-layout, border-collapse, border-spacing, empty-cells, caption-side

// GENERATED CONTENT
// content, counter-increment, counter-reset, quotes

// PAGED MEDIA
//	page-break-before, page-break-after, page-break-inside, orphans, widows

// FLEXIBLE BOX
//	box-align, direction, flex, flex-group, lines, ordinal-group, orient, pack

// color-profile?, rendering-intent?, grid-columns, grid-rows, target..., line-box..., marquee, ruby..., speech..., 