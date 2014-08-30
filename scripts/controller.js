angular.module('cssHandles').controller('MainCtrl', function($scope, $sce, $window, $timeout, DataService) {
	$scope.pageSrc = $sce.trustAsResourceUrl('page.html');
	$.get($scope.pageSrc, function(data) {
		$scope.html = data;
	});
	$scope.tabId = 1;
	$scope.handleSize = 36;	// used for centering and shifting handles
	$scope.showControls = true;
	$scope.isSelected = false;
	$scope.zoom = 1;
	$scope.zoomLevels = [1, 1.5, 2, 3, 4];
	$scope.sheets = [];
	this.sheetsDict = {};
	this.selected;
	var that = this;
	
	$scope.cssEditorLoaded = function(editor, sheet) {
		DataService.editorLoaded(editor, sheet);
	};
	
	$scope.$on('select', function(event, element) {
		that.selected = element;
		$scope.isSelected = true;
		
		that.update(that.selected);
	});
	
	$scope.$on('handleStartDrag', function() {
		$scope.dragging = true;
	});
	
	$scope.$on('handleStopDrag', function() {
		$scope.dragging = false;
		$scope.$apply();
	});
	
	$scope.cssLoaded = function(sheets) {
		$scope.sheets = sheets;
		$scope.$apply();
	};
	
	$scope.onScroll = function() {
		if (that.selected != undefined) {
			that.update(that.selected);
		}
	};
	
	// returns the numbered index of the rule for specified property
	// this number is used for color coding handles and rules
	$scope.getRuleIndex = function(prop) {
		return DataService.getRuleIndex(prop);
	};
	
	$scope.$on('cssChangeAfter', function(event, sheet, change) {
		if (that.selected != undefined) {
			that.update(that.selected);
		}
	});
	
	// handle positions are updated in the main control
	// because performance is better and handles need access to
	// all the computed properties
	this.update = function(element, skipApply) {
		var zoomTmp = $scope.zoom,
			panX = $scope.panX,
			panY = $scope.panY;
		$scope.zoom = 1;
		$scope.panX = 0;
		$scope.panY = 0;
		$scope.$apply();
		var selected = $(element);
		if (element != undefined) {
			// local variables
			var computed = window.getComputedStyle(element);
			var parent = selected.parent();
			var $iframe = $('#page');
			var iframe = $iframe[0];
			var iframeOffset = $iframe.offset();
			var scrollOffsetTop = $(iframe.contentWindow).scrollTop();
			var scrollOffsetLeft = $(iframe.contentWindow).scrollLeft();
			var parentComputed = window.getComputedStyle(parent[0]);
			
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
			//console.log($scope.transformOrigin);
			
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
				var newX = result.e + $scope.offset.left + $scope.transformOrigin.x + iframeOffset.left - scrollOffsetLeft;
				var newY = result.f + $scope.offset.top + $scope.transformOrigin.y + iframeOffset.top - scrollOffsetTop;
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
		$scope.zoom = zoomTmp;
		$scope.panX = panX;
		$scope.panY = panY;
		
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
	

});

