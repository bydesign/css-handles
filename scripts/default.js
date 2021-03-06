var app = angular.module('cssHandles', []);
//var pageRoot = $('body');

app.controller('MainCtrl', function($scope, dataService, $window, $rootScope, $timeout) {
	$scope.name = 'World';
	$scope.tabId = 1;
	$scope.isSelected = false;
	$scope.handleSize = 36;	// used for centering and shifting handles
	$scope.showCurProp = false;
	$scope.dragging = false;
	$scope.propName = '';
	$scope.propVal = '';
	$scope.showControls = true;
	$rootScope.pan = false;
	$rootScope.zoom = 1;
	$rootScope.originX = 0;
	$rootScope.originY = 0;
	$rootScope.panX = 0;
	$rootScope.panY = 0;
	$rootScope.zoomLevels = [1, 1.5, 2, 3, 4];
	this.timeout;
	this.keys = {
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
	
	var that = this;
	angular.element($window).on('keydown', function(e) {
		var key = e.keyCode;
		if (key == that.keys.SPACE) {
			$rootScope.pan = true;
			e.preventDefault();
		} else if (key == that.keys.PLUS) {
			that.zoomIn();
		} else if (key == that.keys.MINUS) {
			that.zoomOut()
		} else if (key == that.keys.ZERO) {
			that.zoom(1);
			$rootScope.panX = 0;
			$rootScope.panY = 0;
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
		$rootScope.$apply();
		
	}).on('keyup', function(e) {
		var key = e.keyCode;
		if (key == that.keys.SPACE) {
			$rootScope.pan = false;
		}
		$rootScope.$apply();
    });
	
	// handle selection of any element in the original page
	$rootScope.selectElement = function($event) {
		//$event.preventDefault();
		var target = $($event.target);
		if (target.parents('#handles-root').length == 0) {
			that.select(target);
		}
	};
	
	this.zoomIn = function() {
		var zoom = $rootScope.zoom;
		if (zoom <= 4) {
			this.zoom(zoom + 1);
		}
	};
	
	this.zoomOut = function() {
		var zoom = $rootScope.zoom;
		if (zoom > 1) {
			this.zoom($rootScope.zoom - 1);
		}
	};
	
	this.zoom = function(level) {
		if ($scope.offset == undefined) {
			$rootScope.originX = $(window).width() / 2 + 'px';
			$rootScope.originY = $(window).height() / 2 + 'px';
		} else {
			$rootScope.originX = $scope.offset.left + $scope.paddingLeft + $scope.borderLeft + $scope.width/2 + 'px';
			$rootScope.originY = $scope.offset.top + $scope.paddingTop + $scope.borderTop + $scope.height/2 + 'px';
		}
		$rootScope.zoom = level;
		dataService.zoomNotify(level, $rootScope.zoomLevels);
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
	
	// handle positions are updated in the main control
	// because performance is better and handles need access to
	// all the computed properties
	this.update = function(skipApply) {
		var zoomTmp = $rootScope.zoom,
			panX = $rootScope.panX,
			panY = $rootScope.panY;
		$rootScope.zoom = 1;
		$rootScope.panX = 0;
		$rootScope.panY = 0;
		$rootScope.$apply();
		var selected = that.selected;
		if (selected != undefined) {
			// local variables
			var computed = dataService.getComputedStyle(selected[0]);
			var parent = selected.parent();
			var parentComputed = dataService.getComputedStyle(parent[0]);
			
			selected.css('-webkit-transform', 'translateX(0) translateY(0) rotate(0) scale(1)');
			$scope.offset = selected.offset();
			selected.css('-webkit-transform','');
			
			// doesn't include padding or border
			$scope.contentWidth = selected.width();
			$scope.contentHeight = selected.height();
			
			// paddings
			$scope.paddingTop = this.getComputedNum(computed['padding-top']);
			$scope.paddingRight = this.getComputedNum(computed['padding-right']);
			$scope.paddingBottom = this.getComputedNum(computed['padding-bottom']);
			$scope.paddingLeft = this.getComputedNum(computed['padding-left']);
			
			// margins
			$scope.marginTop = this.getComputedNum(computed['margin-top']);
			$scope.marginRight = this.getComputedNum(computed['margin-right']);
			$scope.marginBottom = this.getComputedNum(computed['margin-bottom']);
			$scope.marginLeft = this.getComputedNum(computed['margin-left']);
			
			// borders
			$scope.borderTop = this.getComputedNum(computed['border-top-width']);
			$scope.borderRight = this.getComputedNum(computed['border-right-width']);
			$scope.borderBottom = this.getComputedNum(computed['border-bottom-width']);
			$scope.borderLeft = this.getComputedNum(computed['border-left-width']);
			
			// size based on box-sizing
			$scope.width = this.getComputedNum( selected.css('width') );
			$scope.minWidth = this.getComputedNum(computed['min-width'], $scope.width);
			$scope.maxWidth = this.getComputedNum(computed['max-width'], $scope.width);
			$scope.height = this.getComputedNum( selected.css('height') );
			$scope.minHeight = this.getComputedNum(computed['min-height'], $scope.height);
			$scope.maxHeight = this.getComputedNum(computed['max-height'], $scope.height);
			
			// fonts
			$scope.fontSize = this.getComputedNum(computed['font-size']);
			$scope.lineHeight = this.getComputedNum(computed['line-height'], $scope.fontSize * 1.2);
			$scope.textIndent = this.getComputedNum(computed['text-indent']);
			$scope.letterSpacing = this.getComputedNum(computed['letter-spacing'], 0);
			$scope.wordSpacing = this.getComputedNum(computed['word-spacing'], 0);
			
			// columns
			$scope.columnCount = this.getComputedNum(computed['-webkit-column-count'], 1);
			$scope.columnWidth = this.getComputedNum(computed['-webkit-column-width'], 0);
			$scope.columnGap = this.getComputedNum(computed['-webkit-column-gap'], 0);
			$scope.columnRuleWidth = this.getComputedNum(computed['-webkit-column-rule-width'], 0);
			
			// transforms
			$scope.transformMatrix = new WebKitCSSMatrix(computed.webkitTransform);
			//console.log(computed.webkitTransform);
			//console.log(computed['-webkit-transform-origin']);
			$scope.transformOrigin = this.getComputedNumPair(computed['-webkit-transform-origin']);
			console.log($scope.transformOrigin);
			
			$scope.transform = function(x, y) {
				// subtract page offset (use local coordinates)
				x -= $scope.offset.left + $scope.transformOrigin.x;
				y -= $scope.offset.top + $scope.transformOrigin.y;
				//x -= $scope.offset.left + $scope.transformMatrix.e;
				//y -= $scope.offset.top + $scope.transformMatrix.f;
				//x -= $scope.offset.left;
				//y -= $scope.offset.top;
				
				// convert vector to matrix
				var matrix = new WebKitCSSMatrix('matrix(1, 0, 0, 1, '+x+', '+y+')');
				//console.log(matrix);
				
				// multiply matrix by transform
				var result = $scope.transformMatrix.multiply(matrix);
				//console.log(result);
				
				//console.log(result);
				
				// extract new position
				var newX = result.e + $scope.offset.left + $scope.transformOrigin.x;
				var newY = result.f + $scope.offset.top + $scope.transformOrigin.y;
				//var newX = result.e + $scope.offset.left;
				//var newY = result.f + $scope.offset.top;
				//console.log(newX);
				//console.log(newY);
				
				// return object with new CSS values
				return {
					left: newX,
					top: newY,
				};
			};
			
			if (computed['box-sizing'] != 'border-box') {
				var borderPadding = $scope.paddingLeft + $scope.paddingRight + $scope.borderLeft + $scope.borderRight;
				$scope.minWidth += borderPadding;
				$scope.maxWidth += borderPadding;
				var borderPadding = $scope.paddingTop + $scope.paddingBottom + $scope.borderTop + $scope.borderBottom;
				$scope.minHeight += borderPadding;
				$scope.maxHeight += borderPadding;
			}
			
			// parent attributes for calculation ratios
			$scope.parentWidth = this.getComputedNum(parent.css('width'));
			$scope.parentHeight = this.getComputedNum(parent.css('height'));
			$scope.parentFontSize = this.getComputedNum(parentComputed['font-size']);
		}
		// set root scope properties
		$rootScope.zoom = zoomTmp;
		$rootScope.panX = panX;
		$rootScope.panY = panY;
		
		if (!skipApply) {
			$scope.$apply();
		}
	};
	
	this.getComputedNumPair = function(str) {
		var parts = str.replace('px','').replace('px','').split(' ');
		return {
			x: Number(parts[0]),
			y: Number(parts[1]),
		}
	};
	
	this.getComputedNum = function(prop, fallbackNum) {
		if ((prop == undefined || prop == 'none' || prop == 'normal' || prop == 'auto') && fallbackNum != undefined) {
			return fallbackNum;
		}
		return Number(prop.replace('px',''));
	};
	
	// set the currently selected item for editing 
	this.select = function(element) {
		this.selected = element;
		$scope.isSelected = true;
		$scope.rules = dataService.getRules(element);
		dataService.setRule(undefined);
		
		this.update(true);
		$scope.$emit('selectElement');
	};
	
});

// this service keeps track of all defined CSS properties
// all interaction with CSS rules goes through this service
app.factory('dataService', [function(){
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
		
		getRules: function(element) {
			this.properties = {};
			this.rules = window.getMatchedCSSRules(element[0]);
			
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
			
			return this.rules;
		},
		
		proposePixelMove: function(prop, val, defaultUnit, allowNegative, percentDenom, emDenom, valWrapper) {
			// add grid/object snapping
			
			// determine active rule
			var activeRule = this.activeRule;
			var rule = this.properties[prop];
			
			// define new style if property isn't defined yet
			if (rule == undefined) {
				rule = {
					name: prop,
					value: 0,
					unit: defaultUnit,
					style: activeRule.style,
					rule: activeRule,
				}
				this.properties[prop] = rule;
			}
			
			// convert pixels to %, em, etc. when needed
			if (rule.unit == '%') {
				val = val / percentDenom * 100;
			} else if (rule.unit == 'em') {
				val = val / emDenom;
			}
			val *= this.zoomFactor;
			if (rule.unit == 'px') {
				val = Math.round(val);
			}
			
			// assign new value to CSS rule
			var newNum = rule.value + val;
			if (!allowNegative && newNum < 0) {
				newNum = 0;
			}
			newNum = Math.round(newNum * 1000) / 1000;
			var newVal = newNum + rule.unit;
			
			if (valWrapper != undefined) {
				newVal = valWrapper.replace('#', newVal);
				console.log(prop);
				console.log(newVal);
			}
			
			var style = rule.style;
			if (this.selectedRule) {
				style = this.selectedRule.style;
			}
			style[prop] = newVal;
			
			// figure out how to position handles
			
			// figure out how to position placeholders
			
		},
		
		finalizePixelMove: function(prop) {
			var rule = this.properties[prop];
			rule.value = Number( rule.style[prop].replace(rule.unit, '') );
			if (this.selectedRule) {
				rule.rule = this.selectedRule;
				rule.style = this.selectedRule.style;
			}
		},
		
		// used for cancelling a handle drag before release
		cancelPixelMove: function(prop) {
			var rule = this.properties[prop];
			if (rule != undefined) {
				rule.style[prop] = rule.value + rule.unit;
			}
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
		
		// returns the numbered index of the rule for specified property
		// this number is used for color coding handles and rules
		getRuleIndex: function(prop) {
			var rule = this.properties[prop];
			if (rule != undefined) {
				return rule.rule.index;
			}
		},
	};
}]);

// the handle directive only displays a handle
// and directs events to the dataService for action
// no data model logic should be performed inside this directive
app.directive('handle', function(dataService, $document, $rootScope){
  return {
    restrict: 'E',
    templateUrl: 'handle.html',
    //transclude: true,
    scope: {
    	prop: '@',
    	dir: '@',
    	unit: '@',
    	posx: '@',
    	posy: '@',
    	allownegative: '=',
    	percentdenom: '=',
    	emdenom: '=',
    },
    link: function($scope, element, attr, ctrl) {
		// track drag-n-drop
		var startX = 0, startY = 0, x = 0, y = 0,
			prop = $scope.prop, valWrapper;
			
		if (prop.indexOf(':') != -1) {
			var parts = prop.split(':');
			prop = parts[0];
			valWrapper = parts[1];
		}
		
		$scope.getRuleIndex = function() {
			return dataService.getRuleIndex(prop);
		}
		
		element.on('mouseover', function(event) {
			// call hover event for property
			$scope.$emit('handleMouseOver', $scope.prop);
		});
		
		element.on('mouseout', function(event) {
			// call hover event for property
			$scope.$emit('handleMouseOut', $scope.prop);
		});
		
		element.on('mousedown', function(event) {
			// Prevent default dragging of selected content
			event.preventDefault();
			startX = event.pageX;
			startY = event.pageY;
			$document.on('mousemove', mousemove);
			$document.on('mouseup', mouseup);
			element.toggleClass('dragging');
			$scope.$emit('handleStartDrag', $scope.prop);
		});
		
		function mousemove(event) {
			y = event.pageY - startY;
			x = event.pageX - startX;
			var dir = $scope.dir;
			if (dir.indexOf('horiz') != -1) {
				val = x;
			} else if (dir == 'diagL' || dir == 'diagR') {
				val = y;
			} else if (dir == 'both') {
				
			} else {
				val = y;
			}
			if (dir.charAt(0) == '-') {
				val = -val;
			}
			dataService.proposePixelMove(prop, val, $scope.unit, $scope.allownegative, $scope.percentdenom, $scope.emdenom, valWrapper);
			$scope.$emit('styleModified', $scope.prop);
		}
		
		function mouseup() {
			$document.unbind('mousemove', mousemove);
			$document.unbind('mouseup', mouseup);
			element.toggleClass('dragging');
			dataService.finalizePixelMove(prop);
			$scope.$emit('handleStopDrag', $scope.prop);
		}
    },
  };
});

app.directive('pannable', function(dataService, $document, $rootScope){
  return {
    link: function($scope, element, attr, ctrl) {
		// track drag-n-drop
		var startX = 0, startY = 0, x = 0, y = 0, panX = 0, panY = 0;
		
		element.on('mousedown', function(event) {
			// Prevent default dragging of selected content
			event.preventDefault();
			panX = $rootScope.panX;
			panY = $rootScope.panY;
			startX = event.pageX;
			startY = event.pageY;
			$document.on('mousemove', mousemove);
			$document.on('mouseup', mouseup);
		});
		
		function mousemove(event) {
			y = event.pageY - startY;
			x = event.pageX - startX;
			$rootScope.panX = panX + x;
			$rootScope.panY = panY + y;
		}
		
		function mouseup() {
			$document.unbind('mousemove', mousemove);
			$document.unbind('mouseup', mouseup);
		}
    },
  };
});


angular.bootstrap(document, ['cssHandles']);



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
// https://github.com/medialize/sass.js



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