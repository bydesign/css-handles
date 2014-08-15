angular.module('page', []).directive('page', [function($document){
	return {
		restrict: 'E',
		templateUrl: 'frame.html',
		scope: {
			source: '@',
			onSelect: '=',
			onLoad: '=',
			pannable: '=',
			html: '=',
			css: '=',
		},
		link: function($scope, element, attr, ctrl) {
			this.$page = element.find('#page');
			this.doc = this.$page[0].contentWindow.document;
			this.$doc = $(doc);
			this.sheetsDict = {};
			var that = this;
			
			$scope.$watch('html', function(newHtml, oldHtml) {
				var doc = that.doc;
				doc.open();
				doc.write(newHtml);
				doc.close();
				that.$doc.find('body').click(function(event) {
					$scope.onSelect(event.target);
				});
			});
			
			$scope.$watch('css', function(newSheets, oldSheets) {
				console.log(newSheets);
				console.log(oldSheets);
				/*angular.forEach(newSheets, function(sheet, index) {
					if (sheet != oldSheets[index]) {
						that.$doc.find('#'+sheet.elementId).html(sheet.text);
					}
				});*/
			});
			
			this.$page.load(function() {
				angular.forEach($scope.sheets, function(sheet) {
					that.sheetsDict[sheet.href] = sheet;
				});
				that.replaceStyleSheets();
			});
			
			this.replaceStyleSheets = function() {
				var sheetNum = that.doc.styleSheets.length;
				var sheetsLoaded = 0;
				$scope.sheets = [];
				angular.forEach(doc.styleSheets, function(styleSheet) {
					var href = styleSheet.href;
					var sheet = that.sheetsDict[href];
					var styleId = 'styleSheet' + sheetsLoaded;
					if (sheet != undefined) {
						sheet.elementId = styleId;
						$scope.sheets.push(sheet);
						that.replaceStyleNode(styleSheet.ownerNode, styleId, sheet.text);
						sheetsLoaded++;
						
						if (sheetsLoaded == sheetNum) {
							$scope.onLoad($scope.sheets);
						}
						
					} else {
						$.get(href, function(data) {
							var hrefParts = href.split('/');
							var sheet = {
								filename: hrefParts[hrefParts.length-1],
								href: href,
								text: data,
								elementId: styleId
							};
							$scope.sheets.push(sheet);
							that.sheetsDict[href] = sheet;
							that.replaceStyleNode(styleSheet.ownerNode, styleId, data);
							//$scope.$apply();
							sheetsLoaded++;
							
							if (sheetsLoaded == sheetNum) {
								$scope.onLoad($scope.sheets);
							}
						});
					}
					//$scope.$apply();
				});
			};
			
			this.replaceStyleNode = function(sheetElement, styleId, data) {
				var element = $('<style type="text/css" id="'+styleId+'">'+data+'</style>');
				$(sheetElement).after(element).remove();
			};
			
			// track drag-n-drop
			/*var startX = 0, startY = 0, x = 0, y = 0, panX = 0, panY = 0;
			
			element.on('mousedown', function(event) {
				// Prevent default dragging of selected content
				event.preventDefault();
				panX = $scope.panX;
				panY = $scope.panY;
				startX = event.pageX;
				startY = event.pageY;
				$document.on('mousemove', mousemove);
				$document.on('mouseup', mouseup);
			});
			
			function mousemove(event) {
				y = event.pageY - startY;
				x = event.pageX - startX;
				$scope.panX = panX + x;
				$scope.panY = panY + y;
			}
			
			function mouseup() {
				$document.unbind('mousemove', mousemove);
				$document.unbind('mouseup', mouseup);
			}*/
		},
	};
}])