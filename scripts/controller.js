angular.module('cssHandles').controller('MainCtrl', function($scope, $sce, $rootScope, $window, $timeout, DataService, CssPropTabMapping) {
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
	$scope.editorWidth = 350;
	$scope.mediaQueries = [];
	$scope.gridCount = 12;
	$scope.gridPadding = 12;
	$rootScope.zoomAmount = 1;
	$rootScope.grid = {
		snap: true,
		lineHeight: 16
	};
	//$rootScope.gridSnap = true;
	//$rootScope.gridLineHeight = 16;
	$scope.gridTargetSelector = '.doc';
	$scope.gridWidth = $scope.pageWidth;
	$scope.gridOffsetLeft = 0;
	$scope.gridOffsetTop = 0;
	$scope.gridLeft = 0;
	$scope.pageOffsetX = 0;
	$scope.pageOffsetY = 0;
	this.sheetsDict = {};
	this.selected;
	this.shadowIndex = 0;
	this.bgIndex = 0;
	var that = this;
	emmetPlugin.setKeymap({
		'Alt-Up': 'balance_outward',
		'Alt-Down': 'balance_inward'
	});
	
	$scope.$on('pageResize', function(doc) {
		if (that.doc != undefined) {
			var $target = $(that.doc).find($scope.gridTargetSelector);
			$scope.gridLeft = $target.offset().left;
			$scope.gridWidth = $target.width();
			var gridCount = $scope.gridCount;
			$scope.gridColSize = $scope.gridWidth / gridCount;
			var gray = 'rgba(0,0,0,0.75)';
			var black = 'rgba(0,0,0,1.0)';
			var transp = 'rgba(0,0,0,0)';
			var gridGradient = gray + ' 0, ';
			gridGradient += gray + ' '+ $scope.gridPadding/gridCount +'%, ';
			gridGradient += transp + ' '+ $scope.gridPadding/gridCount +'%, ';
			gridGradient += transp + ' '+ (99-$scope.gridPadding)/gridCount +'%, ';
			gridGradient += gray + ' '+ (99-$scope.gridPadding)/gridCount +'%, ';
			gridGradient += gray + ' '+ 99.5/gridCount +'%';
			$scope.gridGradient = gridGradient;
			
			$scope.$apply();
		}
	});
	
	/*$scope.scopePropFn = function(prop, val) {
		$scope[prop] += val;
		that.update(that.selected);
	};*/
	
	$scope.zoomIn = function() {
		$rootScope.zoomAmount += $rootScope.zoomAmount * .5;
		DataService.setZoom($rootScope.zoomAmount);
		that.update(that.selected);
	};
	
	$scope.zoomOut = function() {
		$rootScope.zoomAmount -= $rootScope.zoomAmount * .3333333333333333332;
		DataService.setZoom($rootScope.zoomAmount);
		that.update(that.selected);
	};
	
	$scope.zoomNormal = function() {
		$rootScope.zoomAmount = 1;
		DataService.setZoom($rootScope.zoomAmount);
		that.update(that.selected);
	};
	
	$scope.changeEditorWidth = function(prop, val) {
		var editorWidth = $scope.editorWidth + val;
		var windowWidth = $(window).width();
		$scope.editorWidth = editorWidth;
		$scope.pageOffset = $('#pageHolder').offset();
		if (editorWidth + $scope.pageWidth > windowWidth) {
			$scope.pageWidth = windowWidth - $scope.editorWidth;
		}
		that.update(that.selected);
	};
	
	$scope.changePageWidth = function(prop, val) {
		var maxPageWidth = $(window).width() - $scope.editorWidth; 
		var pageWidth = $scope.pageWidth + val;
		if (pageWidth > 0 && pageWidth <= maxPageWidth) {
			$scope.pageWidth = pageWidth;
		}
		that.update(that.selected);
	};
	
	$scope.cssEditorLoaded = function(editor, sheet) {
		DataService.cssEditorLoaded(editor, sheet);
	};
	
	$scope.htmlLoaded = function(editor, model) {
		DataService.htmlEditorLoaded(editor, model);
	};
	
	$scope.$on('pageLoaded', function(evt, doc) {
		that.doc = doc;
		$scope.pageOffset = $('#pageHolder').offset();
		$scope.pageWidth = $(window).width() - $scope.editorWidth;
		that.update();
	});
	
	$scope.unfoldCode = function() {
		DataService.unfoldCode();
	};
	
	$scope.select = function(node) {
		DataService.selectNode(node);
	};
	
	$scope.selectShadow = function(shadow, shadowIndex) {
		$scope.curShadow = shadow;
		that.shadowIndex = shadowIndex;
		DataService.setCurShadow(shadow);
		that.update(that.selected);
	};
	
	$scope.selectBackground = function(background, bgIndex) {
		$scope.curBackground = background;
		that.bgIndex = bgIndex;
		DataService.setCurBackground(background);
		that.update(that.selected);
	};
	
	$scope.addBoxShadow = function() {
		console.log('add box shadow');
	};
	
	$scope.addTextShadow = function() {
		console.log('add text shadow');
	};
	
	$scope.highlightMediaQuery = function(mq) {
		DataService.unfoldCode();
		
	};
	
	$scope.$on('select', function(event, element) {
		that.selected = element;
		$scope.isSelected = true;
		$scope.domList = DataService.domList;
		
		$scope.mediaQueries = DataService.getMediaQueries();
		that.getEffects();
		that.getBackgrounds();
		that.update(element);
		
		// hacky non-angular way to scroll css editors to the bottom
		var $cssScroll = $('#cssScroll');
		var top = $cssScroll[0].scrollHeight;
		$cssScroll.scrollTop(top);
	});
	
	$scope.$on('handleStartDrag', function(evt, prop) {
		$scope.dragging = true;
		$scope.$apply();
	});
	
	$scope.$on('handleStopDrag', function(evt, prop) {
		$scope.dragging = false;
		that.getEffects();
		that.getBackgrounds();
		that.update(that.selected);
		$scope.$apply();
	});
	
	$scope.$on('selectCssProp', function(evt, prop) {
		var tabId = CssPropTabMapping[prop.name];
		if (tabId != undefined) {
			$scope.tabId = tabId;
			$scope.$apply();
		}
	});
	
	this.getEffects = function() {
		$scope.shadows = DataService.getEffects();
		if ($scope.shadows != undefined && $scope.shadows.length > 0) {
			$scope.curShadow = $scope.shadows[that.shadowIndex];
			DataService.setCurShadow($scope.curShadow);
		}
	};
	
	this.getBackgrounds = function() {
		$scope.backgrounds = DataService.getBackgrounds();
		if ($scope.backgrounds != undefined && $scope.backgrounds.length > 0) {
			$scope.curBackground = $scope.backgrounds[that.bgIndex];
			DataService.setCurBackground($scope.curBackground);
		}
	};
	
	$scope.cssLoaded = function(sheets) {
		$scope.sheets = sheets;
		if (!$scope.$$phase) {
			$scope.$apply();
		}
	};
	
	$scope.onScroll = function() {
		that.update(that.selected);
	};
	
	// returns the numbered index of the rule for specified property
	// this number is used for color coding handles and rules
	$scope.getRuleIndex = function(prop, fn) {
		return DataService.getRuleIndex(prop, fn);
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
		var selected = $(element);
		selected.css('-webkit-transition', 'all 0 ease 0');
		var zoomTmp = $scope.zoom,
			panX = $scope.panX,
			panY = $scope.panY;
		$scope.zoom = 1;
		$scope.panX = 0;
		$scope.panY = 0;
		$scope.$apply();
		
		var iframe = $('#page')[0];
		var scrollOffsetLeft = $(iframe.contentWindow).scrollLeft();
		var scrollOffsetTop = $(iframe.contentWindow).scrollTop();
		
		$scope.gridOffsetLeft = -scrollOffsetLeft * $rootScope.zoomAmount;
		$scope.gridOffsetTop = -scrollOffsetTop * $rootScope.zoomAmount;
		
		if (element != undefined) {
			// local variables
			var iframeOffset = $(iframe).offset();
			var computed = window.getComputedStyle(element);
			var parent = selected.parent();
			var parentComputed = window.getComputedStyle(parent[0]);
			
			// parse shadow parts
			var shadows = computed['box-shadow'].replace(/\([^\)]+\)/g, '').split(',');
			var shadow = shadows[that.shadowIndex];
			if (shadow != undefined) {
				var shadowProps = shadow.trim().split(' ');
				var index = 0;
				angular.forEach(shadowProps, function(prop) {
					var prop = prop.trim();
					if (prop.match(/^-?\d.*/)) {
						switch (index) {
							case 0:
								$scope.shadowH = that.getComputedNum(prop);
								break;
							case 1:
								$scope.shadowV = that.getComputedNum(prop);
								break;
							case 2:
								$scope.shadowBlur = that.getComputedNum(prop);
								break;
							case 3:
								$scope.shadowSpread = that.getComputedNum(prop);
								break;
						}
						index++;
					}
				});
			}
			
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
			
			// background properties
			var width = $scope.width + $scope.paddingLeft + $scope.paddingRight;
			$scope.bgPosX = 0;
			$scope.bgPosY = 0;
			var bgPos = computed['background-position'];
			if (bgPos != undefined) {
				bgPos = bgPos.split(',')[that.bgIndex];
				if (bgPos != undefined) {
					var posParts = bgPos.split(' ');
					$scope.bgPosX = that.getNumber(posParts[0], width);
					$scope.bgPosY = $scope.bgPosX;
					if (posParts.length > 1) {
						$scope.bgPosY = that.getNumber(posParts[1], width);
					}
				}
			}
			
			var bgSize = computed['background-size'];
			$scope.bgSizeX = 0;
			$scope.bgSizeY = 0;
			if (bgSize != undefined) {
				bgSize = bgSize.split(',')[that.bgIndex];
				if (bgSize != undefined && bgSize != 'auto') {
					var sizeParts = bgSize.split(' ');
					$scope.bgSizeX = that.getNumber(sizeParts[0], width);
					$scope.bgSizeY = DataService.getCurBackgroundHeight($scope.bgSizeX);
					if (sizeParts.length > 1) {
						$scope.bgSizeY = that.getNumber(sizeParts[1], width);
					}
				}
			}
			
			$scope.transform = function(x, y) {
				//console.log(x);
				//console.log(y);
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
				var newX = result.e + $scope.offset.left + $scope.transformOrigin.x - scrollOffsetLeft;
				newX *= $rootScope.zoomAmount;
				var newY = result.f + $scope.offset.top + $scope.transformOrigin.y - scrollOffsetTop;
				newY *= $rootScope.zoomAmount;
				
				// extract new position
				newX += iframeOffset.left;
				newY += iframeOffset.top;
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
		selected.css('-webkit-transition', '');
		
		if (!skipApply) {
			$scope.$apply();
		}
	};
	
	this.getNumber = function(str, size) {
		if (str.indexOf('%') != -1) {
			var num = Number(str.replace('%',''));
			return Math.round(num/100 * size);
			
		} else {
			return that.getComputedNum(str);
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

